<?php
/**
 * Rezervasiyalar üçün ictimai API.
 *
 * GET  ?date=YYYY-MM-DD  → həmin gün təsdiqlənmiş (dolu) saatlar və saat başı qiymət:
 *                          {"booked": ["12:00", ...], "price_per_hour": 25}
 *                          (şəxsi məlumat qaytarılmır)
 * POST (JSON)            → yeni rezervasiya sorğusu (time — başlanğıc, end — bitmə),
 *                          status "pending". Saatlar yalnız admin təsdiqlədikdən sonra
 *                          dolu sayılır; aralıq təsdiqlənmiş saata düşərsə 409 qaytarır.
 */
declare(strict_types=1);

require __DIR__ . '/lib.php';

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET') {
    $date = (string)($_GET['date'] ?? '');
    if (!valid_date($date)) {
        respond(400, ['error' => 'Tarix düzgün deyil.']);
    }
    $fh = open_store(false);
    $bookings = read_store($fh);
    close_store($fh);
    respond(200, ['booked' => booked_times($bookings, $date), 'price_per_hour' => get_settings()['price_per_hour']]);
}

if ($method !== 'POST') {
    respond(405, ['error' => 'Bu əməliyyat dəstəklənmir.']);
}

$input = json_decode((string)file_get_contents('php://input'), true);
if (!is_array($input)) {
    respond(400, ['error' => 'Məlumat düzgün göndərilmədi.']);
}

$name = trim((string)($input['name'] ?? ''));
$phone = trim((string)($input['phone'] ?? ''));
$date = (string)($input['date'] ?? '');
$time = (string)($input['time'] ?? '');
$end = (string)($input['end'] ?? '');
$message = trim((string)($input['message'] ?? ''));

if ($name === '' || mb_strlen($name) > 120) respond(422, ['error' => 'Zəhmət olmasa ad və soyadınızı yazın.']);
if ($phone === '' || mb_strlen($phone) > 40) respond(422, ['error' => 'Telefon nömrənizi yazın.']);
if (!valid_date($date)) respond(422, ['error' => 'Kalendardan tarix seçin.']);
if (!in_array($time, TIME_SLOTS, true)) respond(422, ['error' => 'Başlanğıc saatını seçin.']);
if (!valid_end($time, $end)) respond(422, ['error' => 'Bitmə saatını seçin.']);
if (mb_strlen($message) > 2000) $message = mb_substr($message, 0, 2000);

$slotStart = DateTime::createFromFormat('Y-m-d H:i', $date . ' ' . $time);
if ($slotStart <= new DateTime()) {
    respond(422, ['error' => 'Keçmiş vaxtı seçmək olmaz.']);
}

$fh = open_store(true);
$bookings = read_store($fh);

if (array_intersect(range_hours($time, $end), booked_times($bookings, $date))) {
    close_store($fh);
    respond(409, ['error' => 'Seçdiyiniz aralıqda dolu saat var. Başqa vaxt seçin.', 'booked' => booked_times($bookings, $date)]);
}

/* Qiymət serverdə hesablanır — brauzerdən gələn məbləğə etibar edilmir */
$pricePerHour = get_settings()['price_per_hour'];

$booking = [
    'id' => bin2hex(random_bytes(8)),
    'name' => $name,
    'phone' => $phone,
    'date' => $date,
    'time' => $time,
    'end' => $end,
    'message' => $message,
    'price_per_hour' => $pricePerHour,
    'total' => $pricePerHour * count(range_hours($time, $end)),
    'status' => 'pending',
    'created_at' => date('c'),
];
$bookings[] = $booking;

write_store($fh, $bookings);
close_store($fh);

respond(201, ['ok' => true, 'id' => $booking['id'], 'total' => $booking['total']]);
