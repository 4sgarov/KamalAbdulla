<?php
/**
 * Payriff ödənişindən sonra çağırılır (?booking=ID).
 *
 * - Payriff serveri status dəyişəndə bura POST göndərir.
 * - Ziyarətçinin brauzeri ödənişdən sonra bura qayıda bilər (GET).
 *
 * Callback imzalanmadığı üçün məzmununa etibar edilmir: sifarişin statusu
 * Payriff API-dən yoxlanılır və rezervasiyada "payment" yenilənir
 * (paid / failed / unpaid). Brauzer saytın rezervasiya bölməsinə nəticə ilə
 * qaytarılır; Payriff-ə həmişə 200 cavab verilir ki, təkrar göndərməsin.
 */
declare(strict_types=1);

require __DIR__ . '/lib.php';

$bookingId = (string)($_GET['booking'] ?? '');
$isBrowser = ($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'GET';
$result = 'pending';

if (preg_match('/^[a-f0-9]{16}$/', $bookingId) === 1) {
    $fh = open_store(true);
    $bookings = read_store($fh);
    foreach ($bookings as $i => $b) {
        if (($b['id'] ?? '') !== $bookingId || empty($b['payriff_order_id'])) continue;
        $status = payriff_order_status((string)$b['payriff_order_id']);
        if ($status === 'paid') {
            $bookings[$i]['payment'] = 'paid';
            $bookings[$i]['paid_at'] = $b['paid_at'] ?? date('c');
        } elseif ($status === 'failed' && ($b['payment'] ?? '') !== 'paid') {
            $bookings[$i]['payment'] = 'failed';
        }
        $result = $bookings[$i]['payment'] ?? 'unpaid';
        write_store($fh, $bookings);
        break;
    }
    close_store($fh);
}

if ($isBrowser) {
    $param = $result === 'paid' ? 'success' : ($result === 'failed' ? 'fail' : 'pending');
    header('Location: /?payment=' . $param . '#booking', true, 303);
    exit;
}

respond(200, ['ok' => true]);
