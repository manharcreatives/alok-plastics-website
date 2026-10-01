<?php
/**
 * Alok Plastics admin — sessions, login, CSRF, throttling.
 */

declare(strict_types=1);

defined('ALOK_ADMIN') || exit;

/** Failed-login counters (per IP hash and per username), stored in the private data folder. */
final class AlokThrottle
{
    private static function file(): string
    {
        return AlokConfig::dataDir() . '/throttle.json';
    }

    /** @return int seconds the key remains locked (0 = not locked) */
    public static function lockedFor(string $key): int
    {
        $d = AlokFs::readJson(self::file()) ?? [];
        $e = $d[$key] ?? null;
        if (is_array($e) && ($e['until'] ?? 0) > time()) {
            return (int) $e['until'] - time();
        }
        return 0;
    }

    public static function fail(string $key): void
    {
        $max = max(3, (int) AlokConfig::get('max_failed_logins', 5));
        $lockSecs = max(1, (int) AlokConfig::get('lockout_minutes', 15)) * 60;
        AlokFs::withLock(self::file() . '.lock', function () use ($key, $max, $lockSecs): void {
            $d = AlokFs::readJson(self::file()) ?? [];
            $now = time();
            foreach ($d as $k => $e) { // prune stale entries
                if (($e['last'] ?? 0) < $now - 86400) {
                    unset($d[$k]);
                }
            }
            $e = $d[$key] ?? ['n' => 0, 'until' => 0, 'last' => 0];
            if (($e['until'] ?? 0) > 0 && $e['until'] <= $now) { // lock expired: start a new window
                $e = ['n' => 0, 'until' => 0, 'last' => 0];
            }
            $e['n'] = (int) $e['n'] + 1;
            $e['last'] = $now;
            if ($e['n'] >= $max) {
                $e['until'] = $now + $lockSecs;
                $e['n'] = 0;
            }
            $d[$key] = $e;
            AlokFs::atomicWrite(self::file(), json_encode($d));
            @chmod(self::file(), 0640);
        });
    }

    public static function clear(string $key): void
    {
        AlokFs::withLock(self::file() . '.lock', function () use ($key): void {
            $d = AlokFs::readJson(self::file()) ?? [];
            if (isset($d[$key])) {
                unset($d[$key]);
                AlokFs::atomicWrite(self::file(), json_encode($d));
            }
        });
    }
}

final class AlokAuth
{
    /** A valid bcrypt hash of a random string: used so unknown usernames cost the same time as known ones. */
    private const DUMMY_HASH = '$2y$12$abcdefghijklmnopqrstuuGZ8mH9uXq3n5oWQe0y0v8m9o1x3o2yK';

    public static function isHttps(): bool
    {
        return (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
            || strtolower((string) ($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '')) === 'https';
    }

    public static function basePath(): string
    {
        $p = rtrim(str_replace('\\', '/', dirname((string) ($_SERVER['SCRIPT_NAME'] ?? '/admin/index.php'))), '/');
        return $p . '/';
    }

    public static function clientIp(): string
    {
        return (string) ($_SERVER['REMOTE_ADDR'] ?? 'unknown');
    }

    public static function start(): void
    {
        if (session_status() === PHP_SESSION_ACTIVE) {
            return;
        }
        $dir = AlokConfig::dataDir() . '/sessions';
        if (!is_dir($dir)) {
            @mkdir($dir, 0700, true);
        }
        ini_set('session.use_strict_mode', '1');
        ini_set('session.use_only_cookies', '1');
        ini_set('session.use_trans_sid', '0');
        ini_set('session.cookie_httponly', '1');
        ini_set('session.gc_probability', '1');
        ini_set('session.gc_divisor', '50');
        ini_set('session.gc_maxlifetime', (string) (((int) AlokConfig::get('session_max_hours', 12)) * 3600));
        if (is_dir($dir) && is_writable($dir)) {
            session_save_path($dir);
        }
        session_cache_limiter('');
        session_name('alok_admin');
        session_set_cookie_params([
            'lifetime' => 0,
            'path'     => self::basePath(),
            'secure'   => self::isHttps(),
            'httponly' => true,
            'samesite' => 'Strict',
        ]);
        session_start();
        if (empty($_SESSION['csrf'])) {
            $_SESSION['csrf'] = bin2hex(random_bytes(32));
        }
    }

    /** @return array{username:string,name:string}|null */
    public static function user(): ?array
    {
        if (empty($_SESSION['uid'])) {
            return null;
        }
        $idle = max(5, (int) AlokConfig::get('session_idle_minutes', 30)) * 60;
        $max = max(1, (int) AlokConfig::get('session_max_hours', 12)) * 3600;
        $now = time();
        if ($now - (int) ($_SESSION['last'] ?? 0) > $idle || $now - (int) ($_SESSION['born'] ?? 0) > $max) {
            self::destroy();
            self::start();
            $_SESSION['flash'] = ['warn', 'You were signed out after a period of inactivity. Please sign in again.'];
            return null;
        }
        $users = (array) AlokConfig::get('users', []);
        $u = (string) $_SESSION['uid'];
        if (!isset($users[$u])) { // user removed from config while signed in
            self::destroy();
            self::start();
            return null;
        }
        $_SESSION['last'] = $now;
        return ['username' => $u, 'name' => (string) ($users[$u]['name'] ?? $u)];
    }

    public static function configured(): bool
    {
        foreach ((array) AlokConfig::get('users', []) as $u) {
            $h = (string) ($u['hash'] ?? '');
            if (str_starts_with($h, '$2y$') || str_starts_with($h, '$argon2')) {
                return true;
            }
        }
        return false;
    }

    /** @return string|null error message, or null on success */
    public static function attempt(string $username, string $password): ?string
    {
        $username = strtolower(trim($username));
        $store = AlokStore::open();
        $ipKey = 'ip:' . $store->ipHash(self::clientIp());
        $userKey = 'user:' . hash('sha256', $username);

        $wait = max(AlokThrottle::lockedFor($ipKey), AlokThrottle::lockedFor($userKey));
        if ($wait > 0) {
            $store->audit($username, 'login_blocked', '', 'locked ' . $wait . 's', self::clientIp());
            return 'Too many failed attempts. Try again in ' . max(1, (int) ceil($wait / 60)) . ' minute(s).';
        }

        $users = array_change_key_case((array) AlokConfig::get('users', []), CASE_LOWER);
        $known = $username !== '' && isset($users[$username]);
        $hash = $known ? (string) ($users[$username]['hash'] ?? '') : '';
        $ok = password_verify($password, $hash !== '' ? $hash : self::DUMMY_HASH) && $known && $hash !== '';

        if (!$ok) {
            AlokThrottle::fail($ipKey);
            AlokThrottle::fail($userKey);
            $store->audit($username, 'login_failed', '', '', self::clientIp());
            usleep(250000);
            return 'Username or password is incorrect.';
        }

        AlokThrottle::clear($userKey);
        session_regenerate_id(true);
        $_SESSION['uid'] = $username;
        $_SESSION['born'] = $_SESSION['last'] = time();
        $_SESSION['csrf'] = bin2hex(random_bytes(32));
        $store->audit($username, 'login', '', '', self::clientIp());
        return null;
    }

    public static function destroy(): void
    {
        if (session_status() === PHP_SESSION_ACTIVE) {
            $_SESSION = [];
            $p = session_get_cookie_params();
            setcookie(session_name(), '', [
                'expires' => time() - 3600, 'path' => $p['path'], 'secure' => $p['secure'],
                'httponly' => true, 'samesite' => 'Strict',
            ]);
            session_destroy();
        }
    }

    /* ── CSRF ─────────────────────────────────────────────────────────────── */

    public static function csrf(): string
    {
        return (string) ($_SESSION['csrf'] ?? '');
    }

    /** True when the POST carries the session token and comes from this host. */
    public static function csrfOk(): bool
    {
        $sent = (string) ($_POST['_csrf'] ?? '');
        if ($sent === '' || !hash_equals(self::csrf(), $sent)) {
            return false;
        }
        $host = strtolower((string) ($_SERVER['HTTP_HOST'] ?? ''));
        foreach (['HTTP_ORIGIN', 'HTTP_REFERER'] as $h) {
            if (!empty($_SERVER[$h])) {
                $p = parse_url((string) $_SERVER[$h]);
                $oh = strtolower((string) ($p['host'] ?? '') . (isset($p['port']) ? ':' . $p['port'] : ''));
                if ($oh !== $host) {
                    return false;
                }
                break;
            }
        }
        return true;
    }
}
