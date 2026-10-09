<?php
/**
 * Rezervasiyalar üçün sadə API.
 *
 * GET  ?date=YYYY-MM-DD  → həmin gün dolu olan saatlar: {"booked": ["12:00", ...]}
 *                          (şəxsi məlumat qaytarılmır)
 * POST (JSON)            → yeni rezervasiya. Saat artıq doludursa 409 qaytarır.
 *
 * Məlumatlar ../data/bookings.php faylında saxlanılır. Fayl PHP "exit" sətri
 * ilə başlayır — brauzerdən açılsa belə boş cavab qaytarır (data/.htaccess
 * də qovluğu bağlayır, bu isə əlavə qorumadır). Eyni anda iki nəfər eyni saatı tutmasın deyə fayl
 * oxuma-yazma zamanı kilidlənir.
 */
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

const TIME_SLOTS = ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'];
const PAYMENT_METHODS = ['card', 'transfer', 'cash'];
const DATA_FILE = __DIR__ . '/../data/bookings.php';
const DATA_GUARD = "<?php http_response_code(404); exit; ?>\n";

date_default_timezone_set('Asia/Baku');

function respond(int $status, array $body): void
{
    http_response_code($status);
    echo json_encode($body, JSON_UNESCAPED_UNICODE);
    exit;
}

function valid_date(string $date): bool
{
    $d = DateTime::createFromFormat('!Y-m-d', $date);
    return $d !== false && $d->format('Y-m-d') === $date;
}

/** Faylı kilidləyib açır; $write = true olduqda yazmaq üçün eksklüziv kilid */
function open_store(bool $write)
{
    $dir = dirname(DATA_FILE);
    if (!is_dir($dir) && !mkdir($dir, 0755, true)) {
        respond(500, ['error' => 'Server xətası. Bir az sonra yenidən cəhd edin.']);
    }
    $fh = fopen(DATA_FILE, 'c+');
    if ($fh === false || !flock($fh, $write ? LOCK_EX : LOCK_SH)) {
        respond(500, ['error' => 'Server xətası. Bir az sonra yenidən cəhd edin.']);
    }
    return $fh;
}

function read_store($fh): array
{
    rewind($fh);
    $json = stream_get_contents($fh);
    if (str_starts_with($json, DATA_GUARD)) {
        $json = substr($json, strlen(DATA_GUARD));
    }
    $data = $json ? json_decode($json, true) : [];
    return is_array($data) ? $data : [];
}

function booked_times(array $bookings, string $date): array
{
    $times = [];
    foreach ($bookings as $b) {
        if (($b['date'] ?? '') === $date && ($b['status'] ?? '') !== 'cancelled') {
            $times[] = $b['time'];
        }
    }
    sort($times);
    return array_values(array_unique($times));
}

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET') {
    $date = (string)($_GET['date'] ?? '');
    if (!valid_date($date)) {
        respond(400, ['error' => 'Tarix düzgün deyil.']);
    }
    $fh = open_store(false);
    $bookings = read_store($fh);
    flock($fh, LOCK_UN);
    fclose($fh);
    respond(200, ['booked' => booked_times($bookings, $date)]);
}

if ($method !== 'POST') {
    respond(405, ['error' => 'Bu əməliyyat dəstəklənmir.']);
}

$input = json_decode((string)file_get_contents('php://input'), true);
if (!is_array($input)) {
    respond(400, ['error' => 'Məlumat düzgün göndərilmədi.']);
}

$name = trim((string)($input['name'] ?? ''));
$email = trim((string)($input['email'] ?? ''));
$phone = trim((string)($input['phone'] ?? ''));
$date = (string)($input['date'] ?? '');
$time = (string)($input['time'] ?? '');
$payment = (string)($input['payment'] ?? '');
$message = trim((string)($input['message'] ?? ''));

if ($name === '' || mb_strlen($name) > 120) respond(422, ['error' => 'Zəhmət olmasa ad və soyadınızı yazın.']);
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) respond(422, ['error' => 'Düzgün email ünvanı yazın.']);
if ($phone === '' || mb_strlen($phone) > 40) respond(422, ['error' => 'Telefon nömrənizi yazın.']);
if (!valid_date($date)) respond(422, ['error' => 'Kalendardan tarix seçin.']);
if (!in_array($time, TIME_SLOTS, true)) respond(422, ['error' => 'Saat seçin.']);
if (!in_array($payment, PAYMENT_METHODS, true)) respond(422, ['error' => 'Ödəniş növünü seçin.']);
if (mb_strlen($message) > 2000) $message = mb_substr($message, 0, 2000);

$slotStart = DateTime::createFromFormat('Y-m-d H:i', $date . ' ' . $time);
if ($slotStart <= new DateTime()) {
    respond(422, ['error' => 'Keçmiş vaxtı seçmək olmaz.']);
}

$fh = open_store(true);
$bookings = read_store($fh);

if (in_array($time, booked_times($bookings, $date), true)) {
    flock($fh, LOCK_UN);
    fclose($fh);
    respond(409, ['error' => 'Bu saat artıq doludur. Başqa saat seçin.', 'booked' => booked_times($bookings, $date)]);
}

$booking = [
    'id' => bin2hex(random_bytes(8)),
    'name' => $name,
    'email' => $email,
    'phone' => $phone,
    'date' => $date,
    'time' => $time,
    'payment' => $payment,
    'message' => $message,
    'status' => 'booked',
    'created_at' => date('c'),
];
$bookings[] = $booking;

ftruncate($fh, 0);
rewind($fh);
fwrite($fh, DATA_GUARD . json_encode($bookings, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
fflush($fh);
flock($fh, LOCK_UN);
fclose($fh);

respond(201, ['ok' => true, 'id' => $booking['id']]);
