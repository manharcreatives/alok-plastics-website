<?php
/**
 * Alok Plastics admin — request/response helpers and template rendering.
 */

declare(strict_types=1);

defined('ALOK_ADMIN') || exit;

function e(mixed $v): string
{
    return htmlspecialchars((string) $v, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

/** URL of an admin screen. */
function u(string $route = '', array $params = []): string
{
    $q = $route !== '' && $route !== 'dashboard' ? ['r' => $route] + $params : $params;
    return 'index.php' . ($q ? '?' . http_build_query($q) : '');
}

function csrf_field(): string
{
    return '<input type="hidden" name="_csrf" value="' . e(AlokAuth::csrf()) . '">';
}

function flash_set(string $kind, string $msg): void
{
    $_SESSION['flash'] = [$kind, $msg];
}

/** @return array{0:string,1:string}|null */
function flash_get(): ?array
{
    $f = $_SESSION['flash'] ?? null;
    unset($_SESSION['flash']);
    return is_array($f) ? $f : null;
}

function redirect(string $to): never
{
    header('Location: ' . $to, true, 303);
    exit;
}

function send_security_headers(): void
{
    header('Cache-Control: no-store, max-age=0');
    header('Pragma: no-cache');
    header('X-Robots-Tag: noindex, nofollow, noarchive, nosnippet');
    header('X-Content-Type-Options: nosniff');
    header('X-Frame-Options: DENY');
    header('Referrer-Policy: same-origin');
    header('Cross-Origin-Opener-Policy: same-origin');
    header('Cross-Origin-Resource-Policy: same-origin');
    header('Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()');
    // No inline script or style anywhere in the admin, so the policy can be strict.
    header("Content-Security-Policy: default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self' data:; "
        . "font-src 'self'; connect-src 'self'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'");
    if (AlokAuth::isHttps()) {
        header('Strict-Transport-Security: max-age=31536000');
    }
}

function asset(string $path): string
{
    $f = dirname(__DIR__) . '/assets/' . $path;
    return 'assets/' . $path . (is_file($f) ? '?v=' . filemtime($f) : '');
}

/**
 * Render lib/views/<view>.php inside the layout.
 * @param array<string,mixed> $vars
 */
function render(string $view, array $vars = [], int $status = 200): never
{
    http_response_code($status);
    header('Content-Type: text/html; charset=utf-8');
    $vars += ['title' => 'Admin', 'nav' => '', 'bare' => false];
    $vars['flash'] = flash_get();
    $vars['user'] = $vars['user'] ?? null;
    (static function (string $__view, array $__vars): void {
        extract($__vars, EXTR_SKIP);
        ob_start();
        require __DIR__ . '/views/' . $__view . '.php';
        $content = (string) ob_get_clean();
        require __DIR__ . '/views/layout.php';
    })($view, $vars);
    exit;
}

function status_badge(string $s): string
{
    $label = ALOK_STATUS_LABELS[$s] ?? $s;
    return '<span class="badge badge-' . e($s) . '">' . e($label) . '</span>';
}

/** Field error helper for forms. */
function field_err(array $errors, string $key): string
{
    if (!isset($errors[$key])) return '';
    return '<p class="field-error" id="err-' . e($key) . '">' . e($errors[$key]) . '</p>';
}

function aria_inv(array $errors, string $key): string
{
    return isset($errors[$key]) ? ' aria-invalid="true" aria-describedby="err-' . e($key) . '"' : '';
}
