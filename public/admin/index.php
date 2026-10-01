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

date_default_timezone_set(AlokConfig::tz()->getName());
send_security_headers();

try {
    route();
} catch (Throwable $ex) {
    error_log('[alok-admin] ' . $ex::class . ': ' . $ex->getMessage() . ' @ ' . basename($ex->getFile()) . ':' . $ex->getLine());
    if (!headers_sent()) {
        render('error', ['title' => 'Something went wrong', 'message' => 'The panel hit an unexpected problem. Nothing was lost. Check the System screen, or ask your developer to read the server error log.', 'bare' => true], 500);
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

    $user = AlokAuth::user();
    if ($user === null) {
        redirect(u('login'));
    }
    if ($isPost && !AlokAuth::csrfOk()) {
        render('error', ['title' => 'Request not verified', 'user' => $user,
            'message' => 'Your session may have expired, or the form was opened in another tab. Go back, reload the page and try again.'], 400);
    }

    $routes = [
        'dashboard'      => 'page_dashboard',
        'enquiries'      => 'page_enquiries',
        'export'         => 'page_export',
        'enquiry'        => 'page_enquiry',
        'enquiry_delete' => 'page_enquiry_delete',
        'settings'       => 'page_settings',
        'careers'        => 'page_careers',
        'role'           => 'page_role',
        'role_delete'    => 'page_role_delete',
        'products'       => 'page_products',
        'audit'          => 'page_audit',
        'system'         => 'page_system',
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
    $s = AlokContent::settings();
    $missing = [];
    foreach (['phone' => 'phone', 'whatsapp' => 'WhatsApp number', 'email' => 'email'] as $k => $label) {
        if (empty($s['contact'][$k])) $missing[] = $label;
    }
    render('dashboard', [
        'title' => 'Dashboard', 'nav' => 'dashboard', 'user' => $user, 'stats' => $stats, 'missing' => $missing,
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

/* ══ Site settings ═══════════════════════════════════════════════════════════ */

/** Flatten saved settings into the form's field names. @return array<string,string> */
function settings_form(array $s): array
{
    $f = [
        'phone' => (string) ($s['contact']['phone'] ?? ''), 'whatsapp' => (string) ($s['contact']['whatsapp'] ?? ''),
        'email' => (string) ($s['contact']['email'] ?? ''), 'mapsUrl' => (string) ($s['contact']['mapsUrl'] ?? ''),
        'gstin' => (string) ($s['contact']['gstin'] ?? ''),
        'instagram' => (string) ($s['social']['instagram'] ?? ''), 'linkedin' => (string) ($s['social']['linkedin'] ?? ''),
        'facebook' => (string) ($s['social']['facebook'] ?? ''), 'youtube' => (string) ($s['social']['youtube'] ?? ''),
        'replyTime' => (string) ($s['replyTime'] ?? ''), 'hoursNote' => (string) ($s['hoursNote'] ?? ''),
        'banner_enabled' => !empty($s['banner']['enabled']) ? '1' : '',
        'banner_text' => (string) ($s['banner']['text'] ?? ''), 'banner_href' => (string) ($s['banner']['href'] ?? ''),
    ];
    foreach (array_keys(ALOK_DAYS) as $d) {
        $h = $s['hours'][$d] ?? [];
        $f['open_' . $d] = (string) ($h['open'] ?? '');
        $f['close_' . $d] = (string) ($h['close'] ?? '');
        $f['closed_' . $d] = !empty($h['closed']) ? '1' : '';
    }
    return $f;
}

function page_settings(array $user, bool $isPost): never
{
    $errors = [];
    $form = settings_form(AlokContent::settings());
    $saved = AlokContent::read('settings.json') !== null;
    if ($isPost) {
        $form = [];
        foreach ($_POST as $k => $v) {
            if (is_string($v) && $k !== '_csrf') $form[$k] = $v;
        }
        [$clean, $errors] = AlokContent::validateSettings($form);
        if (!$errors) {
            try {
                AlokContent::save('settings.json', $clean);
                AlokStore::open()->audit($user['username'], 'settings', 'settings.json', '', AlokAuth::clientIp());
                flash_set('ok', 'Settings saved. The website reads them on the next page load.');
                redirect(u('settings'));
            } catch (RuntimeException $ex) {
                $errors['_save'] = 'Could not save: ' . $ex->getMessage();
            }
        }
        $form += settings_form(AlokContent::settingsDefaults()) ; // fill unchecked boxes etc.
    }
    render('settings', ['title' => 'Site settings', 'nav' => 'settings', 'user' => $user, 'form' => $form, 'errors' => $errors, 'saved' => $saved],
        $errors ? 422 : 200);
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

/* ══ Product visibility ══════════════════════════════════════════════════════ */

function page_products(array $user, bool $isPost): never
{
    $catalogue = require __DIR__ . '/lib/catalogue.php';
    $hidden = AlokContent::hiddenProducts();
    if ($isPost) {
        $visible = array_map('strval', (array) ($_POST['visible'] ?? []));
        $known = [];
        $newHidden = [];
        foreach ($catalogue as [$slug, , $published]) {
            $known[$slug] = true;
            if ($published && !in_array($slug, $visible, true)) $newHidden[] = $slug;
        }
        foreach ($hidden as $slug) { // keep entries for slugs this snapshot does not know about
            if (!isset($known[$slug])) $newHidden[] = $slug;
        }
        AlokContent::saveHidden($newHidden);
        AlokStore::open()->audit($user['username'], 'product_visibility', 'product-overrides.json', count($newHidden) . ' hidden', AlokAuth::clientIp());
        flash_set('ok', 'Saved. ' . (count($newHidden) ? count($newHidden) . ' product(s) hidden from listings.' : 'All products are shown.'));
        redirect(u('products'));
    }
    render('products', ['title' => 'Product visibility', 'nav' => 'products', 'user' => $user, 'catalogue' => $catalogue, 'hidden' => $hidden]);
}

/* ══ Activity + System ═══════════════════════════════════════════════════════ */

function page_audit(array $user, bool $isPost): never
{
    render('audit', ['title' => 'Activity log', 'nav' => 'more', 'user' => $user, 'entries' => AlokStore::open()->auditTail(200)]);
}

function page_system(array $user, bool $isPost): never
{
    $store = AlokStore::open();
    $pubDir = AlokConfig::publicDataDir();
    $checks = [];
    $add = static function (string $label, bool $ok, string $detail, bool $warnOnly = false) use (&$checks): void {
        $checks[] = ['label' => $label, 'state' => $ok ? 'ok' : ($warnOnly ? 'warn' : 'bad'), 'detail' => $detail];
    };
    $add('PHP version', version_compare(PHP_VERSION, '8.0.0', '>='), PHP_VERSION . ' (8.0 or newer needed)');
    $add('Enquiry storage', true, $store->backend());
    $add('Private data folder is writable', is_writable(AlokConfig::dataDir()), AlokConfig::dataDir());
    $add('Private data folder is outside the public web folder', !AlokConfig::dataDirInsideWebroot(),
        AlokConfig::dataDirInsideWebroot()
            ? 'It is inside the web root. It is protected by .htaccess, but moving it outside public_html is safer (set data_dir in config.php).'
            : 'Good — not reachable from the web.', true);
    $add('Connection is HTTPS', AlokAuth::isHttps(), AlokAuth::isHttps() ? 'Yes' : 'No — sign in only over https:// on the live site.', true);
    $add('Public data folder is writable', is_dir($pubDir) ? is_writable($pubDir) : is_writable(dirname($pubDir)), $pubDir);
    $add('Password hashing', function_exists('password_hash'), 'bcrypt / argon2 via password_hash()');
    $add('Enquiry endpoint wired to the inbox', is_file(dirname(__DIR__) . '/api/enquiry.php')
        && str_contains((string) file_get_contents(dirname(__DIR__) . '/api/enquiry.php'), 'AlokStore'),
        'api/enquiry.php stores every valid submission before sending the email.');
    render('system', ['title' => 'System check', 'nav' => 'more', 'user' => $user, 'checks' => $checks]);
}
