<?php

declare(strict_types=1);

require __DIR__ . '/_bootstrap.php';

/**
 * Live cart sync. The website posts the visitor's cart here (debounced) so the admin panel can
 * see what customers are adding. Best-effort: the cart never depends on this call succeeding.
 * Anonymous until the visitor signs in; a valid session attaches name + mobile to the cart.
 */
try {
    $body = AlokShop::boot('POST');
    $visitor = (string) ($body['visitor'] ?? '');
    if (!preg_match('/^[a-zA-Z0-9_-]{16,64}$/', $visitor)) {
        AlokShop::respond(422, ['ok' => false, 'error' => 'Invalid visitor.']);
    }
    if (!AlokShop::rateLimit('cart:' . $visitor, 120, 3600) || !AlokShop::rateLimit('cartip:' . AlokShop::clientIp(), 600, 3600)) {
        AlokShop::respond(429, ['ok' => false, 'error' => 'Too many updates.']);
    }
    $lines = AlokShop::cleanCartLines($body['items'] ?? []);
    $customer = AlokShop::customerFromRequest();
    $carts = AlokShop::carts();

    $open = null;
    foreach ($carts->where('visitor', $visitor) as $c) {
        if (($c['status'] ?? '') === 'open') {
            $open = $c;
            break;
        }
    }

    // Housekeeping: drop carts untouched for 30 days.
    foreach ($carts->all() as $c) {
        if ((int) ($c['updated_at'] ?? 0) < time() - 30 * 86400) {
            $carts->delete((int) $c['id']);
        }
    }

    if (!$lines) {
        if ($open !== null) {
            $carts->delete((int) $open['id']);
        }
        AlokShop::respond(200, ['ok' => true]);
    }

    $patch = [
        'lines' => $lines,
        'name' => $customer['name'] ?? ($open['name'] ?? ''),
        'phone' => $customer['phone'] ?? ($open['phone'] ?? ''),
        'customer_id' => (int) ($customer['id'] ?? ($open['customer_id'] ?? 0)),
    ];
    if ($open !== null) {
        $carts->update((int) $open['id'], $patch);
    } else {
        $carts->insert($patch + ['visitor' => $visitor, 'status' => 'open', 'started_at' => time(), 'ip' => AlokShop::clientIp()]);
    }
    AlokShop::respond(200, ['ok' => true]);
} catch (Throwable $e) {
    error_log('[alok-cart] ' . $e->getMessage());
    AlokShop::respond(500, ['ok' => false, 'error' => 'Could not sync the cart.']);
}
