<?php

declare(strict_types=1);

require __DIR__ . '/_bootstrap.php';

try {
    $body = AlokShop::boot('POST');
    $customer = AlokShop::customerFromRequest();
    if ($customer === null) {
        AlokShop::respond(401, ['ok' => false, 'code' => 'auth', 'error' => 'Please sign in to place your order.']);
    }
    $ip = AlokShop::clientIp();
    if (!AlokShop::rateLimit('order:' . $customer['id'], 10, 3600) || !AlokShop::rateLimit('orderip:' . $ip, 30, 3600)) {
        AlokShop::respond(429, ['ok' => false, 'error' => 'Too many orders in a short time. Please try again later.']);
    }
    $items = AlokShop::cleanItems($body['items'] ?? []);
    if (!$items) {
        AlokShop::respond(422, ['ok' => false, 'error' => 'Your cart is empty.']);
    }
    $note = AlokShop::clean($body['note'] ?? '', 1000, true);
    $order = AlokShop::orders()->insert([
        'code' => AlokShop::orderCode(),
        'customer_id' => (int) $customer['id'],
        'name' => $customer['name'],
        'phone' => $customer['phone'],
        'items' => $items,
        'total' => AlokShop::orderTotal($items),
        'note' => $note,
        'status' => 'pending',
        'notes' => [],
        'ip' => $ip,
    ]);
    $text = AlokShop::orderText($order);
    $mailed = AlokShop::mailClient('New order ' . $order['code'] . ' — ' . $order['name'], str_replace('*', '', $text) . "\n", '');
    $sheeted = AlokShop::postToGas(['type' => 'order', 'code' => $order['code'], 'name' => $order['name'], 'phone' => '+' . $order['phone'], 'items' => $text, 'total' => $order['total'], 'time' => AlokShop::fmt((int) $order['created_at'], 'Y-m-d H:i:s'), 'ip' => $ip]);
    AlokShop::orders()->update((int) $order['id'], ['mail_ok' => $mailed ? 1 : 0, 'gas_ok' => $sheeted ? 1 : 0]);
    $number = AlokShop::waNumber();
    AlokShop::respond(200, [
        'ok' => true,
        'order' => ['code' => $order['code'], 'createdAt' => (int) $order['created_at'], 'total' => $order['total']],
        'wa' => ['number' => $number, 'text' => $text],
    ]);
} catch (Throwable $e) {
    error_log('[alok-order] ' . $e->getMessage());
    AlokShop::respond(500, ['ok' => false, 'error' => 'We could not place your order. Please try again or contact us on WhatsApp.']);
}
