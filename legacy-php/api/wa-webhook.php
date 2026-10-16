<?php

declare(strict_types=1);

require __DIR__ . '/_bootstrap.php';
require __DIR__ . '/lib/proforma.php';

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');

// Manual mode: the inbound webhook is OFF unless $ALOK_WHATSAPP_API['webhook'] is true in config.php.
$__waCfg = AlokShop::cfg('ALOK_WHATSAPP_API');
if (!is_array($__waCfg) || empty($__waCfg['webhook'])) {
    echo json_encode(['ok' => true, 'disabled' => true, 'service' => 'alok-wa-webhook']);
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'GET') {
    echo json_encode(['ok' => true, 'service' => 'alok-wa-webhook']);
    exit;
}

function alokWaParsePrice(string $raw): ?float
{
    if (stripos($raw, 'request') !== false) {
        return null;
    }
    if (preg_match('/([0-9][0-9,]*(?:\.[0-9]+)?)/', $raw, $m) !== 1) {
        return null;
    }
    $n = (float) str_replace(',', '', $m[1]);
    return $n >= 0 ? $n : null;
}

function alokWaParseOrder(string $text): array
{
    $lines = preg_split('/\r\n|\r|\n/', $text) ?: [];
    $items = [];
    $cur = -1;
    $customer = ['name' => '', 'phone' => '', 'address' => ''];
    $note = '';

    foreach ($lines as $line) {
        $line = rtrim($line);
        if ($line === '') {
            continue;
        }
        if (preg_match('/^\s*(\d+)[.)]\s+(.+)$/u', $line, $m) === 1) {
            $name = trim($m[2]);
            $qty = 0;
            $unit = 'pcs';
            if (preg_match('/\s*[×x]\s*(\d+)\s*([A-Za-z]*)\s*$/u', $name, $qm) === 1) {
                $qty = (int) $qm[1];
                if (($qm[2] ?? '') !== '') {
                    $unit = strtolower($qm[2]);
                }
                $name = trim(preg_replace('/\s*[×x]\s*\d+\s*[A-Za-z]*\s*$/u', '', $name) ?? $name);
            }
            $items[] = ['name' => $name, 'qty' => $qty, 'unit' => $unit, 'price' => null];
            $cur = count($items) - 1;
            continue;
        }
        if (preg_match('/^\s*Qty\s*:\s*(\d+)/iu', $line, $m) === 1 && $cur >= 0) {
            $items[$cur]['qty'] = (int) $m[1];
            continue;
        }
        if (preg_match('/^\s*Unit\s*:\s*([A-Za-z]+)/iu', $line, $m) === 1 && $cur >= 0) {
            $items[$cur]['unit'] = strtolower($m[1]);
            continue;
        }
        if (preg_match('/^\s*Price\s*:\s*(.+)$/iu', $line, $m) === 1 && $cur >= 0) {
            $items[$cur]['price'] = alokWaParsePrice($m[1]);
            continue;
        }
        if (preg_match('/^\s*Name\s*:\s*(.+)$/iu', $line, $m) === 1) {
            $customer['name'] = trim($m[1]);
            continue;
        }
        if (preg_match('/^\s*(?:Phone|Mobile|WhatsApp)\s*:\s*(.+)$/iu', $line, $m) === 1) {
            $customer['phone'] = trim($m[1]);
            continue;
        }
        if (preg_match('/^\s*(?:Delivery\s*address\s*\/\s*city|Delivery\s*Address|Address)\s*:\s*(.+)$/iu', $line, $m) === 1) {
            $customer['address'] = trim($m[1]);
            continue;
        }
        if (preg_match('/^\s*(?:Message|Note)\s*:\s*(.+)$/iu', $line, $m) === 1) {
            $note = trim($m[1]);
            continue;
        }
    }

    $clean = array_values(array_filter($items, static fn(array $it): bool => $it['name'] !== ''));
    foreach ($clean as $i => $it) {
        if ((int) $it['qty'] < 1) {
            $clean[$i]['qty'] = 1;
        }
    }
    return ['items' => $clean, 'customer' => $customer, 'note' => $note];
}

/** Store the proforma that was just sent: attach it to the order named by "Enquiry ID: ENQ-1001", or open a new quoted order. */
function alokWaRecord(string $text, string $to, array $parsed, array $res, string $no, array $payload, string $inboundId): ?string
{
    $digits = preg_replace('/\D/', '', $to) ?? '';
    $phone = AlokShop::phone($digits) ?? $digits;
    $send = AlokShop::waSendEntry('whatsapp', $phone, $res, '[PDF] Proforma Invoice ' . $no, 'pdf');
    $entry = $res['ok'] ? ['type' => 'proforma', 'no' => $no, 'date' => $payload['date'], 'created_at' => time(), 'sent_at' => time(), 'to' => $phone, 'url' => $res['url'], 'msg_id' => $res['msg_id'], 'caption' => $res['caption'], 'payload' => array_diff_key($payload, ['no' => 1, 'date' => 1])] : null;
    $label = $res['ok'] ? 'Proforma ' . $no . ' sent to the customer on WhatsApp.' : 'Proforma ' . $no . ' could not be sent (' . AlokShop::waReason($res) . ').';
    $note = ['at' => time(), 'by' => 'WhatsApp', 'text' => $label];

    $order = null;
    if (preg_match('/Enquiry\s*ID\s*:\s*\*?\s*((?:ENQ|AP)-\d+)/i', $text, $m) === 1) {
        $order = AlokShop::orders()->where('code', strtoupper($m[1]))[0] ?? null;
    }
    if ($order === null) {
        $items = [];
        foreach ($parsed['items'] as $it) {
            $items[] = ['slug' => '', 'name' => AlokShop::clean($it['name'], 140), 'variant' => '', 'qty' => max(1, min((int) $it['qty'], 999999)), 'unit' => AlokShop::clean($it['unit'], 12) ?: 'pcs', 'price' => $it['price']];
        }
        $name = AlokShop::clean($parsed['customer']['name'], 80) ?: 'WhatsApp customer';
        $customer = AlokShop::phone($digits) !== null ? AlokShop::upsertCustomer($phone, $name) : null;
        $order = AlokShop::orders()->insert([
            'code' => AlokShop::orderCode(),
            'customer_id' => (int) ($customer['id'] ?? 0),
            'name' => $name,
            'phone' => $phone,
            'address' => AlokShop::clean($parsed['customer']['address'], 300, true),
            'verified' => 1,
            'items' => $items,
            'total' => AlokShop::orderTotal($items),
            'note' => AlokShop::clean($parsed['note'], 1000, true),
            'status' => 'quoted',
            'auto_wa' => 1,
            'notes' => [],
            'ip' => '',
            'history' => [['at' => time(), 'by' => 'WhatsApp', 'from' => 'pending', 'to' => 'quoted']],
            'quoted_at' => time(),
        ]);
        $note['text'] = 'Order created from a WhatsApp message. ' . $label;
    }
    AlokShop::orders()->mutate((int) $order['id'], static function (array $o) use ($inboundId): array {
        if ($inboundId !== '') {
            $o['wa_in_ids'] = array_merge($o['wa_in_ids'] ?? [], [$inboundId]);
        }
        return $o;
    });
    AlokShop::logSend((int) $order['id'], $send, $entry, $note);
    return (string) $order['code'];
}
$cfg = AlokShop::cfg('ALOK_WHATSAPP_API');
$cfg = is_array($cfg) ? $cfg : [];
$apiKey = (string) ($cfg['key'] ?? '');
$secret = (string) ($cfg['secret'] ?? '');
$base = rtrim((string) ($cfg['base'] ?? 'https://wasenderapi.com'), '/');

$raw = (string) file_get_contents('php://input');
$sig = (string) ($_SERVER['HTTP_X_WEBHOOK_SIGNATURE'] ?? '');
$__hdr = [];
foreach ($_SERVER as $__k => $__v) {
    if (str_starts_with((string) $__k, 'HTTP_')) {
        $__hdr[$__k] = $__v;
    }
}
error_log('[alok-wa-webhook] POST sig_len=' . strlen($sig) . ' raw_len=' . strlen($raw) . ' headers=' . json_encode($__hdr));
if ($secret === '' || $sig === '' || !hash_equals($secret, $sig)) {
    http_response_code(401);
    echo json_encode(['ok' => false, 'error' => 'unauthorized']);
    exit;
}

$payload = json_decode($raw, true);
if (!is_array($payload)) {
    echo json_encode(['ok' => false, 'error' => 'bad json']);
    exit;
}

$event = (string) ($payload['event'] ?? '');
$msg = $payload['data']['messages'] ?? ($payload['data'] ?? null);
if (!is_array($msg)) {
    echo json_encode(['ok' => true, 'ignored' => 'no message']);
    exit;
}

$key = $msg['key'] ?? [];
if (!is_array($key)) {
    $key = [];
}
if (!empty($key['fromMe'])) {
    echo json_encode(['ok' => true, 'ignored' => 'from me']);
    exit;
}

$text = (string) ($msg['messageBody'] ?? ($msg['message']['conversation'] ?? ''));
$isOrder = stripos($text, 'order request') !== false
    || stripos($text, 'new enquiry') !== false
    || stripos($text, 'enquiry id') !== false;
if (!$isOrder) {
    echo json_encode(['ok' => true, 'ignored' => 'not an order', 'event' => $event]);
    exit;
}

$to = (string) ($key['senderPn'] ?? '');
if ($to === '' || str_contains($to, '@lid')) {
    $c = preg_replace('/\D/', '', (string) ($key['cleanedSenderPn'] ?? '')) ?? '';
    if (strlen($c) >= 10) {
        $to = $c;
    }
}
if ($to === '' || str_contains($to, '@lid')) {
    $rj = (string) ($key['remoteJid'] ?? '');
    if ($rj !== '' && !str_contains($rj, '@lid')) {
        $to = $rj;
    }
}
if ($to === '' || str_contains($to, '@lid') || $apiKey === '') {
    error_log('[alok-wa-webhook] cannot resolve recipient or missing key');
    echo json_encode(['ok' => false, 'error' => 'no recipient']);
    exit;
}

$inboundId = (string) ($key['id'] ?? '');
if ($inboundId !== '') {
    foreach (AlokShop::orders()->all() as $known) {
        if (in_array($inboundId, $known['wa_in_ids'] ?? [], true)) {
            echo json_encode(['ok' => true, 'ignored' => 'duplicate']);
            exit;
        }
    }
}

$parsed = alokWaParseOrder($text);
$no = alokProformaNo();
$senderDigits = preg_replace('/\D/', '', $to) ?? '';
$customer = $parsed['customer'];
$customer['phone'] = $customer['phone'] !== '' ? $customer['phone'] : $senderDigits;
$customer += ['state' => '', 'gstin' => ''];
$items = array_map(static fn(array $it): array => ['name' => $it['name'], 'hsn' => '', 'qty' => $it['qty'], 'unit' => $it['unit'], 'price' => $it['price']], $parsed['items']);
$payload = [
    'date' => AlokShop::fmt(time(), 'd-m-Y'),
    'customer' => $customer,
    'mode' => 'ut',
    'rate' => 18.0,
    'items' => $items,
    'note' => $parsed['note'],
    'transport' => ['transporter' => '', 'gr_no' => '', 'gr_dt' => ''],
];
$pdf = alokInvoicePdf($payload + ['no' => $no], 'proforma');

$caption = "Aapka order mil gaya — Proforma Invoice attached.\n"
    . "Zyada jankari ke liye humse contact karein:\n"
    . alokContactLine() . ".\n"
    . "— Alok Plastics";
$res = AlokShop::waSendDocument($to, $pdf, 'Proforma-' . preg_replace('/[^A-Za-z0-9]+/', '-', $no) . '.pdf', $caption);
$res['caption'] = $caption;
if (!$res['ok']) {
    error_log('[alok-wa-webhook] send failed: ' . json_encode($res));
}

$orderCode = null;
try {
    $orderCode = alokWaRecord($text, $to, $parsed, $res, $no, $payload, $inboundId);
} catch (Throwable $e) {
    error_log('[alok-wa-webhook] could not record the order: ' . $e->getMessage());
}

echo json_encode([
    'ok' => $res['ok'],
    'to' => $to,
    'proforma' => $no,
    'order' => $orderCode,
    'items' => count($parsed['items']),
    'url' => $res['url'],
    'sent' => $res['ok'],
]);
