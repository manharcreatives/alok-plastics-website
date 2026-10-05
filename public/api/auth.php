<?php

declare(strict_types=1);

require __DIR__ . '/_bootstrap.php';

try {
    $body = AlokShop::boot('POST');
    $action = (string) ($body['action'] ?? '');
    $ip = AlokShop::clientIp();

    if ($action === 'request') {
        $name = AlokShop::clean($body['name'] ?? '', 80);
        $phone = AlokShop::phone((string) ($body['phone'] ?? ''));
        $errors = [];
        if (mb_strlen($name) < 2) {
            $errors['name'] = 'Enter your full name.';
        }
        if ($phone === null) {
            $errors['phone'] = 'Enter a valid 10-digit mobile number.';
        }
        if ($errors) {
            AlokShop::respond(422, ['ok' => false, 'errors' => $errors]);
        }
        if (!AlokShop::rateLimit('otp:' . $phone, 5, 3600) || !AlokShop::rateLimit('otpip:' . $ip, 15, 3600)) {
            AlokShop::respond(429, ['ok' => false, 'error' => 'Too many attempts. Please try again later.']);
        }
        $res = AlokShop::sendOtp((string) $phone, $name);
        if (!$res['ok']) {
            $status = ($res['code'] ?? '') === 'cooldown' ? 429 : 503;
            AlokShop::respond($status, ['ok' => false, 'code' => $res['code'] ?? 'error', 'error' => $res['error'] ?? 'Could not send the code.']);
        }
        $out = ['ok' => true, 'message' => 'A 6-digit code has been sent to your mobile.'];
        if (isset($res['devCode'])) {
            $out['devCode'] = $res['devCode'];
        }
        AlokShop::respond(200, $out);
    }

    if ($action === 'verify') {
        $name = AlokShop::clean($body['name'] ?? '', 80);
        $phone = AlokShop::phone((string) ($body['phone'] ?? ''));
        $code = preg_replace('/\D/', '', (string) ($body['code'] ?? '')) ?? '';
        if (mb_strlen($name) < 2 || $phone === null || strlen($code) !== 6) {
            AlokShop::respond(422, ['ok' => false, 'error' => 'Enter your name, mobile number and the 6-digit code.']);
        }
        if (!AlokShop::rateLimit('verip:' . $ip, 30, 900)) {
            AlokShop::respond(429, ['ok' => false, 'error' => 'Too many attempts. Please try again later.']);
        }
        if (!AlokShop::verifyOtp($phone, $code)) {
            AlokShop::respond(401, ['ok' => false, 'error' => 'That code is incorrect or has expired.']);
        }
        $customer = AlokShop::upsertCustomer($phone, $name);
        $token = AlokShop::startSession($customer);
        AlokShop::respond(200, ['ok' => true, 'token' => $token, 'user' => ['name' => $customer['name'], 'phone' => $customer['phone']]]);
    }

    if ($action === 'me') {
        $c = AlokShop::customerFromRequest();
        if ($c === null) {
            AlokShop::respond(401, ['ok' => false, 'error' => 'Session expired.']);
        }
        AlokShop::respond(200, ['ok' => true, 'user' => ['name' => $c['name'], 'phone' => $c['phone']]]);
    }

    if ($action === 'logout') {
        AlokShop::endSession();
        AlokShop::respond(200, ['ok' => true]);
    }

    AlokShop::respond(400, ['ok' => false, 'error' => 'Unknown action.']);
} catch (Throwable $e) {
    error_log('[alok-auth] ' . $e->getMessage());
    AlokShop::respond(500, ['ok' => false, 'error' => 'Something went wrong. Please try again.']);
}
