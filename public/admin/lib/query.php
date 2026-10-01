<?php
/**
 * Alok Plastics admin — list filtering, sorting, pagination, dashboard stats, CSV, contact links.
 * Works on the array of records returned by AlokStore::all() (a small manufacturer's
 * enquiry volume is hundreds to low thousands per year, so in-memory is fine and keeps
 * the SQLite and JSON-lines backends behaving identically).
 */

declare(strict_types=1);

defined('ALOK_ADMIN') || exit;

const ALOK_BUYER_TYPES = [
    'oem' => 'OEM', 'dealer' => 'Dealer', 'distributor' => 'Distributor',
    'repair-workshop' => 'Repair workshop', 'other' => 'Other',
];

const ALOK_STATUS_LABELS = [
    'new' => 'New', 'contacted' => 'Contacted', 'quoted' => 'Quoted', 'won' => 'Won', 'lost' => 'Lost',
];

/** Parse and clamp list filters from a GET array. @return array<string,mixed> */
function alok_filters(array $src): array
{
    $s = static fn(string $k, int $max = 80): string => mb_substr(trim((string) ($src[$k] ?? '')), 0, $max);
    $date = static function (string $v): string {
        return preg_match('/^\d{4}-\d{2}-\d{2}$/', $v) && strtotime($v) !== false ? $v : '';
    };
    $status = $s('status', 12);
    $view = $s('view', 10);
    $buyer = $s('buyer', 20);
    $sort = $s('sort', 12);
    $dir = $s('dir', 4);
    return [
        'q'      => $s('q', 100),
        'status' => in_array($status, AlokStore::STATUSES, true) ? $status : '',
        'view'   => in_array($view, ['active', 'archived', 'all'], true) ? $view : 'active',
        'buyer'  => isset(ALOK_BUYER_TYPES[$buyer]) ? $buyer : '',
        'product' => $s('product', 120),
        'from'   => $date($s('from', 10)),
        'to'     => $date($s('to', 10)),
        'sort'   => in_array($sort, ['date', 'name', 'company', 'status', 'product'], true) ? $sort : 'date',
        'dir'    => $dir === 'asc' ? 'asc' : 'desc',
        'page'   => max(1, (int) ($src['page'] ?? 1)),
    ];
}

/** @param list<array<string,mixed>> $rows @return list<array<string,mixed>> */
function alok_apply_filters(array $rows, array $f): array
{
    $tz = AlokConfig::tz();
    $from = $f['from'] !== '' ? (new DateTimeImmutable($f['from'] . ' 00:00:00', $tz))->getTimestamp() : null;
    $to = $f['to'] !== '' ? (new DateTimeImmutable($f['to'] . ' 23:59:59', $tz))->getTimestamp() : null;
    $q = mb_strtolower($f['q']);
    $prod = mb_strtolower($f['product']);

    $out = [];
    foreach ($rows as $r) {
        if ($f['view'] === 'active' && $r['archived']) continue;
        if ($f['view'] === 'archived' && !$r['archived']) continue;
        if ($f['status'] !== '' && $r['status'] !== $f['status']) continue;
        if ($f['buyer'] !== '' && $r['buyer_type'] !== $f['buyer']) continue;
        if ($from !== null && $r['created_at'] < $from) continue;
        if ($to !== null && $r['created_at'] > $to) continue;
        if ($prod !== '' && !str_contains(mb_strtolower($r['product']), $prod)) continue;
        if ($q !== '') {
            $hay = mb_strtolower(implode(' ', [
                $r['name'], $r['company'], $r['phone'], $r['email'], $r['city'], $r['state'],
                $r['product'], $r['message'], $r['gstin'], '#' . $r['id'],
                implode(' ', array_map(static fn($n) => (string) ($n['text'] ?? ''), $r['notes'])),
            ]));
            if (!str_contains($hay, $q)) continue;
        }
        $out[] = $r;
    }

    $key = ['date' => 'created_at', 'name' => 'name', 'company' => 'company', 'status' => 'status', 'product' => 'product'][$f['sort']];
    $mul = $f['dir'] === 'asc' ? 1 : -1;
    usort($out, static function ($a, $b) use ($key, $mul) {
        $x = $a[$key];
        $y = $b[$key];
        $c = is_int($x) ? $x <=> $y : strcasecmp((string) $x, (string) $y);
        return ($c ?: ($a['id'] <=> $b['id'])) * $mul;
    });
    return $out;
}

/** @return array{0:list<array<string,mixed>>,1:int,2:int} rows for the page, total, pages */
function alok_paginate(array $rows, int $page, int $per): array
{
    $total = count($rows);
    $pages = max(1, (int) ceil($total / $per));
    $page = min($page, $pages);
    return [array_slice($rows, ($page - 1) * $per, $per), $total, $pages];
}

/** Query string for the enquiries list preserving filters (page excluded unless given). */
function alok_filter_qs(array $f, array $override = []): string
{
    $q = array_merge($f, $override);
    $keep = [];
    foreach (['q', 'status', 'view', 'buyer', 'product', 'from', 'to', 'sort', 'dir', 'page'] as $k) {
        $v = $q[$k] ?? '';
        if ($v === '' || ($k === 'view' && $v === 'active') || ($k === 'sort' && $v === 'date')
            || ($k === 'dir' && $v === 'desc') || ($k === 'page' && (int) $v <= 1)) {
            continue;
        }
        $keep[$k] = $v;
    }
    return http_build_query($keep);
}

/**
 * Dashboard numbers.
 * @param list<array<string,mixed>> $rows
 * @return array<string,mixed>
 */
function alok_stats(array $rows): array
{
    $tz = AlokConfig::tz();
    $now = new DateTimeImmutable('now', $tz);
    $today0 = $now->setTime(0, 0, 0);
    $weekStart = $today0->modify('monday this week')->getTimestamp();
    $monthStart = $today0->modify('first day of this month')->getTimestamp();

    $s = [
        'active' => 0, 'new' => 0, 'unseen' => 0, 'week' => 0, 'month' => 0, 'total' => count($rows),
        'archived' => 0, 'by_status' => array_fill_keys(AlokStore::STATUSES, 0),
        'buyers' => array_fill_keys(array_keys(ALOK_BUYER_TYPES), 0),
        'products' => [], 'series' => [], 'mail_failed' => 0,
    ];
    for ($i = 29; $i >= 0; $i--) {
        $s['series'][$today0->modify("-{$i} days")->format('Y-m-d')] = 0;
    }
    foreach ($rows as $r) {
        if ($r['archived']) {
            $s['archived']++;
            continue;
        }
        $s['active']++;
        $s['by_status'][$r['status']]++;
        if ($r['status'] === 'new') $s['new']++;
        if (!$r['seen']) $s['unseen']++;
        if ($r['created_at'] >= $weekStart) $s['week']++;
        if ($r['created_at'] >= $monthStart) $s['month']++;
        if (!$r['mail_ok']) $s['mail_failed']++;
        $s['buyers'][isset(ALOK_BUYER_TYPES[$r['buyer_type']]) ? $r['buyer_type'] : 'other']++;
        $day = (new DateTimeImmutable('@' . $r['created_at']))->setTimezone($tz)->format('Y-m-d');
        if (isset($s['series'][$day])) $s['series'][$day]++;
        $seen = [];
        foreach ($r['products'] as $p) {
            $n = trim((string) ($p['name'] ?? ''));
            if ($n === '' || isset($seen[mb_strtolower($n)])) continue;
            $seen[mb_strtolower($n)] = true;
            $s['products'][$n] = ($s['products'][$n] ?? 0) + 1;
        }
    }
    arsort($s['products']);
    $s['products'] = array_slice($s['products'], 0, 8, true);
    return $s;
}

function alok_unseen_count(): int
{
    $n = 0;
    foreach (AlokStore::open()->all() as $r) {
        if (!$r['archived'] && !$r['seen']) $n++;
    }
    return $n;
}

/* ── Formatting ────────────────────────────────────────────────────────────── */

function alok_date(int $ts, string $fmt = 'd M Y, H:i'): string
{
    if ($ts <= 0) return '';
    return (new DateTimeImmutable('@' . $ts))->setTimezone(AlokConfig::tz())->format($fmt);
}

function alok_ago(int $ts): string
{
    $d = time() - $ts;
    if ($d < 60) return 'just now';
    if ($d < 3600) return (int) ($d / 60) . ' min ago';
    if ($d < 86400) return (int) ($d / 3600) . ' h ago';
    if ($d < 86400 * 14) return (int) ($d / 86400) . ' d ago';
    return alok_date($ts, 'd M Y');
}

/* ── One-click contact links ───────────────────────────────────────────────── */

/**
 * Digits for tel:/wa.me. A bare 10-digit Indian mobile (starts 6-9) gets 91; a leading 0 is dropped;
 * anything else is used as typed (the form allows 7–15 digits and may include a country code).
 */
function alok_phone_digits(string $phone): string
{
    $plus = str_starts_with(trim($phone), '+');
    $d = preg_replace('/\D/', '', $phone) ?? '';
    if ($plus) return $d;
    if (str_starts_with($d, '00')) return substr($d, 2);
    if (strlen($d) === 11 && $d[0] === '0') $d = substr($d, 1);
    if (strlen($d) === 10 && preg_match('/^[6-9]/', $d)) return '91' . $d;
    return $d;
}

/** @return array{tel:string,wa:string,mail:string} empty strings when not applicable */
function alok_contact_links(array $r): array
{
    $digits = alok_phone_digits($r['phone']);
    $prod = $r['product'] !== '' && strtolower($r['product']) !== 'not specified' ? $r['product'] : 'your requirement';
    $greet = "Hello " . ($r['name'] !== '' ? $r['name'] : 'there') . ", thank you for your enquiry to Alok Plastics regarding " . $prod . ".";
    return [
        'tel'  => $digits !== '' ? 'tel:+' . $digits : '',
        'wa'   => $digits !== '' ? 'https://wa.me/' . $digits . '?text=' . rawurlencode($greet) : '',
        'mail' => $r['email'] !== ''
            ? 'mailto:' . rawurlencode($r['email']) . '?subject=' . rawurlencode('Your enquiry to Alok Plastics')
                . '&body=' . rawurlencode($greet . "\n\n")
            : '',
    ];
}

/* ── CSV ───────────────────────────────────────────────────────────────────── */

/** Neutralise spreadsheet formula injection. */
function alok_csv_cell(mixed $v): string
{
    $s = (string) $v;
    if ($s !== '' && preg_match('/^[=+\-@\t\r]/', $s) && !preg_match('/^\+[0-9 ()-]+$/', $s)) {
        return "'" . $s;
    }
    return $s;
}

/** @param list<array<string,mixed>> $rows */
function alok_csv_stream(array $rows): void
{
    $out = fopen('php://output', 'w');
    fwrite($out, "\xEF\xBB\xBF"); // UTF-8 BOM so Excel reads it correctly
    fputcsv($out, ['ID', 'Received (IST)', 'Status', 'Name', 'Company', 'Phone', 'Email', 'City', 'State', 'GSTIN',
        'Buyer type', 'Product(s)', 'Quantity', 'Unit', 'Message', 'Source page', 'Assigned to', 'Notes', 'Archived'], ',', '"', '');
    foreach ($rows as $r) {
        $notes = implode(' | ', array_map(
            static fn($n) => alok_date((int) ($n['at'] ?? 0), 'd M Y H:i') . ' ' . ($n['by'] ?? '') . ': ' . ($n['text'] ?? ''),
            $r['notes']
        ));
        fputcsv($out, array_map('alok_csv_cell', [
            $r['id'], alok_date($r['created_at'], 'Y-m-d H:i'), $r['status'], $r['name'], $r['company'], $r['phone'],
            $r['email'], $r['city'], $r['state'], $r['gstin'], ALOK_BUYER_TYPES[$r['buyer_type']] ?? $r['buyer_type'],
            $r['product'], $r['quantity'] ?: '', $r['quantity'] ? $r['unit'] : '', $r['message'], $r['source'],
            $r['assigned_to'], $notes, $r['archived'] ? 'yes' : '',
        ]), ',', '"', '');
    }
    fclose($out);
}
