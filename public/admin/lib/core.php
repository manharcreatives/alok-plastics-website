<?php
/**
 * Alok Plastics admin — core: configuration, filesystem helpers, enquiry storage.
 *
 * Shared by the admin panel (public/admin/index.php) and the public endpoint
 * (public/api/enquiry.php). Contains no output and no side effects on include.
 * This folder is denied to direct web access by lib/.htaccess.
 */

declare(strict_types=1);

defined('ALOK_ADMIN') || exit;

/* ── Configuration ─────────────────────────────────────────────────────────── */

final class AlokConfig
{
    private static ?array $cfg = null;

    public static function configFile(): string
    {
        return dirname(__DIR__) . '/config.php';
    }

    public static function exists(): bool
    {
        return is_file(self::configFile());
    }

    /** @return array<string,mixed> */
    public static function load(): array
    {
        if (self::$cfg !== null) {
            return self::$cfg;
        }
        $defaults = [
            'users'               => [],            // username => ['name' => 'Display', 'hash' => password_hash()]
            'data_dir'            => null,          // absolute path; ideally OUTSIDE public_html
            'public_data_dir'     => null,          // where careers.json are written (default: <webroot>/data)
            'timezone'            => 'Asia/Kolkata',
            'session_idle_minutes' => 30,
            'session_max_hours'   => 12,
            'max_failed_logins'   => 5,
            'lockout_minutes'     => 15,
            'per_page'            => 25,
        ];
        $c = [];
        if (self::exists()) {
            $loaded = (static function (string $f) {
                return require $f;
            })(self::configFile());
            if (is_array($loaded)) {
                $c = $loaded;
            }
        }
        self::$cfg = array_replace($defaults, $c);
        return self::$cfg;
    }

    public static function get(string $key, mixed $default = null): mixed
    {
        return self::load()[$key] ?? $default;
    }

    public static function tz(): DateTimeZone
    {
        try {
            return new DateTimeZone((string) self::get('timezone', 'Asia/Kolkata'));
        } catch (Throwable) {
            return new DateTimeZone('Asia/Kolkata');
        }
    }

    /** Private data folder (SQLite / JSONL / audit / sessions). Created and fenced on first use. */
    public static function dataDir(): string
    {
        $dir = self::get('data_dir');
        $dir = is_string($dir) && $dir !== '' ? rtrim($dir, '/\\') : dirname(__DIR__) . '/data';
        if (!is_dir($dir) && !@mkdir($dir, 0750, true) && !is_dir($dir)) {
            throw new RuntimeException('Data folder cannot be created: ' . $dir);
        }
        // Belt and braces for the case where the folder sits inside the web root.
        $ht = $dir . '/.htaccess';
        if (!is_file($ht)) {
            @file_put_contents($ht, "Require all denied\n<IfModule !mod_authz_core.c>\nOrder deny,allow\nDeny from all\n</IfModule>\n");
        }
        if (!is_file($dir . '/index.html')) {
            @file_put_contents($dir . '/index.html', '');
        }
        if (!is_writable($dir)) {
            throw new RuntimeException('Data folder is not writable: ' . $dir);
        }
        return $dir;
    }

    /** Folder served publicly as /data/ (careers.json, product-overrides.json). */
    public static function publicDataDir(): string
    {
        $dir = self::get('public_data_dir');
        return is_string($dir) && $dir !== '' ? rtrim($dir, '/\\') : dirname(__DIR__, 2) . '/data';
    }

    /**
     * Update a user's bcrypt hash in config.php by re-exporting the config array.
     * Returns true on success.
     */
    public static function updateUserHash(string $username, string $newHash): bool
    {
        $file = self::configFile();
        if (!is_file($file) || !is_writable($file)) {
            return false;
        }
        // Load the raw config array via isolated closure (avoids class method recursion)
        $cfg = (static function (string $f) { return require $f; })($file);
        if (!is_array($cfg)) {
            return false;
        }
        $lower = strtolower($username);
        $found = false;
        foreach ($cfg['users'] ?? [] as $k => &$u) {
            if (strtolower((string) $k) === $lower && is_array($u)) {
                $u['hash'] = $newHash;
                $found     = true;
                break;
            }
        }
        unset($u);
        if (!$found) {
            return false;
        }
        try {
            $php = "<?php\nreturn " . var_export($cfg, true) . ";\n";
            AlokFs::atomicWrite($file, $php);
            self::$cfg = null; // invalidate cache
            return true;
        } catch (Throwable) {
            return false;
        }
    }
}

/* ── Filesystem helpers ────────────────────────────────────────────────────── */

final class AlokFs
{
    /** Write a file atomically (temp file in the same folder + rename). */
    public static function atomicWrite(string $path, string $contents): void
    {
        $tmp = $path . '.' . bin2hex(random_bytes(6)) . '.tmp';
        if (file_put_contents($tmp, $contents, LOCK_EX) === false) {
            throw new RuntimeException('Cannot write ' . basename($path));
        }
        @chmod($tmp, 0644);
        if (!@rename($tmp, $path)) {
            @unlink($tmp);
            throw new RuntimeException('Cannot replace ' . basename($path));
        }
    }

    /** Run $fn while holding an exclusive lock on $lockPath. */
    public static function withLock(string $lockPath, callable $fn): mixed
    {
        $h = fopen($lockPath, 'c');
        if ($h === false) {
            throw new RuntimeException('Cannot open lock file');
        }
        try {
            if (!flock($h, LOCK_EX)) {
                throw new RuntimeException('Cannot lock');
            }
            return $fn();
        } finally {
            flock($h, LOCK_UN);
            fclose($h);
        }
    }

    public static function readJson(string $path): ?array
    {
        if (!is_file($path)) {
            return null;
        }
        $raw = @file_get_contents($path);
        if ($raw === false || $raw === '') {
            return null;
        }
        $j = json_decode($raw, true);
        return is_array($j) ? $j : null;
    }
}

/* ── Storage: enquiries + audit log ────────────────────────────────────────── */

abstract class AlokStore
{
    public const STATUSES = ['new', 'contacted', 'quoted', 'won', 'lost'];

    /** Fields the admin is allowed to change after a record is created. */
    protected const MUTABLE = ['status', 'notes', 'assigned_to', 'seen', 'archived', 'updated_at'];

    private static ?AlokStore $instance = null;

    /** SQLite when PDO+sqlite is available (and no JSONL data exists yet); otherwise JSON-lines. */
    public static function open(): AlokStore
    {
        if (self::$instance !== null) {
            return self::$instance;
        }
        $dir = AlokConfig::dataDir();
        $jsonl = $dir . '/enquiries.jsonl';
        $useSqlite = extension_loaded('pdo_sqlite') && !is_file($jsonl);
        self::$instance = $useSqlite ? new AlokSqliteStore($dir) : new AlokJsonlStore($dir);
        return self::$instance;
    }

    abstract public function backend(): string;

    /** @param array<string,mixed> $row  @return int new id */
    abstract public function insert(array $row): int;

    /** @return array<string,mixed>|null */
    abstract public function get(int $id): ?array;

    /** @return list<array<string,mixed>> every record, hydrated */
    abstract public function all(): array;

    /** @param array<string,mixed> $fields */
    abstract public function update(int $id, array $fields): bool;

    abstract public function delete(int $id): bool;

    /** Anonymised, salted, truncated hash of an IP (the raw IP is never stored). */
    public function ipHash(string $ip): string
    {
        $dir = AlokConfig::dataDir();
        $saltFile = $dir . '/.salt';
        $salt = is_file($saltFile) ? trim((string) file_get_contents($saltFile)) : '';
        if (strlen($salt) < 32) {
            $salt = bin2hex(random_bytes(32));
            @file_put_contents($saltFile, $salt, LOCK_EX);
            @chmod($saltFile, 0600);
        }
        return substr(hash_hmac('sha256', $ip, $salt), 0, 20);
    }

    /* Audit log — append-only JSON lines, independent of the enquiry backend. */

    public function audit(string $user, string $action, string $target = '', string $detail = '', string $ip = ''): void
    {
        $line = json_encode([
            'ts'     => time(),
            'user'   => mb_substr($user, 0, 60),
            'action' => mb_substr($action, 0, 40),
            'target' => mb_substr($target, 0, 80),
            'detail' => mb_substr($detail, 0, 200),
            'ip'     => $ip !== '' ? $this->ipHash($ip) : '',
        ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        @file_put_contents(AlokConfig::dataDir() . '/audit.jsonl', $line . "\n", FILE_APPEND | LOCK_EX);
    }

    /** @return list<array<string,mixed>> newest first */
    public function auditTail(int $n = 200): array
    {
        $file = AlokConfig::dataDir() . '/audit.jsonl';
        if (!is_file($file)) {
            return [];
        }
        $size = (int) filesize($file);
        $h = fopen($file, 'rb');
        if ($h === false) {
            return [];
        }
        $chunk = 400000;
        if ($size > $chunk) {
            fseek($h, $size - $chunk);
        }
        $raw = (string) stream_get_contents($h);
        fclose($h);
        $lines = explode("\n", trim($raw));
        if ($size > $chunk) {
            array_shift($lines); // partial first line
        }
        $out = [];
        foreach (array_reverse($lines) as $l) {
            $j = json_decode($l, true);
            if (is_array($j)) {
                $out[] = $j;
            }
            if (count($out) >= $n) {
                break;
            }
        }
        return $out;
    }

    /** Coerce a raw record (from either backend) into canonical types. */
    protected function hydrate(array $r): array
    {
        $notes = $r['notes'] ?? [];
        if (is_string($notes)) {
            $notes = json_decode($notes, true);
        }
        $products = $r['products'] ?? [];
        if (is_string($products)) {
            $products = json_decode($products, true);
        }
        return [
            'id'          => (int) ($r['id'] ?? 0),
            'created_at'  => (int) ($r['created_at'] ?? 0),
            'updated_at'  => (int) ($r['updated_at'] ?? 0),
            'name'        => (string) ($r['name'] ?? ''),
            'company'     => (string) ($r['company'] ?? ''),
            'phone'       => (string) ($r['phone'] ?? ''),
            'email'       => (string) ($r['email'] ?? ''),
            'city'        => (string) ($r['city'] ?? ''),
            'state'       => (string) ($r['state'] ?? ''),
            'gstin'       => (string) ($r['gstin'] ?? ''),
            'buyer_type'  => (string) ($r['buyer_type'] ?? 'other'),
            'product'     => (string) ($r['product'] ?? ''),
            'products'    => is_array($products) ? array_values($products) : [],
            'quantity'    => (int) ($r['quantity'] ?? 0),
            'unit'        => (string) ($r['unit'] ?? 'pcs'),
            'message'     => (string) ($r['message'] ?? ''),
            'source'      => (string) ($r['source'] ?? ''),
            'ip_hash'     => (string) ($r['ip_hash'] ?? ''),
            'mail_ok'     => (int) ($r['mail_ok'] ?? 0),
            'status'      => in_array($r['status'] ?? '', self::STATUSES, true) ? (string) $r['status'] : 'new',
            'notes'       => is_array($notes) ? array_values($notes) : [],
            'assigned_to' => (string) ($r['assigned_to'] ?? ''),
            'seen'        => (int) ($r['seen'] ?? 0),
            'archived'    => (int) ($r['archived'] ?? 0),
        ];
    }

    /** Serialise a canonical record for storage. */
    protected function dehydrate(array $r): array
    {
        $r = $this->hydrate($r);
        $r['notes'] = json_encode($r['notes'], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        $r['products'] = json_encode($r['products'], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        return $r;
    }

    protected function mutablePatch(array $fields): array
    {
        $patch = array_intersect_key($fields, array_flip(self::MUTABLE));
        if (isset($patch['notes']) && is_array($patch['notes'])) {
            $patch['notes'] = json_encode(array_values($patch['notes']), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        }
        return $patch;
    }
}

final class AlokSqliteStore extends AlokStore
{
    private PDO $pdo;
    private const COLS = [
        'created_at', 'updated_at', 'name', 'company', 'phone', 'email', 'city', 'state', 'gstin',
        'buyer_type', 'product', 'products', 'quantity', 'unit', 'message', 'source', 'ip_hash',
        'mail_ok', 'status', 'notes', 'assigned_to', 'seen', 'archived',
    ];

    public function __construct(string $dir)
    {
        $this->pdo = new PDO('sqlite:' . $dir . '/enquiries.sqlite', null, null, [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]);
        $this->pdo->exec('PRAGMA busy_timeout = 5000');
        $this->pdo->exec(
            'CREATE TABLE IF NOT EXISTS enquiries (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL DEFAULT 0,
                name TEXT NOT NULL DEFAULT \'\', company TEXT NOT NULL DEFAULT \'\',
                phone TEXT NOT NULL DEFAULT \'\', email TEXT NOT NULL DEFAULT \'\',
                city TEXT NOT NULL DEFAULT \'\', state TEXT NOT NULL DEFAULT \'\', gstin TEXT NOT NULL DEFAULT \'\',
                buyer_type TEXT NOT NULL DEFAULT \'other\',
                product TEXT NOT NULL DEFAULT \'\', products TEXT NOT NULL DEFAULT \'[]\',
                quantity INTEGER NOT NULL DEFAULT 0, unit TEXT NOT NULL DEFAULT \'pcs\',
                message TEXT NOT NULL DEFAULT \'\', source TEXT NOT NULL DEFAULT \'\', ip_hash TEXT NOT NULL DEFAULT \'\',
                mail_ok INTEGER NOT NULL DEFAULT 0,
                status TEXT NOT NULL DEFAULT \'new\', notes TEXT NOT NULL DEFAULT \'[]\',
                assigned_to TEXT NOT NULL DEFAULT \'\', seen INTEGER NOT NULL DEFAULT 0, archived INTEGER NOT NULL DEFAULT 0
            )'
        );
        $this->pdo->exec('CREATE INDEX IF NOT EXISTS idx_enq_created ON enquiries(created_at)');
        $this->pdo->exec('CREATE INDEX IF NOT EXISTS idx_enq_status ON enquiries(status)');
        @chmod($dir . '/enquiries.sqlite', 0640);
    }

    public function backend(): string
    {
        return 'SQLite';
    }

    public function insert(array $row): int
    {
        $row = $this->dehydrate($row);
        $cols = self::COLS;
        $sql = 'INSERT INTO enquiries (' . implode(',', $cols) . ') VALUES (' . implode(',', array_map(static fn($c) => ':' . $c, $cols)) . ')';
        $st = $this->pdo->prepare($sql);
        foreach ($cols as $c) {
            $st->bindValue(':' . $c, $row[$c]);
        }
        $st->execute();
        return (int) $this->pdo->lastInsertId();
    }

    public function get(int $id): ?array
    {
        $st = $this->pdo->prepare('SELECT * FROM enquiries WHERE id = :id');
        $st->execute([':id' => $id]);
        $r = $st->fetch();
        return $r ? $this->hydrate($r) : null;
    }

    public function all(): array
    {
        $out = [];
        foreach ($this->pdo->query('SELECT * FROM enquiries ORDER BY created_at DESC, id DESC') as $r) {
            $out[] = $this->hydrate($r);
        }
        return $out;
    }

    public function update(int $id, array $fields): bool
    {
        $patch = $this->mutablePatch($fields);
        if (!$patch) {
            return false;
        }
        $sets = [];
        foreach (array_keys($patch) as $c) {
            $sets[] = $c . ' = :' . $c; // $c comes from the MUTABLE whitelist, never from input
        }
        $st = $this->pdo->prepare('UPDATE enquiries SET ' . implode(', ', $sets) . ' WHERE id = :__id');
        foreach ($patch as $c => $v) {
            $st->bindValue(':' . $c, $v);
        }
        $st->bindValue(':__id', $id, PDO::PARAM_INT);
        $st->execute();
        return $st->rowCount() > 0;
    }

    public function delete(int $id): bool
    {
        $st = $this->pdo->prepare('DELETE FROM enquiries WHERE id = :id');
        $st->execute([':id' => $id]);
        return $st->rowCount() > 0;
    }
}

final class AlokJsonlStore extends AlokStore
{
    private string $file;
    private string $lock;

    public function __construct(string $dir)
    {
        $this->file = $dir . '/enquiries.jsonl';
        $this->lock = $dir . '/enquiries.lock';
    }

    public function backend(): string
    {
        return 'JSON lines (SQLite not available)';
    }

    /** @return list<array<string,mixed>> */
    private function readAll(): array
    {
        if (!is_file($this->file)) {
            return [];
        }
        $out = [];
        $h = fopen($this->file, 'rb');
        if ($h === false) {
            return [];
        }
        while (($line = fgets($h)) !== false) {
            $j = json_decode($line, true);
            if (is_array($j) && isset($j['id'])) {
                $out[] = $this->hydrate($j);
            }
        }
        fclose($h);
        return $out;
    }

    /** @param list<array<string,mixed>> $rows */
    private function writeAll(array $rows): void
    {
        $buf = '';
        foreach ($rows as $r) {
            $buf .= json_encode($r, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . "\n";
        }
        AlokFs::atomicWrite($this->file, $buf);
        @chmod($this->file, 0640);
    }

    public function insert(array $row): int
    {
        return (int) AlokFs::withLock($this->lock, function () use ($row): int {
            $rows = $this->readAll();
            $id = 1;
            foreach ($rows as $r) {
                $id = max($id, $r['id'] + 1);
            }
            $row = $this->hydrate($row);
            $row['id'] = $id;
            file_put_contents($this->file, json_encode($row, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . "\n", FILE_APPEND);
            @chmod($this->file, 0640);
            return $id;
        });
    }

    public function get(int $id): ?array
    {
        foreach ($this->readAll() as $r) {
            if ($r['id'] === $id) {
                return $r;
            }
        }
        return null;
    }

    public function all(): array
    {
        $rows = $this->readAll();
        usort($rows, static fn($a, $b) => [$b['created_at'], $b['id']] <=> [$a['created_at'], $a['id']]);
        return $rows;
    }

    public function update(int $id, array $fields): bool
    {
        $patch = array_intersect_key($fields, array_flip(self::MUTABLE));
        if (!$patch) {
            return false;
        }
        return (bool) AlokFs::withLock($this->lock, function () use ($id, $patch): bool {
            $rows = $this->readAll();
            $hit = false;
            foreach ($rows as &$r) {
                if ($r['id'] === $id) {
                    $r = $this->hydrate(array_replace($r, $patch));
                    $hit = true;
                }
            }
            unset($r);
            if ($hit) {
                $this->writeAll($rows);
            }
            return $hit;
        });
    }

    public function delete(int $id): bool
    {
        return (bool) AlokFs::withLock($this->lock, function () use ($id): bool {
            $rows = $this->readAll();
            $keep = array_values(array_filter($rows, static fn($r) => $r['id'] !== $id));
            if (count($keep) === count($rows)) {
                return false;
            }
            $this->writeAll($keep);
            return true;
        });
    }
}

/* ── Product-name parsing (enquiry form sends one summary string) ──────────── */

/**
 * "F-Bush (500 pcs), Float Valve" -> [['name'=>'F-Bush','qty'=>500,'unit'=>'pcs'], ['name'=>'Float Valve', ...]]
 * The long form posts `${product} (${qty} ${unit})` joined by ", "; the short form posts a bare name.
 *
 * @return list<array{name:string,qty:int,unit:string}>
 */
function alok_parse_products(string $s): array
{
    $s = trim($s);
    if ($s === '') {
        return [];
    }
    $out = [];
    $re = '/\s*((?:[^,(]|\((?!\d+\s*(?:pcs|sets)\s*\)))+?)\s*(?:\(\s*(\d+)\s*(pcs|sets)\s*\))?\s*(?:,|$)/u';
    if (preg_match_all($re, $s, $m, PREG_SET_ORDER)) {
        foreach ($m as $x) {
            $name = trim($x[1]);
            if ($name === '' || mb_strtolower($name) === 'not specified') {
                continue;
            }
            $out[] = ['name' => mb_substr($name, 0, 120), 'qty' => (int) ($x[2] ?? 0), 'unit' => (string) ($x[3] ?? 'pcs')];
        }
    }
    return $out;
}
