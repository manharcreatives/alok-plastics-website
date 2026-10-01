<?php
/**
 * Alok Plastics admin — public JSON content (settings, open roles, product visibility).
 * Files are written into <webroot>/data/ so the static site can fetch them at runtime.
 * They contain ONLY information that is meant to be public.
 */

declare(strict_types=1);

defined('ALOK_ADMIN') || exit;

const ALOK_DAYS = ['mon' => 'Monday', 'tue' => 'Tuesday', 'wed' => 'Wednesday', 'thu' => 'Thursday', 'fri' => 'Friday', 'sat' => 'Saturday', 'sun' => 'Sunday'];

/** Team ids mirror src/content/career.ts. */
const ALOK_TEAMS = [
    'product-development'   => 'Product Development',
    'sales'                 => 'Sales',
    'social-media-marketing' => 'Social Media & Marketing',
    'tech-developers'       => 'Tech Developers',
];

const ALOK_ROLE_TYPES = ['full-time' => 'Full-time', 'part-time' => 'Part-time', 'contract' => 'Contract', 'internship' => 'Internship'];

final class AlokContent
{
    public static function path(string $name): string
    {
        return AlokConfig::publicDataDir() . '/' . $name;
    }

    /** @return array<string,mixed>|null */
    public static function read(string $name): ?array
    {
        return AlokFs::readJson(self::path($name));
    }

    /** Atomic write; the previous version is copied to <data_dir>/history/ (last 15 kept per file). */
    public static function save(string $name, array $data): void
    {
        $dir = AlokConfig::publicDataDir();
        if (!is_dir($dir) && !@mkdir($dir, 0755, true) && !is_dir($dir)) {
            throw new RuntimeException('Public data folder cannot be created: ' . $dir);
        }
        if (!is_writable($dir)) {
            throw new RuntimeException('Public data folder is not writable: ' . $dir);
        }
        $data = array_merge(['schemaVersion' => $data['schemaVersion'] ?? 1, 'updatedAt' => gmdate('Y-m-d\TH:i:s\Z')], $data);
        $json = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR) . "\n";

        $path = self::path($name);
        if (is_file($path)) {
            $hist = AlokConfig::dataDir() . '/history';
            if (!is_dir($hist)) {
                @mkdir($hist, 0750, true);
            }
            @copy($path, $hist . '/' . pathinfo($name, PATHINFO_FILENAME) . '-' . gmdate('Ymd-His') . '.json');
            $old = glob($hist . '/' . pathinfo($name, PATHINFO_FILENAME) . '-*.json') ?: [];
            sort($old);
            foreach (array_slice($old, 0, max(0, count($old) - 15)) as $f) {
                @unlink($f);
            }
        }
        AlokFs::atomicWrite($path, $json);
    }

    /* ── Settings ─────────────────────────────────────────────────────────── */

    /** @return array<string,mixed> */
    public static function settingsDefaults(): array
    {
        $hours = [];
        foreach (array_keys(ALOK_DAYS) as $d) {
            $hours[$d] = ['closed' => false, 'open' => null, 'close' => null];
        }
        return [
            'schemaVersion' => 1,
            'contact' => ['phone' => null, 'whatsapp' => null, 'email' => null, 'mapsUrl' => null, 'gstin' => null],
            'social'  => ['instagram' => null, 'linkedin' => null, 'facebook' => null, 'youtube' => null],
            'replyTime' => null,
            'hours'   => $hours,
            'hoursNote' => null,
            'banner'  => ['enabled' => false, 'text' => '', 'href' => null],
        ];
    }

    /** @return array<string,mixed> saved settings merged over the defaults */
    public static function settings(): array
    {
        $saved = self::read('settings.json') ?? [];
        $d = self::settingsDefaults();
        foreach (['contact', 'social', 'banner'] as $k) {
            $d[$k] = array_replace($d[$k], is_array($saved[$k] ?? null) ? $saved[$k] : []);
        }
        foreach (ALOK_DAYS as $day => $_) {
            $d['hours'][$day] = array_replace($d['hours'][$day], is_array($saved['hours'][$day] ?? null) ? $saved['hours'][$day] : []);
        }
        $d['replyTime'] = $saved['replyTime'] ?? null;
        $d['hoursNote'] = $saved['hoursNote'] ?? null;
        return $d;
    }

    private static function txt(array $in, string $k, int $max): string
    {
        $v = strip_tags((string) ($in[$k] ?? ''));
        $v = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', $v) ?? '';
        return mb_substr(trim($v), 0, $max + 1); // +1 so over-length is detectable
    }

    private static function url(string $v, string $label, array &$err, string $key, bool $allowPath = false): ?string
    {
        if ($v === '') return null;
        if ($allowPath && preg_match('#^/(?!/)[\w\-./?=&%\#]*$#', $v)) return $v;
        $ok = strlen($v) <= 300 && filter_var($v, FILTER_VALIDATE_URL) !== false && str_starts_with(strtolower($v), 'https://');
        if (!$ok) {
            $err[$key] = $label . ' must be a full link starting with https://' . ($allowPath ? ' (or a page path like /contact/).' : '.');
            return null;
        }
        return $v;
    }

    /**
     * Validate the posted settings form.
     * @return array{0:array<string,mixed>,1:array<string,string>} [clean data, errors keyed by field name]
     */
    public static function validateSettings(array $in): array
    {
        $err = [];
        $out = self::settingsDefaults();

        $phone = self::txt($in, 'phone', 30);
        if ($phone !== '') {
            $digits = strlen(preg_replace('/\D/', '', $phone) ?? '');
            if (!preg_match('/^[0-9+\-\s()]+$/', $phone) || $digits < 7 || $digits > 15) {
                $err['phone'] = 'Enter a valid phone number (7–15 digits; + - ( ) and spaces allowed).';
            } else {
                $out['contact']['phone'] = $phone;
            }
        }

        $wa = preg_replace('/\D/', '', self::txt($in, 'whatsapp', 30)) ?? '';
        if ($wa !== '') {
            if (strlen($wa) < 11 || strlen($wa) > 15) {
                $err['whatsapp'] = 'Enter the WhatsApp number with country code, digits only (for India: 91 followed by the 10-digit number).';
            } else {
                $out['contact']['whatsapp'] = $wa;
            }
        }

        $email = self::txt($in, 'email', 120);
        if ($email !== '') {
            if (filter_var($email, FILTER_VALIDATE_EMAIL) === false || mb_strlen($email) > 120) {
                $err['email'] = 'Enter a valid email address.';
            } else {
                $out['contact']['email'] = $email;
            }
        }

        $out['contact']['mapsUrl'] = self::url(self::txt($in, 'mapsUrl', 300), 'Google Maps link', $err, 'mapsUrl');

        $gstin = strtoupper(self::txt($in, 'gstin', 15));
        if ($gstin !== '') {
            if (!preg_match('/^\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/', $gstin)) {
                $err['gstin'] = 'Enter a valid 15-character GSTIN.';
            } else {
                $out['contact']['gstin'] = $gstin;
            }
        }

        foreach (['instagram' => 'Instagram', 'linkedin' => 'LinkedIn', 'facebook' => 'Facebook', 'youtube' => 'YouTube'] as $k => $label) {
            $out['social'][$k] = self::url(self::txt($in, $k, 300), $label . ' link', $err, $k);
        }

        $rt = self::txt($in, 'replyTime', 60);
        if (mb_strlen($rt) > 60) {
            $err['replyTime'] = 'Keep it under 60 characters.';
        } elseif ($rt !== '') {
            $out['replyTime'] = $rt;
        }

        foreach (ALOK_DAYS as $d => $_) {
            $closed = !empty($in['closed_' . $d]);
            $open = self::txt($in, 'open_' . $d, 5);
            $close = self::txt($in, 'close_' . $d, 5);
            $okT = static fn(string $t): bool => (bool) preg_match('/^([01]\d|2[0-3]):[0-5]\d$/', $t);
            if ($closed) {
                $out['hours'][$d] = ['closed' => true, 'open' => null, 'close' => null];
            } elseif ($open === '' && $close === '') {
                $out['hours'][$d] = ['closed' => false, 'open' => null, 'close' => null];
            } elseif (!$okT($open) || !$okT($close) || $open >= $close) {
                $err['hours_' . $d] = ALOK_DAYS[$d] . ': enter both times (opening before closing), or tick Closed, or leave both empty.';
            } else {
                $out['hours'][$d] = ['closed' => false, 'open' => $open, 'close' => $close];
            }
        }
        $hn = self::txt($in, 'hoursNote', 120);
        if (mb_strlen($hn) > 120) {
            $err['hoursNote'] = 'Keep it under 120 characters.';
        } elseif ($hn !== '') {
            $out['hoursNote'] = $hn;
        }

        $enabled = !empty($in['banner_enabled']);
        $text = self::txt($in, 'banner_text', 140);
        $href = self::txt($in, 'banner_href', 300);
        if (mb_strlen($text) > 140) {
            $err['banner_text'] = 'Keep the banner under 140 characters.';
        }
        if ($enabled && $text === '') {
            $err['banner_text'] = 'Write the banner text, or switch the banner off.';
        }
        $out['banner'] = [
            'enabled' => $enabled && !isset($err['banner_text']),
            'text'    => mb_substr($text, 0, 140),
            'href'    => self::url($href, 'Banner link', $err, 'banner_href', true),
        ];
        return [$out, $err];
    }

    /* ── Open roles ───────────────────────────────────────────────────────── */

    /** @return list<array<string,mixed>> */
    public static function roles(): array
    {
        $j = self::read('careers.json');
        return array_values(is_array($j['roles'] ?? null) ? $j['roles'] : []);
    }

    /** @param list<array<string,mixed>> $roles */
    public static function saveRoles(array $roles): void
    {
        self::save('careers.json', ['schemaVersion' => 1, 'roles' => array_values($roles)]);
    }

    /** @return array{0:array<string,mixed>,1:array<string,string>} */
    public static function validateRole(array $in): array
    {
        $err = [];
        $title = self::txt($in, 'title', 80);
        $team = (string) ($in['team'] ?? '');
        $type = (string) ($in['type'] ?? '');
        $loc = self::txt($in, 'location', 80);
        $desc = self::txt($in, 'description', 2000);
        if (mb_strlen($title) < 3 || mb_strlen($title) > 80) $err['title'] = 'Role title is required (3–80 characters).';
        if (!isset(ALOK_TEAMS[$team])) $err['team'] = 'Choose a team.';
        if (!isset(ALOK_ROLE_TYPES[$type])) $err['type'] = 'Choose an employment type.';
        if ($loc === '' || mb_strlen($loc) > 80) $err['location'] = 'Location is required (up to 80 characters).';
        if (mb_strlen($desc) > 2000) $err['description'] = 'Keep the description under 2000 characters.';
        return [[
            'title' => $title, 'team' => $team, 'type' => $type, 'location' => $loc,
            'description' => mb_substr($desc, 0, 2000), 'active' => !empty($in['active']),
        ], $err];
    }

    /* ── Product visibility ───────────────────────────────────────────────── */

    /** @return list<string> */
    public static function hiddenProducts(): array
    {
        $j = self::read('product-overrides.json');
        $h = is_array($j['hidden'] ?? null) ? $j['hidden'] : [];
        return array_values(array_filter($h, static fn($s) => is_string($s) && preg_match('/^[a-z0-9]+(-[a-z0-9]+)*$/', $s)));
    }

    /** @param list<string> $slugs */
    public static function saveHidden(array $slugs): void
    {
        $slugs = array_values(array_unique($slugs));
        sort($slugs);
        self::save('product-overrides.json', ['schemaVersion' => 1, 'hidden' => $slugs]);
    }
}
