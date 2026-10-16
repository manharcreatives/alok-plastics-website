<?php
/**
 * Alok Plastics admin — public JSON content (open roles, product visibility).
 * Files are written into <webroot>/data/ so the static site can fetch them at runtime.
 * They contain ONLY information that is meant to be public.
 */

declare(strict_types=1);

defined('ALOK_ADMIN') || exit;

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

    private static function txt(array $in, string $k, int $max): string
    {
        $v = strip_tags((string) ($in[$k] ?? ''));
        $v = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', $v) ?? '';
        return mb_substr(trim($v), 0, $max + 1); // +1 so over-length is detectable
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
