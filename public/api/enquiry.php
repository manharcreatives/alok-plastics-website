<?php
/**
 * Alok Plastics — Enquiry endpoint
 * Hostinger Premium (PHP only, no Node.js).
 * Accepts POST from the enquiry forms. Validates server-side. Sends email.
 * §14.1 architecture: static export + PHP endpoint.
 *
 * Deploy: upload this file to /public_html/api/enquiry.php on Hostinger.
 * Config: copy config.php.example → config.php and fill in SMTP credentials.
 *         config.php is NOT committed to git (.gitignore).
 *
 * Security measures:
 * - CSRF via Origin/Referer check
 * - Honeypot field (_honey must be empty)
 * - Rate limiting: one request per IP per 30 seconds (via file lock)
 * - Input validation mirrors the Zod schema in src/lib/enquiry-schema.ts
 * - Email injection prevention via header sanitation
 * - Content-Security-Policy header
 */

declare(strict_types=1);

// ── Config ────────────────────────────────────────────────────────────────────

$configPath = __DIR__ . '/config.php';
if (!file_exists($configPath)) {
    http_response_code(503);
    header('Content-Type: application/json');
    echo json_encode(['ok' => false, 'error' => 'Server configuration missing. Contact the site administrator.']);
    exit;
}
require $configPath;
// Config must define:
//   $ALOK_TO_EMAIL     = 'enquiry@alokplastics.com'; // TODO(client)
//   $ALOK_FROM_EMAIL   = 'noreply@alokplastics.com'; // Hostinger SMTP sender
//   $ALOK_SMTP_HOST    = 'smtp.hostinger.com';
//   $ALOK_SMTP_PORT    = 465;
//   $ALOK_SMTP_USER    = 'noreply@alokplastics.com';
//   $ALOK_SMTP_PASS    = '...';
//   $ALOK_SITE_URL     = 'https://alokplastics.com';
//   $ALOK_RATE_DIR     = sys_get_temp_dir(); // writable dir for rate-limit files

// ── Security headers ─────────────────────────────────────────────────────────

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header("Content-Security-Policy: default-src 'none'");
header("Access-Control-Allow-Origin: {$ALOK_SITE_URL}");
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    die(json_encode(['ok' => false, 'error' => 'Method not allowed.']));
}

// ── Origin check ─────────────────────────────────────────────────────────────

$origin  = $_SERVER['HTTP_ORIGIN']  ?? '';
$referer = $_SERVER['HTTP_REFERER'] ?? '';

$allowedOrigins = [$ALOK_SITE_URL, 'http://localhost:3000', 'http://localhost:3001'];
$originOk = in_array(rtrim($origin, '/'), $allowedOrigins, true)
         || (empty($origin) && str_starts_with($referer, $ALOK_SITE_URL));

if (!$originOk) {
    http_response_code(403);
    die(json_encode(['ok' => false, 'error' => 'Forbidden.']));
}

// ── Rate limiting (one submit per IP per 30s) ─────────────────────────────────

$ip       = hash('sha256', $_SERVER['REMOTE_ADDR'] ?? 'unknown'); // hash for privacy
$lockFile = rtrim($ALOK_RATE_DIR, '/') . '/alok_rate_' . $ip . '.lock';
$now      = time();
$window   = 30; // seconds

if (file_exists($lockFile)) {
    $lastRequest = (int) file_get_contents($lockFile);
    if ($now - $lastRequest < $window) {
        http_response_code(429);
        die(json_encode(['ok' => false, 'error' => 'Too many requests. Please wait a moment and try again.']));
    }
}
file_put_contents($lockFile, (string) $now, LOCK_EX);

// ── Read POST data ────────────────────────────────────────────────────────────

$contentType = $_SERVER['CONTENT_TYPE'] ?? '';
if (str_contains($contentType, 'application/json')) {
    $body = json_decode(file_get_contents('php://input'), true) ?? [];
} else {
    $body = $_POST;
}

// ── Honeypot ──────────────────────────────────────────────────────────────────

if (!empty($body['_honey'])) {
    // Silently succeed — don't tell bots they failed
    http_response_code(200);
    die(json_encode(['ok' => true, 'message' => 'Thank you for your enquiry.']));
}

// ── Input validation ─────────────────────────────────────────────────────────

$errors = [];

function sanitize(string $value): string {
    return trim(htmlspecialchars(strip_tags($value), ENT_QUOTES, 'UTF-8'));
}

function validatePhone(string $phone): bool {
    // Mirrors enquiry-schema.ts: digits, +, -, spaces, parentheses; 7-15 digits total.
    if (!preg_match('/^[0-9+\-\s()]+$/', $phone)) return false;
    $digits = strlen(preg_replace('/\D/', '', $phone));
    return $digits >= 7 && $digits <= 15;
}

function validateGstin(string $gstin): bool {
    return (bool) preg_match('/^\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/', strtoupper($gstin));
}

function validateEmail(string $email): bool {
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

// Required fields: name, company, phone. Optional: email, city, state, GSTIN, message.
$name    = sanitize((string) ($body['name'] ?? ''));
$company = sanitize((string) ($body['company'] ?? ''));
$phone   = sanitize((string) ($body['phone'] ?? ''));
$message = sanitize((string) ($body['message'] ?? ''));

if (mb_strlen($name) < 2)    $errors['name']    = 'Name is required (min 2 characters).';
if (mb_strlen($company) < 2) $errors['company'] = 'Company name is required.';
if (!validatePhone($phone))   $errors['phone']   = 'Enter a valid phone number.';
// message (Additional notes) is optional — only the max length is enforced below.

// Optional fields
$email     = sanitize((string) ($body['email'] ?? ''));
$product   = sanitize((string) ($body['product'] ?? 'Not specified'));
$quantity  = (int) ($body['quantity'] ?? 0);
$unit      = in_array($body['quantityUnit'] ?? '', ['pcs', 'sets']) ? $body['quantityUnit'] : 'pcs';
$city      = sanitize((string) ($body['city'] ?? ''));
$state     = sanitize((string) ($body['state'] ?? ''));
$gstin     = strtoupper(sanitize((string) ($body['gstin'] ?? '')));
$buyerType = sanitize((string) ($body['buyerType'] ?? 'other'));
$source    = sanitize((string) ($body['_source'] ?? 'unknown'));

if ($email !== '' && !validateEmail($email)) {
    $errors['email'] = 'Enter a valid email address.';
}
if ($gstin !== '' && !validateGstin($gstin)) {
    $errors['gstin'] = 'Enter a valid GSTIN (15 characters).';
}

// Length caps
if (mb_strlen($name)    > 80)   $errors['name']    = 'Name is too long.';
if (mb_strlen($company) > 100)  $errors['company'] = 'Company name is too long.';
if (mb_strlen($message) > 2000) $errors['message'] = 'Message is too long.';

if (!empty($errors)) {
    http_response_code(422);
    die(json_encode(['ok' => false, 'errors' => $errors]));
}

// ── Build email ───────────────────────────────────────────────────────────────

$subject = "New Enquiry from {$name} ({$company}) — Alok Plastics";

$emailBody  = "New enquiry received via the Alok Plastics website.\n\n";
$emailBody .= "─────────────────────────────────────────\n";
$emailBody .= "Contact Information\n";
$emailBody .= "─────────────────────────────────────────\n";
$emailBody .= "Name:       {$name}\n";
$emailBody .= "Company:    {$company}\n";
$emailBody .= "Phone:      {$phone}\n";
if ($email) $emailBody .= "Email:      {$email}\n";
if ($city)  $emailBody .= "City:       {$city}\n";
if ($state) $emailBody .= "State:      {$state}\n";
if ($gstin) $emailBody .= "GSTIN:      {$gstin}\n";
$emailBody .= "Buyer Type: {$buyerType}\n\n";
$emailBody .= "─────────────────────────────────────────\n";
$emailBody .= "Product / Requirement\n";
$emailBody .= "─────────────────────────────────────────\n";
$emailBody .= "Product:    {$product}\n";
if ($quantity > 0) $emailBody .= "Quantity:   {$quantity} {$unit}\n";
if ($message !== '') $emailBody .= "\nMessage:\n{$message}\n";
$emailBody .= "\n";
$emailBody .= "─────────────────────────────────────────\n";
$emailBody .= "Source: {$source}\n";
$emailBody .= "Submitted: " . date('d M Y H:i:s') . " IST\n";

// Email headers — prevent header injection via sanitized values
$fromDisplay = preg_replace('/[^\w\s]/', '', $name);
$headers  = "From: \"Alok Plastics Website\" <{$ALOK_FROM_EMAIL}>\r\n";
$headers .= "Reply-To: {$ALOK_FROM_EMAIL}\r\n";
if ($email) $headers .= "Cc: {$email}\r\n"; // CC the enquirer if they provided email
$headers .= "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/plain; charset=utf-8\r\n";
$headers .= "Content-Transfer-Encoding: 8bit\r\n";
$headers .= "X-Mailer: Alok-Plastics-PHP-Mailer/1.0\r\n";

// ── Send via PHP mail() ───────────────────────────────────────────────────────
// Hostinger supports php mail() on their shared plans.
// For SMTP: install PHPMailer via Composer and use $ALOK_SMTP_* constants.
// See docs/deploy-hostinger.md for SMTP setup instructions.

$sent = mail(
    $ALOK_TO_EMAIL,
    mb_encode_mimeheader($subject, 'UTF-8'),
    $emailBody,
    $headers,
);

if (!$sent) {
    // Mail failed — don't expose details; WhatsApp fallback is primary channel
    http_response_code(500);
    die(json_encode([
        'ok' => false,
        'error' => 'Email delivery failed. Please use WhatsApp or call us directly.',
    ]));
}

// ── Success ───────────────────────────────────────────────────────────────────

http_response_code(200);
echo json_encode([
    'ok'      => true,
    'message' => 'Thank you for your enquiry. We will respond within one business day.',
]);
