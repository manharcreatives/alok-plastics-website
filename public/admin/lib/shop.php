<?php

declare(strict_types=1);

defined('ALOK_ADMIN') || exit;

final class AlokCollection
{
    public function __construct(private string $name)
    {
    }

    public static function of(string $name): self
    {
        return new self($name);
    }

    private function file(): string
    {
        return AlokConfig::dataDir() . '/' . $this->name . '.jsonl';
    }

    private function lock(callable $fn): mixed
    {
        return AlokFs::withLock($this->file() . '.lock', $fn);
    }

    private function read(): array
    {
        $f = $this->file();
        if (!is_file($f)) {
            return [];
        }
        $rows = [];
        $h = fopen($f, 'rb');
        if ($h === false) {
            return [];
        }
        while (($line = fgets($h)) !== false) {
            $line = trim($line);
            if ($line === '') {
                continue;
            }
            $j = json_decode($line, true);
            if (is_array($j) && isset($j['id'])) {
                $rows[] = $j;
            }
        }
        fclose($h);
        return $rows;
    }

    private function write(array $rows): void
    {
        $out = '';
        foreach ($rows as $r) {
            $out .= json_encode($r, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . "\n";
        }
        AlokFs::atomicWrite($this->file(), $out);
        @chmod($this->file(), 0640);
    }

    public function all(): array
    {
        $rows = $this->read();
        usort($rows, static fn(array $a, array $b): int => ((int) ($b['created_at'] ?? 0)) <=> ((int) ($a['created_at'] ?? 0)) ?: ((int) $b['id']) <=> ((int) $a['id']));
        return $rows;
    }

    public function find(int $id): ?array
    {
        foreach ($this->read() as $r) {
            if ((int) $r['id'] === $id) {
                return $r;
            }
        }
        return null;
    }

    public function where(string $field, mixed $value): array
    {
        return array_values(array_filter($this->all(), static fn(array $r): bool => ($r[$field] ?? null) === $value));
    }

    public function insert(array $row): array
    {
        return $this->lock(function () use ($row): array {
            $rows = $this->read();
            $max = 0;
            foreach ($rows as $r) {
                $max = max($max, (int) $r['id']);
            }
            $row['id'] = $max + 1;
            $row += ['created_at' => time(), 'updated_at' => time()];
            $rows[] = $row;
            $this->write($rows);
            return $row;
        });
    }

    public function update(int $id, array $patch): ?array
    {
        return $this->lock(function () use ($id, $patch): ?array {
            $rows = $this->read();
            $hit = null;
            foreach ($rows as $i => $r) {
                if ((int) $r['id'] === $id) {
                    $rows[$i] = array_replace($r, $patch, ['id' => $id, 'updated_at' => time()]);
                    $hit = $rows[$i];
                }
            }
            if ($hit !== null) {
                $this->write($rows);
            }
            return $hit;
        });
    }

    public function delete(int $id): bool
    {
        return (bool) $this->lock(function () use ($id): bool {
            $rows = $this->read();
            $kept = array_values(array_filter($rows, static fn(array $r): bool => (int) $r['id'] !== $id));
            if (count($kept) === count($rows)) {
                return false;
            }
            $this->write($kept);
            return true;
        });
    }
}

final class AlokShop
{
    /** Enquiry → order lifecycle, in order. 'cancelled' is reachable from any open stage. */
    public const ORDER_STATUSES = ['pending', 'reviewing', 'quoted', 'confirmed', 'paid', 'dispatched', 'invoiced', 'closed', 'cancelled'];
    public const ENQ_START = 1001;
    public const APPLICATION_STATUSES = ['new', 'reviewing', 'shortlisted', 'rejected', 'hired'];
    private const SESSION_DAYS = 30;
    private const OTP_TTL = 600;
    private const RESUME_MAX = 3145728;

    private static ?array $api = null;

    public static function apiConfig(): array
    {
        if (self::$api !== null) {
            return self::$api;
        }
        $defaults = [
            'ALOK_TO_EMAIL' => '',
            'ALOK_FROM_EMAIL' => '',
            'ALOK_SITE_URL' => '',
            'ALOK_WHATSAPP' => '',
            'ALOK_GAS_URL' => '',
            'ALOK_GAS_SECRET' => '',
            'ALOK_OTP' => [],
        ];
        $file = dirname(__DIR__, 2) . '/api/config.php';
        $vars = [];
        if (is_file($file)) {
            $vars = (static function (string $f): array {
                require $f;
                return get_defined_vars();
            })($file);
        }
        $env = [];
        foreach (array_keys($defaults) as $k) {
            $v = getenv($k);
            if (is_string($v) && $v !== '') {
                $env[$k] = $v;
            }
        }
        self::$api = array_replace($defaults, array_intersect_key($vars, $defaults), $env);
        if (!is_array(self::$api['ALOK_OTP'])) {
            self::$api['ALOK_OTP'] = [];
        }
        return self::$api;
    }

    public static function cfg(string $key): mixed
    {
        return self::apiConfig()[$key] ?? null;
    }

    public static function tz(): DateTimeZone
    {
        return AlokConfig::tz();
    }

    public static function fmt(int $ts, string $format = 'd M Y, H:i'): string
    {
        return (new DateTimeImmutable('@' . $ts))->setTimezone(self::tz())->format($format);
    }

    public static function clientIp(): string
    {
        $ip = (string) ($_SERVER['REMOTE_ADDR'] ?? '');
        return filter_var($ip, FILTER_VALIDATE_IP) !== false ? $ip : '';
    }

    public static function clean(mixed $v, int $max = 200, bool $multiline = false): string
    {
        $s = strip_tags((string) $v);
        $s = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', $s) ?? '';
        if (!$multiline) {
            $s = preg_replace('/\s+/u', ' ', $s) ?? '';
        }
        return mb_substr(trim($s), 0, $max);
    }

    public static function phone(string $raw): ?string
    {
        $d = preg_replace('/\D/', '', $raw) ?? '';
        if (strlen($d) === 12 && str_starts_with($d, '91')) {
            $d = substr($d, 2);
        } elseif (strlen($d) === 11 && $d[0] === '0') {
            $d = substr($d, 1);
        }
        return preg_match('/^[6-9]\d{9}$/', $d) === 1 ? '91' . $d : null;
    }

    public static function respond(int $status, array $data): never
    {
        http_response_code($status);
        echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }

    public static function boot(string $method = 'POST'): array
    {
        ini_set('display_errors', '0');
        ini_set('log_errors', '1');
        header('Content-Type: application/json; charset=utf-8');
        header('Cache-Control: no-store');
        header('X-Content-Type-Options: nosniff');
        header('X-Frame-Options: DENY');
        header("Content-Security-Policy: default-src 'none'");

        $site = rtrim((string) self::cfg('ALOK_SITE_URL'), '/');
        $origin = rtrim((string) ($_SERVER['HTTP_ORIGIN'] ?? ''), '/');
        $referer = (string) ($_SERVER['HTTP_REFERER'] ?? '');
        $allowed = array_filter([$site, 'http://localhost:3000', 'http://localhost:3001']);
        $okOrigin = in_array($origin, $allowed, true) || ($origin === '' && $site !== '' && str_starts_with($referer, $site));
        if ($origin !== '' && $okOrigin) {
            header('Access-Control-Allow-Origin: ' . $origin);
            header('Vary: Origin');
        }
        header('Access-Control-Allow-Methods: ' . $method . ', OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, X-Alok-Session');

        if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
            http_response_code(204);
            exit;
        }
        if (($_SERVER['REQUEST_METHOD'] ?? '') !== $method) {
            self::respond(405, ['ok' => false, 'error' => 'Method not allowed.']);
        }
        if (!$okOrigin) {
            self::respond(403, ['ok' => false, 'error' => 'Forbidden.']);
        }
        $ct = (string) ($_SERVER['CONTENT_TYPE'] ?? '');
        if (str_contains($ct, 'application/json')) {
            $j = json_decode((string) file_get_contents('php://input'), true);
            return is_array($j) ? $j : [];
        }
        return $_POST;
    }

    public static function rateLimit(string $key, int $max, int $window): bool
    {
        $file = AlokConfig::dataDir() . '/ratelimit.json';
        return (bool) AlokFs::withLock($file . '.lock', static function () use ($file, $key, $max, $window): bool {
            $d = AlokFs::readJson($file) ?? [];
            $now = time();
            foreach ($d as $k => $hits) {
                $d[$k] = array_values(array_filter((array) $hits, static fn($t): bool => (int) $t > $now - 86400));
                if (!$d[$k]) {
                    unset($d[$k]);
                }
            }
            $recent = array_values(array_filter($d[$key] ?? [], static fn($t): bool => (int) $t > $now - $window));
            $ok = count($recent) < $max;
            if ($ok) {
                $d[$key] = array_merge($d[$key] ?? [], [$now]);
            }
            AlokFs::atomicWrite($file, json_encode($d));
            @chmod($file, 0640);
            return $ok;
        });
    }

    private static function otpFile(): string
    {
        return AlokConfig::dataDir() . '/otp.json';
    }

    public static function sendOtp(string $phone, string $name): array
    {
        $cfg = self::cfg('ALOK_OTP');
        $provider = (string) ($cfg['provider'] ?? '');
        $dev = !empty($cfg['dev_mode']);
        if ($provider === '' && !$dev) {
            return ['ok' => false, 'code' => 'sms_unavailable', 'error' => 'OTP service is not set up yet.'];
        }
        $code = (string) random_int(100000, 999999);
        $state = AlokFs::withLock(self::otpFile() . '.lock', function () use ($phone, $code): ?string {
            $d = AlokFs::readJson(self::otpFile()) ?? [];
            $now = time();
            foreach ($d as $k => $e) {
                if (($e['exp'] ?? 0) < $now - 3600) {
                    unset($d[$k]);
                }
            }
            $cur = $d[$phone] ?? null;
            if (is_array($cur) && ($cur['sent'] ?? 0) > $now - 30) {
                return 'wait';
            }
            $d[$phone] = ['hash' => password_hash($code, PASSWORD_DEFAULT), 'exp' => $now + self::OTP_TTL, 'tries' => 0, 'sent' => $now];
            AlokFs::atomicWrite(self::otpFile(), json_encode($d));
            @chmod(self::otpFile(), 0640);
            return null;
        });
        if ($state === 'wait') {
            return ['ok' => false, 'code' => 'cooldown', 'error' => 'Please wait 30 seconds before requesting another code.'];
        }
        if ($dev && $provider === '') {
            return ['ok' => true, 'devCode' => $code];
        }
        if (!self::deliverOtp($provider, $cfg, $phone, $code, $name)) {
            return ['ok' => false, 'code' => 'sms_failed', 'error' => 'Could not send the code. Please try again.'];
        }
        return ['ok' => true];
    }

    private static function deliverOtp(string $provider, array $cfg, string $phone, string $code, string $name): bool
    {
        $key = (string) ($cfg['key'] ?? '');
        $ten = substr($phone, 2);
        switch ($provider) {
            case 'msg91':
                $res = self::http('https://control.msg91.com/api/v5/otp?' . http_build_query([
                    'template_id' => (string) ($cfg['template'] ?? ''),
                    'mobile' => $phone,
                    'authkey' => $key,
                    'otp' => $code,
                ]), 'POST', ['Content-Type: application/json'], '{}');
                return $res !== null && $res['status'] >= 200 && $res['status'] < 300 && !str_contains(strtolower($res['body']), '"type":"error"');
            case 'fast2sms':
                $res = self::http('https://www.fast2sms.com/dev/bulkV2?' . http_build_query([
                    'authorization' => $key,
                    'route' => 'otp',
                    'variables_values' => $code,
                    'numbers' => $ten,
                ]), 'GET', [], null);
                return $res !== null && $res['status'] >= 200 && $res['status'] < 300 && str_contains($res['body'], 'true');
            case 'webhook':
                $url = (string) ($cfg['webhook'] ?? '');
                if ($url === '') {
                    return false;
                }
                $res = self::http($url, 'POST', ['Content-Type: application/json', 'Authorization: Bearer ' . $key], json_encode([
                    'phone' => $phone,
                    'otp' => $code,
                    'name' => $name,
                    'message' => 'Your Alok Plastics verification code is ' . $code . '. Valid for 10 minutes.',
                ]));
                return $res !== null && $res['status'] >= 200 && $res['status'] < 300;
        }
        return false;
    }

    public static function verifyOtp(string $phone, string $code): bool
    {
        $cfg = self::cfg('ALOK_OTP');
        $master = (string) ($cfg['master_code'] ?? '');
        if ($master !== '' && !empty($cfg['dev_mode']) && hash_equals($master, $code)) {
            return true;
        }
        return (bool) AlokFs::withLock(self::otpFile() . '.lock', static function () use ($phone, $code): bool {
            $d = AlokFs::readJson(self::otpFile()) ?? [];
            $e = $d[$phone] ?? null;
            if (!is_array($e) || ($e['exp'] ?? 0) < time() || ($e['tries'] ?? 0) >= 5) {
                return false;
            }
            $ok = password_verify($code, (string) $e['hash']);
            if ($ok) {
                unset($d[$phone]);
            } else {
                $d[$phone]['tries'] = (int) $e['tries'] + 1;
            }
            AlokFs::atomicWrite(self::otpFile(), json_encode($d));
            return $ok;
        });
    }

    public static function customers(): AlokCollection
    {
        return AlokCollection::of('customers');
    }

    public static function orders(): AlokCollection
    {
        return AlokCollection::of('orders');
    }

    public static function applications(): AlokCollection
    {
        return AlokCollection::of('applications');
    }

    public static function carts(): AlokCollection
    {
        return AlokCollection::of('carts');
    }

    /** Legacy status names (processing/completed) map onto the current lifecycle. */
    public static function normStatus(string $s): string
    {
        return ['processing' => 'reviewing', 'completed' => 'closed'][$s] ?? $s;
    }

    /** The one forward step from a stage, or null when the order is finished or cancelled. */
    public static function nextStatus(string $s): ?string
    {
        $flow = ['pending', 'reviewing', 'quoted', 'confirmed', 'paid', 'dispatched', 'invoiced', 'closed'];
        $i = array_search(self::normStatus($s), $flow, true);
        return $i === false || $i >= count($flow) - 1 ? null : $flow[$i + 1];
    }

    public static function sessions(): AlokCollection
    {
        return AlokCollection::of('sessions');
    }

    public static function upsertCustomer(string $phone, string $name): array
    {
        $found = self::customers()->where('phone', $phone);
        if ($found) {
            return self::customers()->update((int) $found[0]['id'], ['name' => $name, 'last_login' => time()]) ?? $found[0];
        }
        return self::customers()->insert(['phone' => $phone, 'name' => $name, 'last_login' => time(), 'ip' => self::clientIp()]);
    }

    public static function startSession(array $customer): string
    {
        $token = bin2hex(random_bytes(32));
        $sessions = self::sessions();
        foreach ($sessions->all() as $s) {
            if ((int) ($s['expires'] ?? 0) < time()) {
                $sessions->delete((int) $s['id']);
            }
        }
        $sessions->insert([
            'customer_id' => (int) $customer['id'],
            'hash' => hash('sha256', $token),
            'expires' => time() + self::SESSION_DAYS * 86400,
            'ip' => self::clientIp(),
        ]);
        return $token;
    }

    public static function customerFromRequest(): ?array
    {
        $token = (string) ($_SERVER['HTTP_X_ALOK_SESSION'] ?? '');
        if (!preg_match('/^[a-f0-9]{64}$/', $token)) {
            return null;
        }
        $hash = hash('sha256', $token);
        foreach (self::sessions()->all() as $s) {
            if (hash_equals((string) $s['hash'], $hash) && (int) $s['expires'] > time()) {
                return self::customers()->find((int) $s['customer_id']);
            }
        }
        return null;
    }

    public static function endSession(): void
    {
        $token = (string) ($_SERVER['HTTP_X_ALOK_SESSION'] ?? '');
        if (!preg_match('/^[a-f0-9]{64}$/', $token)) {
            return;
        }
        $hash = hash('sha256', $token);
        foreach (self::sessions()->all() as $s) {
            if (hash_equals((string) $s['hash'], $hash)) {
                self::sessions()->delete((int) $s['id']);
            }
        }
    }

    /** Sequential, human-friendly enquiry ID (ENQ-1001, ENQ-1002 …). The counter is lock-protected. */
    public static function orderCode(): string
    {
        $file = AlokConfig::dataDir() . '/enq-seq.json';
        $n = (int) AlokFs::withLock($file . '.lock', static function () use ($file): int {
            $last = max((int) ((AlokFs::readJson($file) ?? [])['last'] ?? 0), self::ENQ_START - 1);
            foreach (self::orders()->all() as $o) {
                if (preg_match('/^ENQ-(\d+)$/', (string) ($o['code'] ?? ''), $m)) {
                    $last = max($last, (int) $m[1]);
                }
            }
            $next = $last + 1;
            AlokFs::atomicWrite($file, json_encode(['last' => $next]));
            @chmod($file, 0640);
            return $next;
        });
        return 'ENQ-' . $n;
    }

    /** Cart lines as the admin shows them (live carts). Prices are informational only. */
    public static function cleanCartLines(mixed $raw): array
    {
        $out = [];
        foreach (is_array($raw) ? array_slice($raw, 0, 60) : [] as $it) {
            if (!is_array($it)) {
                continue;
            }
            $qty = (int) ($it['qty'] ?? 0);
            $name = self::clean($it['name'] ?? '', 140);
            if ($name === '' || $qty < 1) {
                continue;
            }
            $out[] = [
                'slug' => self::clean($it['slug'] ?? '', 120),
                'name' => $name,
                'sku' => self::clean($it['sku'] ?? '', 60),
                'qty' => min($qty, 999999),
                'price' => isset($it['price']) && is_numeric($it['price']) ? max(0.0, (float) $it['price']) : null,
                'availability' => in_array($it['availability'] ?? '', ['in-stock', 'out-of-stock', 'on-request'], true) ? $it['availability'] : 'on-request',
            ];
        }
        return $out;
    }

    /** Customer-facing WhatsApp text for the order's current stage; the admin sends it from the order screen. */
    public static function stageMessage(array $o): string
    {
        $c = (string) $o['code'];
        $name = explode(' ', trim((string) $o['name']))[0];
        $money = static fn($v): string => 'Rs. ' . number_format((float) $v, 0);
        $has = static fn(string $k): bool => isset($o[$k]) && $o[$k] !== '' && $o[$k] !== null;
        switch (self::normStatus((string) $o['status'])) {
            case 'pending':
                return "Hello {$name}, we have received your enquiry {$c}. Our team is reviewing it and will share the quote shortly. - Alok Plastics";
            case 'reviewing':
                return "Hello {$name}, your enquiry {$c} is under review. We will send you the quote / proforma invoice soon. - Alok Plastics";
            case 'quoted':
                return "Hello {$name}, please find the quote / proforma invoice for enquiry {$c}."
                    . ($has('quote_amount') ? ' Quoted amount: ' . $money($o['quote_amount']) . '.' : '')
                    . ($has('quote_note') ? ' ' . $o['quote_note'] : '')
                    . ' Reply here to confirm the order. - Alok Plastics';
            case 'confirmed':
                return "Hello {$name}, your order {$c} is CONFIRMED. Please make the payment offline as per the proforma invoice and share the payment details here. - Alok Plastics";
            case 'paid':
                return "Hello {$name}, we have received your payment" . ($has('pay_amount') ? ' of ' . $money($o['pay_amount']) : '')
                    . " for order {$c}. Thank you! We are preparing your dispatch. - Alok Plastics";
            case 'dispatched':
                return "Hello {$name}, your order {$c} has been dispatched."
                    . ($has('lr_no') ? ' LR / tracking no: ' . $o['lr_no'] . ($has('transporter') ? ' (' . $o['transporter'] . ')' : '') . '.' : '')
                    . ' - Alok Plastics';
            case 'invoiced':
                return "Hello {$name}, the GST invoice for order {$c} has been issued." . ($has('invoice_no') ? ' Invoice no: ' . $o['invoice_no'] . '.' : '') . ' - Alok Plastics';
            case 'closed':
                return "Hello {$name}, order {$c} is now closed. Thank you for choosing Alok Plastics!";
        }
        return "Hello {$name}, this is Alok Plastics regarding {$c}.";
    }

    /** Gapless GST-invoice number per financial year (April to March): AP/2026-27/0001. */
    public static function nextInvoiceNo(): string
    {
        $now = new DateTimeImmutable('now', self::tz());
        $start = (int) $now->format('n') >= 4 ? (int) $now->format('Y') : (int) $now->format('Y') - 1;
        $fy = $start . '-' . substr((string) ($start + 1), 2);
        $file = AlokConfig::dataDir() . '/invoice-seq.json';
        $n = (int) AlokFs::withLock($file . '.lock', static function () use ($file, $fy): int {
            $d = AlokFs::readJson($file) ?? [];
            $d[$fy] = (int) ($d[$fy] ?? 0) + 1;
            AlokFs::atomicWrite($file, json_encode($d));
            @chmod($file, 0640);
            return $d[$fy];
        });
        return 'AP/' . $fy . '/' . str_pad((string) $n, 4, '0', STR_PAD_LEFT);
    }

    public static function cleanItems(mixed $raw): array
    {
        $items = [];
        foreach (is_array($raw) ? array_slice($raw, 0, 60) : [] as $it) {
            if (!is_array($it)) {
                continue;
            }
            $name = self::clean($it['name'] ?? '', 140);
            $qty = (int) ($it['qty'] ?? 0);
            if ($name === '' || $qty < 1) {
                continue;
            }
            $price = isset($it['price']) && is_numeric($it['price']) ? max(0.0, (float) $it['price']) : null;
            $items[] = [
                'slug' => self::clean($it['slug'] ?? '', 120),
                'name' => $name,
                'variant' => self::clean($it['variant'] ?? '', 120),
                'qty' => min($qty, 999999),
                'unit' => in_array($it['unit'] ?? '', ['pcs', 'sets'], true) ? $it['unit'] : 'pcs',
                'price' => $price,
            ];
        }
        return $items;
    }

    public static function orderTotal(array $items): ?float
    {
        $sum = 0.0;
        foreach ($items as $it) {
            if ($it['price'] === null) {
                return null;
            }
            $sum += $it['price'] * $it['qty'];
        }
        return $items ? $sum : null;
    }

    public static function orderText(array $o): string
    {
        $lines = ['*New Enquiry — Alok Plastics*', '', 'Enquiry ID: ' . $o['code'], 'Date: ' . self::fmt((int) $o['created_at'], 'd M Y, h:i A'), 'Name: ' . $o['name'], 'Mobile: +' . $o['phone'], 'Address: ' . ($o['address'] ?? ''), '', '*Items*'];
        foreach ($o['items'] as $i => $it) {
            $lines[] = ($i + 1) . '. ' . $it['name'] . ($it['variant'] !== '' ? ' (' . $it['variant'] . ')' : '') . ' × ' . $it['qty'] . ' ' . $it['unit'];
        }
        if ($o['total'] !== null) {
            $lines[] = '';
            $lines[] = 'Estimated total: Rs. ' . number_format((float) $o['total'], 0);
        }
        if (($o['note'] ?? '') !== '') {
            $lines[] = '';
            $lines[] = 'Note: ' . $o['note'];
        }
        $lines[] = '';
        $lines[] = 'Please share the quote / proforma invoice.';
        return implode("\n", $lines);
    }

    public static function waNumber(): string
    {
        return preg_replace('/\D/', '', (string) self::cfg('ALOK_WHATSAPP')) ?? '';
    }

    public static function mailClient(string $subject, string $body, string $replyTo = ''): bool
    {
        return self::mailTo((string) self::cfg('ALOK_TO_EMAIL'), $subject, $body, $replyTo);
    }

    /** Plain-text email from the website's sender address. False when no sender/recipient or the host refuses. */
    public static function mailTo(string $to, string $subject, string $body, string $replyTo = ''): bool
    {
        $from = (string) self::cfg('ALOK_FROM_EMAIL');
        if ($to === '' || $from === '' || filter_var($to, FILTER_VALIDATE_EMAIL) === false) {
            return false;
        }
        $subject = preg_replace('/[\r\n]+/', ' ', $subject) ?? $subject;
        $h = "From: \"Alok Plastics Website\" <{$from}>\r\n";
        if ($replyTo !== '' && filter_var($replyTo, FILTER_VALIDATE_EMAIL) !== false) {
            $h .= "Reply-To: {$replyTo}\r\n";
        }
        $h .= "MIME-Version: 1.0\r\nContent-Type: text/plain; charset=utf-8\r\nContent-Transfer-Encoding: 8bit\r\n";
        return @mail($to, mb_encode_mimeheader($subject, 'UTF-8'), $body, $h);
    }

    public static function postToGas(array $payload): bool
    {
        $url = (string) self::cfg('ALOK_GAS_URL');
        if ($url === '') {
            return false;
        }
        $payload['secret'] = (string) self::cfg('ALOK_GAS_SECRET');
        $res = self::http($url, 'POST', ['Content-Type: application/json'], json_encode($payload, JSON_UNESCAPED_UNICODE), 25);
        if ($res === null || $res['status'] < 200 || $res['status'] >= 400) {
            return false;
        }
        $j = json_decode($res['body'], true);
        return !is_array($j) || !empty($j['ok']);
    }

    public static function http(string $url, string $method, array $headers, ?string $body, int $timeout = 15): ?array
    {
        if (function_exists('curl_init')) {
            $c = curl_init($url);
            curl_setopt_array($c, [
                CURLOPT_CUSTOMREQUEST => $method,
                CURLOPT_HTTPHEADER => $headers,
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_FOLLOWLOCATION => true,
                CURLOPT_MAXREDIRS => 5,
                CURLOPT_TIMEOUT => $timeout,
                CURLOPT_CONNECTTIMEOUT => 8,
            ]);
            if ($body !== null) {
                curl_setopt($c, CURLOPT_POSTFIELDS, $body);
                if ($method === 'POST') {
                    curl_setopt($c, CURLOPT_POST, true);
                }
            }
            $out = curl_exec($c);
            $status = (int) curl_getinfo($c, CURLINFO_RESPONSE_CODE);
            curl_close($c);
            return $out === false ? null : ['status' => $status, 'body' => (string) $out];
        }
        $ctx = stream_context_create(['http' => [
            'method' => $method,
            'header' => implode("\r\n", $headers),
            'content' => $body ?? '',
            'timeout' => $timeout,
            'ignore_errors' => true,
        ]]);
        $out = @file_get_contents($url, false, $ctx);
        if ($out === false) {
            return null;
        }
        $status = 0;
        foreach ($http_response_header ?? [] as $h) {
            if (preg_match('#^HTTP/\S+\s+(\d{3})#', $h, $m)) {
                $status = (int) $m[1];
            }
        }
        return ['status' => $status, 'body' => $out];
    }

    public static function resumeDir(): string
    {
        $dir = AlokConfig::dataDir() . '/resumes';
        if (!is_dir($dir)) {
            @mkdir($dir, 0750, true);
        }
        return $dir;
    }

    public static function storeResume(array $file): array
    {
        $err = (int) ($file['error'] ?? UPLOAD_ERR_NO_FILE);
        if ($err === UPLOAD_ERR_NO_FILE) {
            return ['file' => null, 'error' => null];
        }
        if ($err !== UPLOAD_ERR_OK || !is_uploaded_file((string) ($file['tmp_name'] ?? ''))) {
            return ['file' => null, 'error' => 'The resume could not be uploaded. Try a smaller file.'];
        }
        $size = (int) $file['size'];
        if ($size < 1 || $size > self::RESUME_MAX) {
            return ['file' => null, 'error' => 'The resume must be under 3 MB.'];
        }
        $ext = strtolower(pathinfo((string) $file['name'], PATHINFO_EXTENSION));
        if (!in_array($ext, ['pdf', 'doc', 'docx'], true)) {
            return ['file' => null, 'error' => 'The resume must be a PDF, DOC or DOCX file.'];
        }
        $head = (string) file_get_contents((string) $file['tmp_name'], false, null, 0, 4);
        $isPdf = str_starts_with($head, '%PDF');
        $isZip = str_starts_with($head, "PK\x03\x04");
        $isOle = str_starts_with($head, "\xD0\xCF\x11\xE0");
        $good = ($ext === 'pdf' && $isPdf) || ($ext === 'docx' && $isZip) || ($ext === 'doc' && $isOle);
        if (!$good) {
            return ['file' => null, 'error' => 'That file does not look like a valid ' . strtoupper($ext) . '.'];
        }
        $stored = bin2hex(random_bytes(12)) . '.' . $ext;
        if (!move_uploaded_file((string) $file['tmp_name'], self::resumeDir() . '/' . $stored)) {
            return ['file' => null, 'error' => 'The resume could not be saved. Please try again.'];
        }
        @chmod(self::resumeDir() . '/' . $stored, 0640);
        return ['file' => ['stored' => $stored, 'original' => self::clean($file['name'], 120), 'size' => $size, 'ext' => $ext], 'error' => null];
    }

    public static function resumePath(string $stored): ?string
    {
        if (!preg_match('/^[a-f0-9]{24}\.(pdf|docx?)$/', $stored)) {
            return null;
        }
        $p = self::resumeDir() . '/' . $stored;
        return is_file($p) ? $p : null;
    }

    public static function safeUrl(string $v): string
    {
        $v = trim($v);
        if ($v === '') {
            return '';
        }
        if (!preg_match('#^https?://#i', $v)) {
            $v = 'https://' . $v;
        }
        return filter_var($v, FILTER_VALIDATE_URL) !== false && mb_strlen($v) <= 400 ? $v : '';
    }
}

const ALOK_ORDER_LABELS = [
    'pending' => 'New enquiry',
    'reviewing' => 'Under review',
    'quoted' => 'Quote sent',
    'confirmed' => 'Order confirmed',
    'paid' => 'Payment received',
    'dispatched' => 'Dispatched',
    'invoiced' => 'GST invoice issued',
    'closed' => 'Closed',
    'cancelled' => 'Cancelled',
];

const ALOK_APPLICATION_LABELS = [
    'new' => 'New',
    'reviewing' => 'Reviewing',
    'shortlisted' => 'Shortlisted',
    'rejected' => 'Rejected',
    'hired' => 'Hired',
];
