<?php

declare(strict_types=1);

require __DIR__ . '/_bootstrap.php';

try {
    $body = AlokShop::boot('POST');
    if (!empty($body['_honey'])) {
        AlokShop::respond(200, ['ok' => true]);
    }
    $ip = AlokShop::clientIp();
    if (!AlokShop::rateLimit('career:' . $ip, 5, 3600)) {
        AlokShop::respond(429, ['ok' => false, 'error' => 'Too many submissions. Please try again later.']);
    }
    $name = AlokShop::clean($body['name'] ?? '', 80);
    $phoneRaw = AlokShop::clean($body['phone'] ?? '', 30);
    $phone = AlokShop::phone($phoneRaw);
    $email = AlokShop::clean($body['email'] ?? '', 120);
    $position = AlokShop::clean($body['position'] ?? '', 120);
    $message = AlokShop::clean($body['message'] ?? '', 2000, true);
    $link = AlokShop::safeUrl((string) ($body['resumeUrl'] ?? ''));
    $errors = [];
    if (mb_strlen($name) < 2) {
        $errors['name'] = 'Enter your full name.';
    }
    if ($phone === null) {
        $errors['phone'] = 'Enter a valid 10-digit mobile number.';
    }
    if ($email === '' || filter_var($email, FILTER_VALIDATE_EMAIL) === false) {
        $errors['email'] = 'Enter a valid email address.';
    }
    if ($position === '') {
        $errors['position'] = 'Select the position you are applying for.';
    }
    if (trim((string) ($body['resumeUrl'] ?? '')) !== '' && $link === '') {
        $errors['resumeUrl'] = 'Enter a valid link.';
    }
    $upload = ['file' => null, 'error' => null];
    if (isset($_FILES['resume']) && is_array($_FILES['resume'])) {
        $upload = AlokShop::storeResume($_FILES['resume']);
        if ($upload['error'] !== null) {
            $errors['resume'] = $upload['error'];
        }
    }
    if (!isset($errors['resume']) && !isset($errors['resumeUrl']) && $upload['file'] === null && $link === '') {
        $errors['resume'] = 'Attach your resume or share a link to it.';
    }
    if ($errors) {
        if ($upload['file'] !== null) {
            @unlink(AlokShop::resumeDir() . '/' . $upload['file']['stored']);
        }
        AlokShop::respond(422, ['ok' => false, 'errors' => $errors]);
    }
    $file = $upload['file'];
    $app = AlokShop::applications()->insert([
        'name' => $name,
        'phone' => '+' . $phone,
        'email' => $email,
        'position' => $position,
        'resume_link' => $link,
        'resume_file' => $file['stored'] ?? '',
        'resume_name' => $file['original'] ?? '',
        'resume_size' => $file['size'] ?? 0,
        'message' => $message,
        'status' => 'new',
        'notes' => [],
        'ip' => $ip,
    ]);
    $when = AlokShop::fmt((int) $app['created_at'], 'd M Y, H:i:s');
    $mailBody = "New career application received via the Alok Plastics website.\n\n"
        . "Name:      {$name}\nPhone:     +{$phone}\nEmail:     {$email}\nPosition:  {$position}\n"
        . ($link !== '' ? "Resume link: {$link}\n" : '')
        . ($file ? "Resume file: {$file['original']} (kept in the admin panel under Applications)\n" : '')
        . ($message !== '' ? "\nMessage:\n{$message}\n" : '')
        . "\nSubmitted: {$when}\nIP: {$ip}\n";
    $mailed = AlokShop::mailClient('Career application: ' . $name . ' — ' . $position, $mailBody, $email);
    $payload = [
        'type' => 'career',
        'name' => $name,
        'phone' => '+' . $phone,
        'email' => $email,
        'position' => $position,
        'resumeLink' => $link,
        'message' => $message,
        'time' => AlokShop::fmt((int) $app['created_at'], 'Y-m-d H:i:s'),
        'ip' => $ip,
        'applicationId' => (int) $app['id'],
    ];
    if ($file !== null) {
        $path = AlokShop::resumePath($file['stored']);
        $payload['resumeName'] = $file['original'];
        $payload['resumeBase64'] = $path !== null ? base64_encode((string) file_get_contents($path)) : '';
    }
    $sheeted = AlokShop::postToGas($payload);
    AlokShop::applications()->update((int) $app['id'], ['mail_ok' => $mailed ? 1 : 0, 'gas_ok' => $sheeted ? 1 : 0]);
    AlokShop::respond(200, ['ok' => true, 'message' => 'Thank you. Your application has been received.']);
} catch (Throwable $e) {
    error_log('[alok-career] ' . $e->getMessage());
    AlokShop::respond(500, ['ok' => false, 'error' => 'We could not submit your application. Please try again.']);
}
