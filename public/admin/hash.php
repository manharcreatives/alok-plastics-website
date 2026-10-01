<?php
/**
 * Alok Plastics admin — password hash generator.
 *
 * CLI (recommended):   php admin/hash.php
 * Browser (fallback):  https://yoursite/admin/hash.php — works ONLY until a valid admin user exists in
 *                      config.php; after that it answers 404. It only prints a hash; it never writes files.
 *                      Delete this file from the server once you are set up.
 */

declare(strict_types=1);

const MIN_LEN = 12;

function make_hash(string $password): string
{
    // bcrypt is available on every PHP 8 build; Argon2id is used when the host compiled it in.
    $algo = defined('PASSWORD_ARGON2ID') ? PASSWORD_ARGON2ID : PASSWORD_BCRYPT;
    $opts = $algo === PASSWORD_BCRYPT ? ['cost' => 12] : [];
    return password_hash($password, $algo, $opts);
}

if (PHP_SAPI === 'cli') {
    fwrite(STDOUT, "Alok Plastics admin: create a password hash\n");
    fwrite(STDOUT, 'Choose a password (at least ' . MIN_LEN . " characters; a few random words is good): ");
    $hidden = false;
    if (DIRECTORY_SEPARATOR === '/' && function_exists('shell_exec')) {
        @shell_exec('stty -echo 2>/dev/null');
        $hidden = true;
    }
    $p1 = rtrim((string) fgets(STDIN), "\r\n");
    if ($hidden) {
        fwrite(STDOUT, "\nRepeat it: ");
        $p2 = rtrim((string) fgets(STDIN), "\r\n");
        @shell_exec('stty echo 2>/dev/null');
        fwrite(STDOUT, "\n");
    } else {
        fwrite(STDOUT, "(your typing is visible in this terminal)\nRepeat it: ");
        $p2 = rtrim((string) fgets(STDIN), "\r\n");
    }
    if ($p1 !== $p2) { fwrite(STDERR, "The two entries do not match.\n"); exit(1); }
    if (mb_strlen($p1) < MIN_LEN) { fwrite(STDERR, 'Too short: use at least ' . MIN_LEN . " characters.\n"); exit(1); }
    fwrite(STDOUT, "\nPaste this into config.php as the 'hash' value:\n\n" . make_hash($p1) . "\n");
    exit(0);
}

/* ── Browser mode ─────────────────────────────────────────────────────────── */

header('Cache-Control: no-store');
header('X-Robots-Tag: noindex, nofollow');
header("Content-Security-Policy: default-src 'none'; style-src 'self'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'");
header('X-Frame-Options: DENY');

define('ALOK_ADMIN', true);
require __DIR__ . '/lib/core.php';
require __DIR__ . '/lib/auth.php';

if (AlokConfig::exists() && AlokAuth::configured()) {
    http_response_code(404);
    echo 'Not found.';
    exit;
}

$hash = null;
$error = null;
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'POST') {
    $p1 = (string) ($_POST['p1'] ?? '');
    $p2 = (string) ($_POST['p2'] ?? '');
    if ($p1 !== $p2) {
        $error = 'The two entries do not match.';
    } elseif (mb_strlen($p1) < MIN_LEN) {
        $error = 'Too short: use at least ' . MIN_LEN . ' characters.';
    } elseif (mb_strlen($p1) > 200) {
        $error = 'Too long: use at most 200 characters.';
    } else {
        $hash = make_hash($p1);
    }
}
$https = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || strtolower((string) ($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '')) === 'https';
?>
<!doctype html>
<html lang="en-IN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Create admin password hash</title>
<link rel="stylesheet" href="assets/admin.css">
</head>
<body class="bare">
<main class="main-bare">
<section class="card">
  <h1>Create an admin password hash</h1>
  <?php if (!$https): ?><p class="flash flash-warn" role="alert">This page is not on HTTPS. Do not type a real password here; use the command line instead.</p><?php endif; ?>
  <?php if ($hash !== null): ?>
    <p>Copy this whole line into <code>config.php</code> as the <code>'hash'</code> for your user:</p>
    <p><textarea readonly rows="3" aria-label="Password hash"><?= htmlspecialchars($hash, ENT_QUOTES, 'UTF-8') ?></textarea></p>
    <p class="meta">Nothing was saved. When <code>config.php</code> is in place this page switches itself off; then delete <code>hash.php</code> from the server.</p>
  <?php else: ?>
    <?php if ($error): ?><p class="flash flash-err" role="alert"><?= htmlspecialchars($error, ENT_QUOTES, 'UTF-8') ?></p><?php endif; ?>
    <form method="post" action="hash.php" autocomplete="off">
      <div class="field"><label for="p1">Choose a password (<?= MIN_LEN ?>+ characters)</label><input id="p1" name="p1" type="password" required minlength="<?= MIN_LEN ?>" maxlength="200" autocomplete="new-password"></div>
      <div class="field"><label for="p2">Repeat it</label><input id="p2" name="p2" type="password" required minlength="<?= MIN_LEN ?>" maxlength="200" autocomplete="new-password"></div>
      <button class="btn btn-primary btn-block" type="submit">Create hash</button>
    </form>
  <?php endif; ?>
</section>
</main>
</body>
</html>
