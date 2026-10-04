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

/** Inline SVG icon (stroke, currentColor, decorative). Names: see $paths. */
function icon(string $name, string $class = ''): string
{
    static $paths = [
        'grid'     => '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
        'mail'     => '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3.5 7 8.5 6 8.5-6"/>',
        'box'      => '<path d="M12 3 3.5 7.5v9L12 21l8.5-4.5v-9L12 3Z"/><path d="m3.5 7.5 8.5 4.5 8.5-4.5M12 12v9"/>',
        'briefcase' => '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 13h18"/>',
        'clock'    => '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
        'logout'   => '<path d="M9 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4M16 8l4 4-4 4M20 12H9"/>',
        'plus'     => '<path d="M12 5v14M5 12h14"/>',
        'download' => '<path d="M12 4v11m0 0 4-4m-4 4-4-4M5 20h14"/>',
        'phone'    => '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z"/>',
        'chat'     => '<path d="M4 20l1.3-4A8 8 0 1 1 8 18.7L4 20Z"/>',
        'back'     => '<path d="M19 12H5m6-6-6 6 6 6"/>',
        'arrow'    => '<path d="M5 12h14m-6-6 6 6-6 6"/>',
        'search'   => '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
        'check'    => '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
        'trash'    => '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
        'edit'     => '<path d="M4 20h4L19 9l-4-4L4 16v4Z"/>',
        'eye'      => '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
        'alert'    => '<path d="M12 4 2.5 20h19L12 4ZM12 10v4m0 3v.01"/>',
        'inbox'    => '<path d="M3 13l3-8h12l3 8v6H3v-6Z"/><path d="M3 13h5l1 3h6l1-3h5"/>',
        'filter'   => '<path d="M4 5h16l-6 8v6l-4-2v-4L4 5Z"/>',
    ];
    return '<svg class="ico' . ($class !== '' ? ' ' . e($class) : '') . '" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">'
        . ($paths[$name] ?? '') . '</svg>';
}

/**
 * Standard page header: breadcrumbs, title, lead text, action buttons.
 * @param list<array{0:string,1:?string}> $crumbs [label, href|null] pairs, last one is the current page
 * $lead and $actions are trusted HTML (build them with e()).
 */
function page_head(string $title, array $crumbs = [], string $lead = '', string $actions = '', string $titleExtra = ''): string
{
    $h = '<header class="page-head"><div class="page-head-main">';
    if ($crumbs) {
        $h .= '<nav class="crumbs" aria-label="Breadcrumb"><ol>';
        foreach ($crumbs as $i => [$label, $href]) {
            $last = $i === count($crumbs) - 1;
            $h .= '<li>' . (!$last && $href ? '<a href="' . e($href) . '">' . e($label) . '</a>' : '<span' . ($last ? ' aria-current="page"' : '') . '>' . e($label) . '</span>') . '</li>';
        }
        $h .= '</ol></nav>';
    }
    $h .= '<h1 class="page-title">' . e($title) . $titleExtra . '</h1>';
    if ($lead !== '') $h .= '<p class="lead">' . $lead . '</p>';
    $h .= '</div>';
    if ($actions !== '') $h .= '<div class="page-actions">' . $actions . '</div>';
    return $h . '</header>';
}
