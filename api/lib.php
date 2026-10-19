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
 *
 * Rezervasiya saat aralığıdır: "time" — başlanğıc, "end" — bitmə (məs. 12:00–14:00).
 * Köhnə rezervasiyalarda "end" yoxdursa, bir saat sayılır.
 */
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

/* Başlanğıc saatları; bitmə saatı başlanğıcdan sonrakı istənilən tam saat ola bilər (ən gec END_LIMIT) */
const TIME_SLOTS = ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'];
const END_LIMIT = '21:00';
const DATA_FILE = __DIR__ . '/../data/bookings.php';
const SETTINGS_FILE = __DIR__ . '/../data/settings.php';
const AUTH_FILE = __DIR__ . '/../data/admin-auth.php';
const DEFAULT_SETTINGS = ['price_per_hour' => 25, 'payriff_secret' => ''];
const PAYRIFF_API = 'https://api.payriff.com';
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

function hour_of(string $time): int
{
    return (int)substr($time, 0, 2);
}

function booking_end(array $b): string
{
    if (!empty($b['end'])) return (string)$b['end'];
    return sprintf('%02d:00', hour_of((string)($b['time'] ?? '00:00')) + 1);
}

/** Aralığın tutduğu saatlar: 12:00–14:00 → ['12:00', '13:00'] */
function range_hours(string $start, string $end): array
{
    $hours = [];
    for ($h = hour_of($start); $h < hour_of($end); $h++) {
        $hours[] = sprintf('%02d:00', $h);
    }
    return $hours;
}

/** Bitmə saatı düzgündürmü: tam saat, başlanğıcdan sonra, END_LIMIT-dən gec deyil */
function valid_end(string $start, string $end): bool
{
    return preg_match('/^\d{2}:00$/', $end) === 1
        && hour_of($end) > hour_of($start)
        && hour_of($end) <= hour_of(END_LIMIT);
}

/** Həmin gün admin tərəfindən təsdiqlənmiş (dolu) saatlar — hər tutulmuş saatın başlanğıcı */
function booked_times(array $bookings, string $date): array
{
    $times = [];
    foreach ($bookings as $b) {
        if (($b['date'] ?? '') === $date && ($b['status'] ?? '') === 'approved') {
            $times = array_merge($times, range_hours((string)$b['time'], booking_end($b)));
        }
    }
    sort($times);
    return array_values(array_unique($times));
}

/* ---------- Kiçik JSON fayllar (ayarlar, admin şifrəsi) ----------
   data/ qovluğunda, bookings.php kimi PHP "exit" sətri ilə qorunur. */
function read_json_file(string $path): array
{
    if (!is_file($path)) return [];
    $json = (string)file_get_contents($path);
    if (str_starts_with($json, DATA_GUARD)) {
        $json = substr($json, strlen(DATA_GUARD));
    }
    $data = json_decode($json, true);
    return is_array($data) ? $data : [];
}

function write_json_file(string $path, array $data): bool
{
    $dir = dirname($path);
    if (!is_dir($dir) && !mkdir($dir, 0755, true)) return false;
    return file_put_contents($path, DATA_GUARD . json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT), LOCK_EX) !== false;
}

/** Admin paneldən dəyişən ayarlar (saat başı qiymət, AZN) */
function get_settings(): array
{
    $settings = array_merge(DEFAULT_SETTINGS, read_json_file(SETTINGS_FILE));
    $settings['price_per_hour'] = max(0, (int)$settings['price_per_hour']);
    $settings['payriff_secret'] = (string)$settings['payriff_secret'];
    return $settings;
}

/** Admin paneldə göstərilən ayarlar — Payriff açarının özü heç vaxt qaytarılmır */
function admin_settings(): array
{
    $s = get_settings();
    return ['price_per_hour' => $s['price_per_hour'], 'payriff_configured' => $s['payriff_secret'] !== ''];
}

/* ---------- Payriff ödənişi ----------
   Kart, Apple Pay və Google Pay Payriff-in ödəniş səhifəsində seçilir.
   Callback-lər imzalanmır — ödənişin statusu hər dəfə Payriff API-dən
   yoxlanılır (payriff_order_status), callback-in məzmununa etibar edilmir. */
function payriff_request(string $method, string $path, ?array $body = null): ?array
{
    $secret = get_settings()['payriff_secret'];
    if ($secret === '') return null;

    $headers = ['Authorization: ' . $secret, 'Content-Type: application/json', 'Accept: application/json'];
    $payload = $body === null ? null : json_encode($body, JSON_UNESCAPED_UNICODE);

    if (function_exists('curl_init')) {
        $ch = curl_init(PAYRIFF_API . $path);
        curl_setopt_array($ch, [
            CURLOPT_CUSTOMREQUEST => $method,
            CURLOPT_HTTPHEADER => $headers,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 20,
        ]);
        if ($payload !== null) curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
        $raw = curl_exec($ch);
        curl_close($ch);
    } else {
        $raw = @file_get_contents(PAYRIFF_API . $path, false, stream_context_create(['http' => [
            'method' => $method,
            'header' => implode("\r\n", $headers),
            'content' => $payload ?? '',
            'timeout' => 20,
            'ignore_errors' => true,
        ]]));
    }
    if (!is_string($raw) || $raw === '') return null;
    $data = json_decode($raw, true);
    return is_array($data) ? $data : null;
}

/** Payriff-də sifariş yaradır; ['order_id' => ..., 'payment_url' => ...] və ya null */
function payriff_create_order(float $amount, string $description, string $callbackUrl, string $language): ?array
{
    $res = payriff_request('POST', '/api/v3/orders', [
        'amount' => round($amount, 2),
        'language' => $language,
        'currency' => 'AZN',
        'description' => $description,
        'callbackUrl' => $callbackUrl,
        'cardSave' => false,
        'operation' => 'PURCHASE',
    ]);
    $payload = is_array($res['payload'] ?? null) ? $res['payload'] : [];
    if (empty($payload['orderId']) || empty($payload['paymentUrl'])) return null;
    return ['order_id' => (string)$payload['orderId'], 'payment_url' => (string)$payload['paymentUrl']];
}

/** Sifarişin Payriff-dəki statusu: "paid", "failed", "pending" və ya null (yoxlamaq olmadı) */
function payriff_order_status(string $orderId): ?string
{
    $res = payriff_request('GET', '/api/v3/orders/' . rawurlencode($orderId));
    $payload = $res['payload'] ?? null;
    $status = is_array($payload) ? strtoupper((string)($payload['paymentStatus'] ?? '')) : strtoupper((string)$payload);
    if ($status === '') return null;
    if (in_array($status, ['APPROVED', 'PAID', 'COMPLETED'], true)) return 'paid';
    if (in_array($status, ['DECLINED', 'CANCELED', 'EXPIRED', 'REVERSE', 'REFUNDED'], true)) return 'failed';
    return 'pending';
}

/** Saytın əsas ünvanı (callback və geri qayıtma linkləri üçün) */
function site_url(): string
{
    $scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
    return $scheme . '://' . ($_SERVER['HTTP_HOST'] ?? 'kamalabdulla.com');
}
