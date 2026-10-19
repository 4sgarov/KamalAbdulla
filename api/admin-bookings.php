<?php
/**
 * Admin üçün rezervasiya API-si. Hər sorğuda X-Admin-User və X-Admin-Password
 * başlıqları serverdə yoxlanılır (admin-config.php-dəki PBKDF2 hash ilə).
 *
 * GET              → bütün rezervasiyalar: {"bookings": [...]}
 * POST (JSON)      → {"action": "login"}                      — yalnız girişi yoxlayır
 *                    {"action": "approve"|"reject"|"pending"|"delete", "id": "..."}
 *
 * Təsdiqlənən rezervasiya həmin gün və saatı tutur — saytda "Dolu" görünür.
 * Eyni saat üçün ikinci rezervasiyanı təsdiqləmək olmaz (409).
 */
declare(strict_types=1);

require __DIR__ . '/lib.php';
require __DIR__ . '/admin-config.php';

function check_admin(): void
{
    $user = (string)($_SERVER['HTTP_X_ADMIN_USER'] ?? '');
    $pass = (string)($_SERVER['HTTP_X_ADMIN_PASSWORD'] ?? '');
    $hash = hash_pbkdf2('sha256', $pass, ADMIN_PASSWORD_SALT, ADMIN_PASSWORD_ITERATIONS);
    $ok = hash_equals(ADMIN_USERNAME, $user) & hash_equals(ADMIN_PASSWORD_HASH, $hash);
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
    respond(200, ['bookings' => $bookings]);
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
        foreach ($bookings as $i => $b) {
            if ($i !== $index && ($b['status'] ?? '') === 'approved'
                && ($b['date'] ?? '') === $target['date'] && ($b['time'] ?? '') === $target['time']) {
                close_store($fh);
                respond(409, ['error' => 'Bu gün və saat üçün artıq başqa rezervasiya təsdiqlənib.']);
            }
        }
    }
    $bookings[$index]['status'] = $statuses[$action];
    $bookings[$index]['updated_at'] = date('c');
}

write_store($fh, $bookings);
close_store($fh);

respond(200, ['ok' => true]);
