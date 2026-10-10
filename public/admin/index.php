<?php
/**
 * Alok Plastics — admin panel (single entry point).
 *
 * Self-contained PHP, no build step, no Composer, no database server.
 * Served at /admin/. See docs/admin-panel.md for setup and the security model.
 */

declare(strict_types=1);

define('ALOK_ADMIN', true);

ini_set('display_errors', '0');
ini_set('log_errors', '1');

require __DIR__ . '/lib/core.php';
require __DIR__ . '/lib/auth.php';
require __DIR__ . '/lib/query.php';
require __DIR__ . '/lib/content.php';
require __DIR__ . '/lib/web.php';
require __DIR__ . '/lib/products.php';
require __DIR__ . '/lib/shop.php';
require __DIR__ . '/lib/shop_pages.php';

date_default_timezone_set(AlokConfig::tz()->getName());
send_security_headers();

try {
    route();
} catch (Throwable $ex) {
    error_log('[alok-admin] ' . $ex::class . ': ' . $ex->getMessage() . ' @ ' . basename($ex->getFile()) . ':' . $ex->getLine());
    if (!headers_sent()) {
        // On the owner's own computer, or while 'debug' => true is set in admin/config.php, show what failed.
        // Leave 'debug' off on the live site: the message can name server paths.
        $local = in_array($_SERVER['REMOTE_ADDR'] ?? '', ['127.0.0.1', '::1'], true) || AlokConfig::get('debug') === true;
        render('error', [
            'title' => 'Something went wrong',
            'message' => 'The panel hit an unexpected problem. Nothing was lost. Ask your developer to read the server error log.',
            'detail' => $local ? $ex::class . ': ' . $ex->getMessage() . ' (' . basename($ex->getFile()) . ':' . $ex->getLine() . ')' : null,
            'bare' => true,
        ], 500);
    }
}

/* ══ Router ══════════════════════════════════════════════════════════════════ */

function route(): void
{
    if (!AlokConfig::exists() || !AlokAuth::configured()) {
        render('setup', ['title' => 'Set up the admin', 'bare' => true], 503);
    }
    AlokAuth::start();

    $r = preg_replace('/[^a-z_]/', '', strtolower((string) ($_GET['r'] ?? 'dashboard'))) ?: 'dashboard';
    $isPost = ($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'POST';

    if ($r === 'login') {
        action_login($isPost);
    }
    if ($r === 'forgot_password') {
        action_forgot_password($isPost);
    }
    if ($r === 'reset_password') {
        action_reset_password($isPost);
    }

    $user = AlokAuth::user();
    if ($user === null) {
        redirect(u('login'));
    }
    if ($isPost && !AlokAuth::csrfOk()) {
        AlokStore::open()->audit($user['username'], 'csrf_rejected', (string) ($_GET['r'] ?? ''), '', AlokAuth::clientIp());
        render('error', ['title' => 'Request not verified', 'user' => $user,
            'message' => 'Your session may have expired, or the form was opened in another tab. Go back, reload the page and try again.'], 400);
    }

    $routes = [
        'dashboard'      => 'page_dashboard',
        'enquiries'      => 'page_enquiries',
        'export'         => 'page_export',
        'enquiry'        => 'page_enquiry',
        'enquiry_delete' => 'page_enquiry_delete',
        'orders'         => 'page_orders',
        'order'          => 'page_order',
        'order_delete'   => 'page_order_delete',
        'carts'          => 'page_carts',
        'applications'   => 'page_applications',
        'application'    => 'page_application',
        'resume'         => 'page_resume',
        'customers'      => 'page_customers',
        'careers'        => 'page_careers',
        'role'           => 'page_role',
        'role_delete'    => 'page_role_delete',
        'products'       => 'page_products',
        'product'        => 'page_product',
        'audit'          => 'page_audit',
        'logout'         => 'action_logout',
    ];
    if (!isset($routes[$r])) {
        render('error', ['title' => 'Not found', 'user' => $user, 'message' => 'That screen does not exist.'], 404);
    }
    $routes[$r]($user, $isPost);
}

/* ══ Auth ════════════════════════════════════════════════════════════════════ */

function action_login(bool $isPost): never
{
    if (AlokAuth::user() !== null) {
        redirect(u());
    }
    $error = null;
    $username = '';
    if ($isPost) {
        if (!AlokAuth::csrfOk()) {
            $error = 'The form expired. Please try again.';
        } else {
            $username = mb_substr(trim((string) ($_POST['username'] ?? '')), 0, 60);
            $error = AlokAuth::attempt($username, (string) ($_POST['password'] ?? ''));
            if ($error === null) {
                redirect(u());
            }
        }
    }
    render('login', ['title' => 'Sign in', 'bare' => true, 'error' => $error, 'username' => $username], $error ? 401 : 200);
}

function action_forgot_password(bool $isPost): never
{
    if (AlokAuth::user() !== null) {
        redirect(u());
    }
    $error    = null;
    $username = '';
    $resetUrl = null;

    if ($isPost) {
        if (!AlokAuth::csrfOk()) {
            $error = 'The form expired. Please try again.';
        } else {
            $username = mb_strtolower(mb_substr(trim((string) ($_POST['username'] ?? '')), 0, 60));
            // Always answer the same way: never reveal whether a username exists.
            if ($username !== '') {
                $token = AlokAuth::generateResetToken($username);
                if ($token !== null) {
                    $path = u('reset_password', ['t' => $token]);
                    $site = rtrim((string) AlokShop::cfg('ALOK_SITE_URL'), '/');
                    $abs  = ($site !== '' ? $site : '') . '/admin/' . ltrim($path, '/');
                    // The link goes to the owner's inbox only. It is never shown to the requester,
                    // otherwise anyone who knows a username could take over the account.
                    $sent = AlokShop::mailClient(
                        'Alok Plastics admin: password reset',
                        "A password reset was requested for admin user \"{$username}\".\n\nOpen this link within 15 minutes to choose a new password:\n{$abs}\n\nIf you did not ask for this, ignore this email; nothing changes."
                    );
                    // Local development only (no mail server): show the link on screen.
                    if (!$sent && in_array(AlokAuth::clientIp(), ['127.0.0.1', '::1'], true)) {
                        $resetUrl = $path;
                    }
                    AlokStore::open()->audit($username, 'pwd_reset_requested', '', $sent ? 'emailed' : 'mail not sent', AlokAuth::clientIp());
                }
            }
        }
    }

    render('forgot_password', [
        'title'    => 'Reset password', 'bare' => true,
        'submitted' => $isPost && $error === null,
        'error'    => $error, 'username' => $username, 'resetUrl' => $resetUrl,
    ], $error ? 400 : 200);
}

function action_reset_password(bool $isPost): never
{
    if (AlokAuth::user() !== null) {
        redirect(u());
    }
    $token    = mb_substr(trim((string) ($_GET['t'] ?? '')), 0, 128);
    $error    = null;
    $username = $token !== '' ? AlokAuth::peekResetToken($token) : null;

    if ($username === null) {
        render('reset_password', [
            'title' => 'Reset password', 'bare' => true,
            'invalid' => true, 'error' => null, 'username' => null, 'token' => '',
        ]);
    }

    if ($isPost) {
        if (!AlokAuth::csrfOk()) {
            $error = 'The form expired. Please try again.';
        } else {
            $pw  = (string) ($_POST['password'] ?? '');
            $pw2 = (string) ($_POST['password2'] ?? '');
            if (strlen($pw) < 10) {
                $error = 'Password must be at least 10 characters.';
            } elseif ($pw !== $pw2) {
                $error = 'Passwords do not match.';
            } else {
                $consumed = AlokAuth::consumeResetToken($token);
                if ($consumed === null) {
                    $error = 'This reset link has expired or has already been used. Please request a new one.';
                } else {
                    $newHash = password_hash($pw, PASSWORD_BCRYPT, ['cost' => 10]);
                    if (!AlokConfig::updateUserHash($consumed, $newHash)) {
                        $error = 'Could not update the password. Please ask your server administrator to reset it manually.';
                    } else {
                        AlokStore::open()->audit($consumed, 'password_reset', '', '', AlokAuth::clientIp());
                        AlokAuth::start();
                        flash_set('ok', 'Password updated. Please sign in with your new password.');
                        redirect(u('login'));
                    }
                }
            }
        }
    }

    render('reset_password', [
        'title'    => 'Reset password', 'bare' => true,
        'invalid'  => false, 'error' => $error, 'username' => $username, 'token' => $token,
    ], $error ? 400 : 200);
}

function action_logout(array $user, bool $isPost): never
{
    if (!$isPost) {
        redirect(u());
    }
    AlokStore::open()->audit($user['username'], 'logout', '', '', AlokAuth::clientIp());
    AlokAuth::destroy();
    AlokAuth::start();
    flash_set('ok', 'You have been signed out.');
    redirect(u('login'));
}

/* ══ Dashboard ═══════════════════════════════════════════════════════════════ */

function page_dashboard(array $user, bool $isPost): never
{
    $store = AlokStore::open();
    $stats = alok_stats($store->all());
    render('dashboard', [
        'title' => 'Dashboard', 'nav' => 'dashboard', 'user' => $user, 'stats' => $stats,
        'recent' => array_slice(array_values(array_filter($store->all(), static fn($r) => !$r['archived'])), 0, 5),
    ]);
}

/* ══ Enquiries ═══════════════════════════════════════════════════════════════ */

function page_enquiries(array $user, bool $isPost): never
{
    $f = alok_filters($_GET);
    $all = AlokStore::open()->all();
    $rows = alok_apply_filters($all, $f);
    [$pageRows, $total, $pages] = alok_paginate($rows, $f['page'], max(5, (int) AlokConfig::get('per_page', 25)));
    $f['page'] = min($f['page'], $pages);

    $products = [];
    foreach ($all as $r) {
        foreach ($r['products'] as $p) {
            $n = trim((string) ($p['name'] ?? ''));
            if ($n !== '') $products[$n] = true;
        }
    }
    ksort($products, SORT_NATURAL | SORT_FLAG_CASE);
    render('enquiries', [
        'title' => 'Enquiries', 'nav' => 'enquiries', 'user' => $user, 'f' => $f, 'rows' => $pageRows,
        'total' => $total, 'pages' => $pages, 'products' => array_keys($products),
    ]);
}

function page_export(array $user, bool $isPost): never
{
    $f = alok_filters($_GET);
    $rows = alok_apply_filters(AlokStore::open()->all(), $f);
    AlokStore::open()->audit($user['username'], 'export_csv', '', count($rows) . ' rows', AlokAuth::clientIp());
    $name = 'alok-enquiries-' . date('Y-m-d') . '.csv';
    header('Content-Type: text/csv; charset=utf-8');
    header('Content-Disposition: attachment; filename="' . $name . '"');
    alok_csv_stream($rows);
    exit;
}

function enquiry_or_404(array $user): array
{
    $id = (int) ($_GET['id'] ?? 0);
    $row = $id > 0 ? AlokStore::open()->get($id) : null;
    if ($row === null) {
        render('error', ['title' => 'Enquiry not found', 'user' => $user, 'message' => 'That enquiry does not exist. It may have been deleted.'], 404);
    }
    return $row;
}

function page_enquiry(array $user, bool $isPost): never
{
    $store = AlokStore::open();
    $row = enquiry_or_404($user);
    $id = $row['id'];
    $self = u('enquiry', ['id' => $id]);

    if ($isPost) {
        $do = (string) ($_POST['do'] ?? '');
        $ip = AlokAuth::clientIp();
        switch ($do) {
            case 'status':
                $new = (string) ($_POST['status'] ?? '');
                if (!in_array($new, AlokStore::STATUSES, true)) {
                    flash_set('err', 'Unknown status.');
                    break;
                }
                if ($new !== $row['status']) {
                    $store->update($id, ['status' => $new, 'seen' => 1, 'updated_at' => time()]);
                    $store->audit($user['username'], 'status', '#' . $id, $row['status'] . ' → ' . $new, $ip);
                }
                flash_set('ok', 'Status set to ' . ALOK_STATUS_LABELS[$new] . '.');
                break;
            case 'note':
                $text = trim(preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', (string) ($_POST['note'] ?? '')) ?? '');
                if ($text === '' || mb_strlen($text) > 1000) {
                    flash_set('err', 'Write a note of up to 1000 characters.');
                    break;
                }
                $notes = $row['notes'];
                $notes[] = ['at' => time(), 'by' => $user['name'], 'text' => $text];
                $store->update($id, ['notes' => $notes, 'updated_at' => time()]);
                $store->audit($user['username'], 'note', '#' . $id, '', $ip);
                flash_set('ok', 'Note added.');
                break;
            case 'assign':
                $to = trim((string) ($_POST['assigned_to'] ?? ''));
                $names = array_map(static fn($u) => (string) ($u['name'] ?? ''), array_values((array) AlokConfig::get('users', [])));
                if ($to !== '' && !in_array($to, $names, true)) {
                    flash_set('err', 'Unknown person.');
                    break;
                }
                $store->update($id, ['assigned_to' => $to, 'updated_at' => time()]);
                $store->audit($user['username'], 'assign', '#' . $id, $to !== '' ? $to : '(unassigned)', $ip);
                flash_set('ok', $to !== '' ? 'Assigned to ' . $to . '.' : 'Unassigned.');
                break;
            case 'archive':
            case 'unarchive':
                $store->update($id, ['archived' => $do === 'archive' ? 1 : 0, 'updated_at' => time()]);
                $store->audit($user['username'], $do, '#' . $id, '', $ip);
                flash_set('ok', $do === 'archive' ? 'Enquiry archived. You can restore it from the Archived view.' : 'Enquiry restored.');
                if ($do === 'archive') redirect(u('enquiries'));
                break;
            default:
                flash_set('err', 'Unknown action.');
        }
        redirect($self);
    }

    if (!$row['seen']) {
        $store->update($id, ['seen' => 1]);
        $row['seen'] = 1;
    }
    $names = [];
    foreach ((array) AlokConfig::get('users', []) as $uname => $uc) {
        $names[] = (string) ($uc['name'] ?? $uname);
    }
    render('enquiry', [
        'title' => 'Enquiry #' . $id, 'nav' => 'enquiries', 'user' => $user, 'r' => $row,
        'links' => alok_contact_links($row), 'people' => array_values(array_unique($names)),
    ]);
}

function page_enquiry_delete(array $user, bool $isPost): never
{
    $row = enquiry_or_404($user);
    if ($isPost) {
        if (($_POST['confirm'] ?? '') !== 'yes') {
            redirect(u('enquiry', ['id' => $row['id']]));
        }
        AlokStore::open()->delete($row['id']);
        AlokStore::open()->audit($user['username'], 'delete', '#' . $row['id'], $row['company'], AlokAuth::clientIp());
        flash_set('ok', 'Enquiry #' . $row['id'] . ' was permanently deleted.');
        redirect(u('enquiries'));
    }
    render('enquiry_delete', ['title' => 'Delete enquiry', 'nav' => 'enquiries', 'user' => $user, 'r' => $row]);
}

/* ══ Careers ═════════════════════════════════════════════════════════════════ */

function page_careers(array $user, bool $isPost): never
{
    $roles = AlokContent::roles();
    if ($isPost) {
        $id = (string) ($_POST['id'] ?? '');
        foreach ($roles as &$ro) {
            if (($ro['id'] ?? '') === $id) {
                $ro['active'] = empty($ro['active']);
                $ro['updatedAt'] = gmdate('Y-m-d\TH:i:s\Z');
                AlokContent::saveRoles($roles);
                AlokStore::open()->audit($user['username'], 'role_toggle', $id, $ro['active'] ? 'shown' : 'hidden', AlokAuth::clientIp());
                flash_set('ok', '"' . $ro['title'] . '" is now ' . ($ro['active'] ? 'shown on' : 'hidden from') . ' the Careers page.');
                break;
            }
        }
        unset($ro);
        redirect(u('careers'));
    }
    render('careers', ['title' => 'Open roles', 'nav' => 'careers', 'user' => $user, 'roles' => $roles]);
}

function page_role(array $user, bool $isPost): never
{
    $roles = AlokContent::roles();
    $id = (string) ($_GET['id'] ?? '');
    $idx = null;
    foreach ($roles as $i => $ro) {
        if (($ro['id'] ?? '') === $id && $id !== '') $idx = $i;
    }
    if ($id !== '' && $idx === null) {
        render('error', ['title' => 'Role not found', 'user' => $user, 'message' => 'That role does not exist.'], 404);
    }
    $form = $idx !== null ? $roles[$idx] : ['title' => '', 'team' => '', 'type' => 'full-time', 'location' => '', 'description' => '', 'active' => true];
    $errors = [];
    if ($isPost) {
        [$clean, $errors] = AlokContent::validateRole($_POST);
        $form = $clean;
        if (!$errors) {
            $now = gmdate('Y-m-d\TH:i:s\Z');
            if ($idx !== null) {
                $roles[$idx] = $clean + ['id' => $id, 'createdAt' => $roles[$idx]['createdAt'] ?? $now, 'updatedAt' => $now];
            } else {
                $slug = trim(preg_replace('/[^a-z0-9]+/', '-', strtolower($clean['title'])) ?? '', '-');
                $id = ($slug !== '' ? substr($slug, 0, 40) : 'role') . '-' . bin2hex(random_bytes(2));
                array_unshift($roles, $clean + ['id' => $id, 'createdAt' => $now, 'updatedAt' => $now]);
            }
            try {
                AlokContent::saveRoles($roles);
                AlokStore::open()->audit($user['username'], $idx !== null ? 'role_edit' : 'role_add', $id, $clean['title'], AlokAuth::clientIp());
                flash_set('ok', 'Role saved.');
                redirect(u('careers'));
            } catch (RuntimeException $ex) {
                $errors['_save'] = 'Could not save: ' . $ex->getMessage();
            }
        }
    }
    render('role', ['title' => $idx !== null ? 'Edit role' : 'Add role', 'nav' => 'careers', 'user' => $user,
        'form' => $form, 'errors' => $errors, 'id' => $id], $errors ? 422 : 200);
}

function page_role_delete(array $user, bool $isPost): never
{
    $roles = AlokContent::roles();
    $id = (string) ($_GET['id'] ?? '');
    $role = null;
    foreach ($roles as $ro) {
        if (($ro['id'] ?? '') === $id) $role = $ro;
    }
    if ($role === null) {
        render('error', ['title' => 'Role not found', 'user' => $user, 'message' => 'That role does not exist.'], 404);
    }
    if ($isPost) {
        if (($_POST['confirm'] ?? '') === 'yes') {
            AlokContent::saveRoles(array_values(array_filter($roles, static fn($ro) => ($ro['id'] ?? '') !== $id)));
            AlokStore::open()->audit($user['username'], 'role_delete', $id, (string) $role['title'], AlokAuth::clientIp());
            flash_set('ok', 'Role deleted.');
        }
        redirect(u('careers'));
    }
    render('role_delete', ['title' => 'Delete role', 'nav' => 'careers', 'user' => $user, 'role' => $role]);
}

/* ══ Products: see lib/products.php (page_products, page_product) ═════════════ */

/* ══ Activity log ═══════════════════════════════════════════════════════ */

function page_audit(array $user, bool $isPost): never
{
    $q       = mb_substr(trim((string) ($_GET['q']      ?? '')), 0, 80);
    $fAction = mb_substr(trim((string) ($_GET['action'] ?? '')), 0, 40);
    $fUser   = mb_strtolower(mb_substr(trim((string) ($_GET['user'] ?? '')), 0, 60));
    $fFrom   = preg_match('/^\d{4}-\d{2}-\d{2}$/', (string) ($_GET['from'] ?? '')) === 1 ? (string) $_GET['from'] : '';
    $fTo     = preg_match('/^\d{4}-\d{2}-\d{2}$/', (string) ($_GET['to']   ?? '')) === 1 ? (string) $_GET['to']   : '';
    $hasFilter = $q !== '' || $fAction !== '' || $fUser !== '' || $fFrom !== '' || $fTo !== '';

    // Read a larger pool when a filter is active so we can match across more history.
    $pool = AlokStore::open()->auditTail($hasFilter ? 2000 : 200);

    // Collect distinct values for filter drop-downs (from the same pool).
    $actionTypes = [];
    $userNames   = [];
    foreach ($pool as $en) {
        if (($a = (string) ($en['action'] ?? '')) !== '') $actionTypes[$a] = true;
        if (($u = (string) ($en['user']   ?? '')) !== '') $userNames[$u]   = true;
    }
    ksort($actionTypes);
    ksort($userNames);

    $entries = $pool;
    if ($hasFilter) {
        $fromTs = $fFrom !== '' ? (int) strtotime($fFrom . ' 00:00:00') : null;
        $toTs   = $fTo   !== '' ? (int) strtotime($fTo   . ' 23:59:59') : null;
        $entries = array_values(array_filter($pool, static function (array $en) use ($q, $fAction, $fUser, $fromTs, $toTs): bool {
            $ts = (int) ($en['ts'] ?? 0);
            if ($fromTs !== null && $ts < $fromTs) return false;
            if ($toTs   !== null && $ts > $toTs)   return false;
            if ($fUser !== '' && strtolower((string) ($en['user'] ?? '')) !== $fUser) return false;
            if ($fAction !== '' && (string) ($en['action'] ?? '') !== $fAction) return false;
            if ($q !== '') {
                $hay = ($en['action'] ?? '') . ' ' . ($en['user'] ?? '') . ' ' . ($en['target'] ?? '') . ' ' . ($en['detail'] ?? '');
                if (mb_stripos($hay, $q) === false) return false;
            }
            return true;
        }));
        $entries = array_slice($entries, 0, 200);
    }

    render('audit', ['title' => 'Activity log', 'nav' => 'audit', 'user' => $user, 'entries' => $entries,
        'q' => $q, 'fAction' => $fAction, 'fUser' => $fUser, 'fFrom' => $fFrom, 'fTo' => $fTo,
        'actionTypes' => array_keys($actionTypes), 'userNames' => array_keys($userNames), 'hasFilter' => $hasFilter]);
}
