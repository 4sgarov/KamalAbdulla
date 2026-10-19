<?php
/**
 * bookings.php və admin-bookings.php üçün ortaq funksiyalar.
 *
 * Məlumatlar ../data/bookings.php faylında saxlanılır. Fayl PHP "exit" sətri
 * ilə başlayır — brauzerdən açılsa belə boş cavab qaytarır (data/.htaccess
 * də qovluğu bağlayır, bu isə əlavə qorumadır). Eyni anda iki sorğu faylı
 * pozmasın deyə oxuma-yazma zamanı fayl kilidlənir.
 *
 * Rezervasiya statusları: pending (gözləyir), approved (təsdiqlənib),
 * rejected (imtina). Saatı yalnız "approved" rezervasiya tutur.
 */
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

const TIME_SLOTS = ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'];
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

function write_store($fh, array $bookings): void
{
    ftruncate($fh, 0);
    rewind($fh);
    fwrite($fh, DATA_GUARD . json_encode(array_values($bookings), JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
    fflush($fh);
}

function close_store($fh): void
{
    flock($fh, LOCK_UN);
    fclose($fh);
}

/** Həmin gün admin tərəfindən təsdiqlənmiş (dolu) saatlar */
function booked_times(array $bookings, string $date): array
{
    $times = [];
    foreach ($bookings as $b) {
        if (($b['date'] ?? '') === $date && ($b['status'] ?? '') === 'approved') {
            $times[] = $b['time'];
        }
    }
    sort($times);
    return array_values(array_unique($times));
}
