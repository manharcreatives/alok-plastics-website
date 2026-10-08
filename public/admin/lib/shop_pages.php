<?php

declare(strict_types=1);

defined('ALOK_ADMIN') || exit;

const ALOK_ORDER_TONES = ['pending' => 'tone-warn', 'reviewing' => 'tone-brand', 'quoted' => 'tone-info', 'confirmed' => 'tone-info', 'paid' => 'tone-ok', 'dispatched' => 'tone-info', 'invoiced' => 'tone-brand', 'closed' => 'tone-ok', 'cancelled' => 'tone-muted'];
const ALOK_APPLICATION_TONES = ['new' => 'tone-brand', 'reviewing' => 'tone-info', 'shortlisted' => 'tone-warn', 'hired' => 'tone-ok', 'rejected' => 'tone-muted'];

function shop_badge(string $status, array $labels, array $tones): string
{
    return '<span class="badge ' . e($tones[$status] ?? 'tone-muted') . '">' . e($labels[$status] ?? $status) . '</span>';
}

function shop_pending_orders(): int
{
    try {
        return count(AlokShop::orders()->where('status', 'pending'));
    } catch (Throwable) {
        return 0;
    }
}

function shop_page(array $rows, int $page): array
{
    $per = max(5, (int) AlokConfig::get('per_page', 25));
    $total = count($rows);
    $pages = max(1, (int) ceil($total / $per));
    $page = max(1, min($page, $pages));
    return [array_slice($rows, ($page - 1) * $per, $per), $total, $pages, $page];
}

function shop_match(array $row, string $q, array $fields): bool
{
    if ($q === '') {
        return true;
    }
    foreach ($fields as $f) {
        if (mb_stripos((string) ($row[$f] ?? ''), $q) !== false) {
            return true;
        }
    }
    return false;
}

function shop_add_note(array $user, string $text): ?array
{
    $text = trim(preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', $text) ?? '');
    if ($text === '' || mb_strlen($text) > 1000) {
        return null;
    }
    return ['at' => time(), 'by' => $user['name'], 'text' => $text];
}

function page_orders(array $user, bool $isPost): never
{
    $status = (string) ($_GET['status'] ?? '');
    $q = mb_substr(trim((string) ($_GET['q'] ?? '')), 0, 100);
    $page = (int) ($_GET['page'] ?? 1);
    $all = array_map(static function (array $o): array {
        $o['status'] = AlokShop::normStatus((string) $o['status']);
        return $o;
    }, AlokShop::orders()->all());
    $counts = array_fill_keys(AlokShop::ORDER_STATUSES, 0);
    foreach ($all as $o) {
        $counts[$o['status']] = ($counts[$o['status']] ?? 0) + 1;
    }
    $rows = array_values(array_filter($all, static fn(array $o): bool => ($status === '' || $o['status'] === $status) && shop_match($o, $q, ['code', 'name', 'phone'])));
    [$pageRows, $total, $pages, $page] = shop_page($rows, $page);
    render('orders', ['title' => 'Orders', 'nav' => 'orders', 'user' => $user, 'rows' => $pageRows, 'total' => $total, 'pages' => $pages, 'page' => $page, 'status' => $status, 'q' => $q, 'counts' => $counts, 'all' => count($all)]);
}

function order_or_404(array $user): array
{
    $o = AlokShop::orders()->find((int) ($_GET['id'] ?? 0));
    if ($o === null) {
        render('error', ['title' => 'Order not found', 'user' => $user, 'message' => 'That order does not exist.'], 404);
    }
    $o['status'] = AlokShop::normStatus((string) $o['status']);
    return $o;
}

function page_order(array $user, bool $isPost): never
{
    $o = order_or_404($user);
    $self = u('order', ['id' => $o['id']]);
    if ($isPost) {
        $do = (string) ($_POST['do'] ?? '');
        if ($do === 'advance' || $do === 'cancel') {
            $new = $do === 'cancel' ? 'cancelled' : AlokShop::nextStatus($o['status']);
            if ($new === null || in_array($o['status'], ['closed', 'cancelled'], true)) {
                flash_set('err', 'This order cannot move any further.');
                redirect($self);
            }
            $f = static fn(string $k, int $max = 120): string => AlokShop::clean($_POST[$k] ?? '', $max);
            $patch = ['status' => $new];
            $err = null;
            $cancelReason = '';
            if ($do === 'cancel') {
                $cancelReason = $f('reason', 300);
                if ($cancelReason === '') {
                    $err = 'Add a reason for cancelling.';
                }
                $patch['cancel_reason'] = $cancelReason;
            } elseif ($new === 'quoted') {
                $amt = trim((string) ($_POST['quote_amount'] ?? ''));
                if ($amt !== '' && !is_numeric($amt)) {
                    $err = 'Quote amount must be a number.';
                }
                $patch += ['quote_amount' => $amt === '' ? null : max(0.0, (float) $amt), 'quote_note' => $f('quote_note', 300), 'quoted_at' => time()];
            } elseif ($new === 'confirmed') {
                $patch['confirmed_at'] = time();
            } elseif ($new === 'paid') {
                $amt = trim((string) ($_POST['pay_amount'] ?? ''));
                if ($amt === '' || !is_numeric($amt) || (float) $amt <= 0) {
                    $err = 'Enter the amount received.';
                }
                $patch += ['pay_amount' => $err ? null : (float) $amt, 'pay_mode' => $f('pay_mode', 30), 'pay_ref' => $f('pay_ref', 80), 'paid_at' => time()];
            } elseif ($new === 'dispatched') {
                $patch += ['transporter' => $f('transporter', 80), 'lr_no' => $f('lr_no', 60), 'dispatched_at' => time()];
            } elseif ($new === 'invoiced') {
                $patch += ['invoice_no' => AlokShop::nextInvoiceNo(), 'invoiced_at' => time()];
            } elseif ($new === 'closed') {
                $patch['closed_at'] = time();
            }
            if ($err !== null) {
                flash_set('err', $err);
                redirect($self);
            }
            $note = shop_add_note($user, $do === 'cancel' ? 'Cancelled: ' . $cancelReason : (string) ($_POST['note'] ?? ''));
            if ($note !== null) {
                $patch['notes'] = array_merge($o['notes'] ?? [], [$note]);
            }
            $history = $o['history'] ?? [];
            $history[] = ['at' => time(), 'by' => $user['name'], 'from' => $o['status'], 'to' => $new];
            $patch['history'] = $history;
            $updated = AlokShop::orders()->update((int) $o['id'], $patch);
            AlokStore::open()->audit($user['username'], 'order_status', $o['code'], $o['status'] . ' → ' . $new, AlokAuth::clientIp());
            flash_set('ok', $o['code'] . ' is now "' . ALOK_ORDER_LABELS[$new] . '". Use the WhatsApp button to message the customer.' . ($new === 'invoiced' && $updated ? ' Invoice ' . $updated['invoice_no'] . '.' : ''));
        } elseif ($do === 'note') {
            $note = shop_add_note($user, (string) ($_POST['note'] ?? ''));
            if ($note === null) {
                flash_set('err', 'Write a note of up to 1000 characters.');
            } else {
                AlokShop::orders()->update((int) $o['id'], ['notes' => array_merge($o['notes'] ?? [], [$note])]);
                flash_set('ok', 'Note added.');
            }
        }
        redirect($self);
    }
    $msg = AlokShop::stageMessage($o);
    $wa = 'https://wa.me/' . $o['phone'] . '?text=' . rawurlencode($msg);
    render('order', ['title' => 'Enquiry ' . $o['code'], 'nav' => 'orders', 'user' => $user, 'o' => $o, 'wa' => $wa, 'waText' => $msg, 'next' => AlokShop::nextStatus($o['status'])]);
}

function page_applications(array $user, bool $isPost): never
{
    $status = (string) ($_GET['status'] ?? '');
    $q = mb_substr(trim((string) ($_GET['q'] ?? '')), 0, 100);
    $page = (int) ($_GET['page'] ?? 1);
    $all = AlokShop::applications()->all();
    $rows = array_values(array_filter($all, static fn(array $a): bool => ($status === '' || $a['status'] === $status) && shop_match($a, $q, ['name', 'phone', 'email', 'position'])));
    [$pageRows, $total, $pages, $page] = shop_page($rows, $page);
    render('applications', ['title' => 'Applications', 'nav' => 'applications', 'user' => $user, 'rows' => $pageRows, 'total' => $total, 'pages' => $pages, 'page' => $page, 'status' => $status, 'q' => $q, 'all' => count($all)]);
}

function application_or_404(array $user): array
{
    $a = AlokShop::applications()->find((int) ($_GET['id'] ?? 0));
    if ($a === null) {
        render('error', ['title' => 'Application not found', 'user' => $user, 'message' => 'That application does not exist.'], 404);
    }
    return $a;
}

function page_application(array $user, bool $isPost): never
{
    $a = application_or_404($user);
    $self = u('application', ['id' => $a['id']]);
    if ($isPost) {
        $do = (string) ($_POST['do'] ?? '');
        if ($do === 'status') {
            $new = (string) ($_POST['status'] ?? '');
            if (in_array($new, AlokShop::APPLICATION_STATUSES, true)) {
                AlokShop::applications()->update((int) $a['id'], ['status' => $new]);
                AlokStore::open()->audit($user['username'], 'application_status', '#' . $a['id'], $a['status'] . ' → ' . $new, AlokAuth::clientIp());
                flash_set('ok', 'Application marked as ' . ALOK_APPLICATION_LABELS[$new] . '.');
            } else {
                flash_set('err', 'Unknown status.');
            }
        } elseif ($do === 'note') {
            $note = shop_add_note($user, (string) ($_POST['note'] ?? ''));
            if ($note === null) {
                flash_set('err', 'Write a note of up to 1000 characters.');
            } else {
                AlokShop::applications()->update((int) $a['id'], ['notes' => array_merge($a['notes'] ?? [], [$note])]);
                flash_set('ok', 'Note added.');
            }
        }
        redirect($self);
    }
    $digits = preg_replace('/\D/', '', (string) $a['phone']) ?? '';
    render('application', ['title' => 'Application #' . $a['id'], 'nav' => 'applications', 'user' => $user, 'a' => $a, 'wa' => $digits !== '' ? 'https://wa.me/' . $digits : '']);
}

function page_resume(array $user, bool $isPost): never
{
    $a = application_or_404($user);
    $path = AlokShop::resumePath((string) ($a['resume_file'] ?? ''));
    if ($path === null) {
        render('error', ['title' => 'Resume not found', 'user' => $user, 'message' => 'No resume file is stored for this application.'], 404);
    }
    $ext = strtolower(pathinfo($path, PATHINFO_EXTENSION));
    $types = ['pdf' => 'application/pdf', 'doc' => 'application/msword', 'docx' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    $safe = preg_replace('/[^A-Za-z0-9._ -]/', '_', (string) ($a['resume_name'] ?: 'resume.' . $ext)) ?? 'resume';
    AlokStore::open()->audit($user['username'], 'resume_download', '#' . $a['id'], $safe, AlokAuth::clientIp());
    header('Content-Type: ' . ($types[$ext] ?? 'application/octet-stream'));
    header('Content-Disposition: attachment; filename="' . $safe . '"');
    header('Content-Length: ' . filesize($path));
    readfile($path);
    exit;
}

function page_customers(array $user, bool $isPost): never
{
    $q = mb_substr(trim((string) ($_GET['q'] ?? '')), 0, 100);
    $page = (int) ($_GET['page'] ?? 1);
    $orders = [];
    foreach (AlokShop::orders()->all() as $o) {
        $orders[$o['customer_id']] = ($orders[$o['customer_id']] ?? 0) + 1;
    }
    $rows = array_values(array_filter(AlokShop::customers()->all(), static fn(array $c): bool => shop_match($c, $q, ['name', 'phone'])));
    foreach ($rows as &$c) {
        $c['orders'] = $orders[$c['id']] ?? 0;
    }
    unset($c);
    [$pageRows, $total, $pages, $page] = shop_page($rows, $page);
    render('customers', ['title' => 'Customers', 'nav' => 'customers', 'user' => $user, 'rows' => $pageRows, 'total' => $total, 'pages' => $pages, 'page' => $page, 'q' => $q]);
}

function page_carts(array $user, bool $isPost): never
{
    $all = AlokShop::carts()->all();
    $open = array_values(array_filter($all, static fn(array $c): bool => ($c['status'] ?? '') === 'open'));
    usort($open, static fn(array $a, array $b): int => ((int) $b['updated_at']) <=> ((int) $a['updated_at']));
    $done = array_values(array_filter($all, static fn(array $c): bool => ($c['status'] ?? '') === 'submitted'));
    render('carts', ['title' => 'Live carts', 'nav' => 'carts', 'user' => $user, 'open' => $open, 'submitted' => array_slice($done, 0, 10), 'refresh' => 8]);
}
