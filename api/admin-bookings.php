<?php
/**
 * Admin üçün rezervasiya API-si. Hər sorğuda X-Admin-User və X-Admin-Password
 * başlıqları serverdə yoxlanılır (PBKDF2 hash ilə). Şifrə admin paneldən
 * dəyişdirilibsə hash data/admin-auth.php-dədir, yoxdursa admin-config.php-dən.
 *
 * GET              → bütün rezervasiyalar və ayarlar: {"bookings": [...], "settings": {...}}
 * POST (JSON)      → {"action": "login"}                      — yalnız girişi yoxlayır
 *                    {"action": "approve"|"reject"|"pending"|"delete", "id": "..."}
 *                    {"action": "change_password", "new_password": "..."}
 *                    {"action": "set_price", "price_per_hour": 25}
 *
 * Təsdiqlənən rezervasiya həmin gün saat aralığını tutur — saytda "Dolu" görünür.
 * Aralığı başqa təsdiqlənmiş rezervasiya ilə üst-üstə düşəni təsdiqləmək olmaz (409).
 */
declare(strict_types=1);

require __DIR__ . '/lib.php';
require __DIR__ . '/admin-config.php';

/** Aktiv şifrə hash-i: paneldən dəyişdirilibsə data/admin-auth.php, yoxsa admin-config.php */
function admin_auth(): array
{
    $saved = read_json_file(AUTH_FILE);
    if (!empty($saved['salt']) && !empty($saved['hash']) && !empty($saved['iterations'])) {
        return $saved;
    }
    return ['salt' => ADMIN_PASSWORD_SALT, 'iterations' => ADMIN_PASSWORD_ITERATIONS, 'hash' => ADMIN_PASSWORD_HASH];
}

function check_admin(): void
{
    $user = (string)($_SERVER['HTTP_X_ADMIN_USER'] ?? '');
    $pass = (string)($_SERVER['HTTP_X_ADMIN_PASSWORD'] ?? '');
    $auth = admin_auth();
    $hash = hash_pbkdf2('sha256', $pass, $auth['salt'], (int)$auth['iterations']);
    $ok = hash_equals(ADMIN_USERNAME, $user) & hash_equals($auth['hash'], $hash);
    if (!$ok) {
        usleep(400000); /* şifrə təxmin etməyi yavaşladır */
        respond(401, ['error' => 'İstifadəçi adı və ya şifrə yanlışdır.']);
    }
}

check_admin();

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET') {
    $fh = open_store(false);
    $bookings = read_store($fh);
    close_store($fh);
    usort($bookings, fn($a, $b) => strcmp(($b['date'] ?? '') . ($b['time'] ?? ''), ($a['date'] ?? '') . ($a['time'] ?? '')));
    respond(200, ['bookings' => $bookings, 'settings' => get_settings()]);
}

if ($method !== 'POST') {
    respond(405, ['error' => 'Bu əməliyyat dəstəklənmir.']);
}

$input = json_decode((string)file_get_contents('php://input'), true);
$action = (string)($input['action'] ?? '');
$id = (string)($input['id'] ?? '');

if ($action === 'login') {
    respond(200, ['ok' => true]);
}

if ($action === 'change_password') {
    $new = (string)($input['new_password'] ?? '');
    if (mb_strlen($new) < 8) {
        respond(422, ['error' => 'Yeni şifrə ən azı 8 simvol olmalıdır.']);
    }
    $salt = bin2hex(random_bytes(16));
    $iterations = 200000;
    $saved = write_json_file(AUTH_FILE, [
        'salt' => $salt,
        'iterations' => $iterations,
        'hash' => hash_pbkdf2('sha256', $new, $salt, $iterations),
        'updated_at' => date('c'),
    ]);
    if (!$saved) respond(500, ['error' => 'Şifrəni yadda saxlamaq olmadı.']);
    respond(200, ['ok' => true]);
}

if ($action === 'set_price') {
    $price = $input['price_per_hour'] ?? null;
    if (!is_numeric($price) || (int)$price < 0 || (int)$price > 100000 || (int)$price != $price) {
        respond(422, ['error' => 'Qiyməti tam ədəd kimi yazın (AZN).']);
    }
    $settings = get_settings();
    $settings['price_per_hour'] = (int)$price;
    if (!write_json_file(SETTINGS_FILE, $settings)) respond(500, ['error' => 'Ayarları yadda saxlamaq olmadı.']);
    respond(200, ['ok' => true, 'settings' => $settings]);
}

$statuses = ['approve' => 'approved', 'reject' => 'rejected', 'pending' => 'pending'];
if (!isset($statuses[$action]) && $action !== 'delete') {
    respond(400, ['error' => 'Naməlum əməliyyat.']);
}

$fh = open_store(true);
$bookings = read_store($fh);

$index = null;
foreach ($bookings as $i => $b) {
    if (($b['id'] ?? '') === $id) { $index = $i; break; }
}
if ($index === null) {
    close_store($fh);
    respond(404, ['error' => 'Rezervasiya tapılmadı.']);
}

if ($action === 'delete') {
    array_splice($bookings, $index, 1);
} else {
    $target = $bookings[$index];
    if ($action === 'approve') {
        $targetHours = range_hours((string)$target['time'], booking_end($target));
        foreach ($bookings as $i => $b) {
            if ($i !== $index && ($b['status'] ?? '') === 'approved' && ($b['date'] ?? '') === $target['date']
                && array_intersect($targetHours, range_hours((string)$b['time'], booking_end($b)))) {
                close_store($fh);
                respond(409, ['error' => 'Bu aralıq başqa təsdiqlənmiş rezervasiya ilə üst-üstə düşür.']);
            }
        }
    }
    $bookings[$index]['status'] = $statuses[$action];
    $bookings[$index]['updated_at'] = date('c');
}

write_store($fh, $bookings);
close_store($fh);

respond(200, ['ok' => true]);
