<?php
/**
 * Alok Plastics admin — product manager.
 *
 * Reads the build-time catalogue (lib/catalogue.php, generated) and stores the owner's edits in
 * <public data>/products.json (public; read by the website). Uploaded images are re-encoded with GD and
 * kept OUTSIDE the web root in <data_dir>/uploads/<yyyy-mm>/, served by api/media.php.
 * Every written key comes from the fixed whitelists below (never from $_POST names).
 */

declare(strict_types=1);

defined('ALOK_ADMIN') || exit;

final class AlokProducts
{
    /** Text fields the owner may override: key => [label, max length, multiline]. */
    public const FIELDS = [
        'name'           => ['Product name', 120, false],
        'summary'        => ['Short summary', 300, true],
        'description'    => ['Long description', 3000, true],
        'material'       => ['Material', 120, false],
        'sku'            => ['SKU / drawing number', 120, false],
        'hsn'            => ['HSN code', 120, false],
        'moq'            => ['Minimum order quantity', 120, false],
        'packing'        => ['Packing', 120, false],
        'fitment'        => ['Fitment (machines or models it fits)', 300, false],
        'seoTitle'       => ['SEO title', 70, false],
        'seoDescription' => ['SEO meta description', 170, true],
    ];
    /** Commerce fields (all optional). */
    public const COMMERCE = ['price', 'availability', 'stock', 'keywords', 'brand', 'featured', 'status'];
    public const AVAILABILITY = ['on-request' => 'On request', 'in-stock' => 'In stock', 'out-of-stock' => 'Out of stock'];
    public const STATUS = ['active' => 'Active', 'inactive' => 'Inactive', 'archived' => 'Archived'];
    public const MACHINES = ['water-cooler' => 'Water cooler', 'display-counter' => 'Display counter', 'deep-freezer' => 'Deep freezer', 'gas-stove' => 'Gas stove', 'commercial-kitchen' => 'Commercial kitchen'];
    public const PRICE_MAX = 9999999;
    public const STOCK_MAX = 100000;
    public const KEYWORDS_MAX = 20;
    public const KEYWORD_LEN = 40;
    public const BRAND_MAX = 60;
    public const ALT_MAX = 140;
    public const MAX_IMAGES = 8;
    public const MAX_UPLOAD = 8 * 1024 * 1024;
    public const MAX_SIDE = 2400;
    public const MAX_PIXELS = 40000000;
    /** Fixed content-type allowlist keyed by stored extension. */
    public const TYPES = ['jpg' => 'image/jpeg', 'webp' => 'image/webp', 'png' => 'image/png'];

    private static ?array $cat = null;
    private static ?array $groups = null;

    /** @return array<string,array{id:string,name:string,slug:string}> id => group (the website's product groups, generated at build) */
    public static function groups(): array
    {
        if (self::$groups === null) {
            self::$groups = [];
            $f = __DIR__ . '/groups.php';
            foreach (is_file($f) ? (array) require $f : [] as $g) {
                if (is_array($g) && isset($g['id'], $g['name'], $g['slug'])) {
                    self::$groups[(string) $g['id']] = ['id' => (string) $g['id'], 'name' => (string) $g['name'], 'slug' => (string) $g['slug']];
                }
            }
            if (!self::$groups) {
                foreach (self::catalogue() as $c) {
                    if (is_array($c['group'])) self::$groups[(string) $c['group']['id']] = $c['group'];
                }
                ksort(self::$groups);
            }
        }
        return self::$groups;
    }

    public static function rowDefaults(): array
    {
        return ['group' => null, 'path' => null, 'material' => '', 'sku' => '', 'hsn' => '', 'moq' => '', 'packing' => '',
            'summary' => '', 'machines' => [], 'variants' => [], 'image' => null,
            'price' => null, 'availability' => 'on-request', 'stock' => null, 'keywords' => [], 'brand' => '', 'featured' => false, 'status' => 'active', 'custom' => false];
    }

    /** Built-in catalogue plus products the owner created in the panel (slug => row). */
    public static function catalogueAll(): array
    {
        $cat = self::catalogue();
        $groups = self::groups();
        foreach (self::all() as $slug => $s) {
            if (empty($s['custom']) || isset($cat[$slug])) continue;
            $cat[$slug] = ['slug' => $slug, 'name' => (string) ($s['name'] ?? $slug), 'published' => true, 'custom' => true,
                'group' => $groups[(string) ($s['group'] ?? '')] ?? null, 'path' => '/products/item/?s=' . $slug] + self::rowDefaults();
        }
        return $cat;
    }

    /** Machine ids a row fits, saved value over build-time default. @return list<string> */
    public static function machineIds(array $c, array $saved): array
    {
        if (isset($saved['machines']) && is_array($saved['machines'])) {
            return array_values(array_intersect(array_keys(self::MACHINES), array_map('strval', $saved['machines'])));
        }
        return array_values(array_keys(array_intersect(self::MACHINES, (array) ($c['machines'] ?? []))));
    }

    /** The row with the owner's group and machine choices applied. */
    public static function placed(array $c, array $saved): array
    {
        $g = self::groups()[(string) ($saved['group'] ?? '')] ?? null;
        if ($g !== null) {
            $c['group'] = $g;
            if (empty($c['custom'])) $c['path'] = '/products/' . $g['slug'] . '/' . $c['slug'] . '/';
        }
        $c['machines'] = array_values(array_map(static fn(string $id): string => self::MACHINES[$id], self::machineIds($c, $saved)));
        return $c;
    }

    public static function slugify(string $name): string
    {
        $t = function_exists('iconv') ? (string) @iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $name) : $name;
        $t = trim(preg_replace('/[^a-z0-9]+/', '-', strtolower($t)) ?? '', '-');
        return $t === '' ? 'product' : substr($t, 0, 60);
    }

    /** @return array<string,array<string,mixed>> slug => row (name, published, + details) */
    public static function catalogue(): array
    {
        if (self::$cat === null) {
            self::$cat = [];
            foreach ((array) require dirname(__DIR__) . '/lib/catalogue.php' as $row) {
                $d = is_array($row[3] ?? null) ? $row[3] : [];
                self::$cat[(string) $row[0]] = ['slug' => (string) $row[0], 'name' => (string) $row[1], 'published' => (bool) $row[2]] + $d + self::rowDefaults();
            }
        }
        return self::$cat;
    }

    public static function gdOk(): bool
    {
        return extension_loaded('gd') && function_exists('imagecreatefromstring') && function_exists('imagejpeg');
    }

    /** @return array<string,array<string,mixed>> slug => saved edits */
    public static function all(): array
    {
        $j = AlokContent::read('products.json');
        $p = is_array($j['products'] ?? null) ? $j['products'] : [];
        $cat = self::catalogue();
        $out = [];
        foreach ($p as $slug => $v) {
            if (is_string($slug) && is_array($v) && (isset($cat[$slug]) || (!empty($v['custom']) && preg_match('/^[a-z0-9]+(-[a-z0-9]+)*$/', $slug) === 1))) {
                $out[$slug] = $v;
            }
        }
        return $out;
    }

    /** @param array<string,array<string,mixed>> $products */
    public static function saveAll(array $products): void
    {
        ksort($products);
        AlokContent::save('products.json', ['schemaVersion' => 1, 'products' => (object) $products]);
    }

    public static function isEdited(array $saved): bool
    {
        foreach (array_keys(self::FIELDS) as $k) {
            if (($saved[$k] ?? '') !== '') return true;
        }
        foreach (self::COMMERCE as $k) {
            if (array_key_exists($k, $saved)) return true;
        }
        foreach (['group', 'machines', 'custom'] as $k) {
            if (array_key_exists($k, $saved)) return true;
        }
        return !empty($saved['images']);
    }

    /** Build-time commerce values of a catalogue row (the build has no price or stock unless the developer added one). */
    public static function commerceDefaults(array $c): array
    {
        return ['price' => $c['price'] ?? null, 'availability' => $c['availability'] ?? 'on-request', 'stock' => $c['stock'] ?? null,
            'keywords' => array_values((array) ($c['keywords'] ?? [])), 'brand' => (string) ($c['brand'] ?? ''),
            'featured' => !empty($c['featured']), 'status' => $c['status'] ?? 'active'];
    }

    /** What the website uses: saved value over build-time default. */
    public static function effective(array $c, array $saved): array
    {
        $d = self::commerceDefaults($c);
        foreach (self::COMMERCE as $k) {
            if (array_key_exists($k, $saved)) $d[$k] = $saved[$k];
        }
        return $d;
    }

    /** @return array{0:int|float|null,1:?string} */
    public static function parsePrice(string $raw): array
    {
        $v = trim(str_replace([',', ' ', "\u{20B9}"], '', $raw));
        if ($v === '') return [null, null];
        if (!preg_match('/^\d{1,7}(\.\d{1,2})?$/', $v) || (float) $v > self::PRICE_MAX) {
            return [null, 'Price must be a number from 0 to ' . number_format(self::PRICE_MAX) . ' (rupees, up to 2 decimals).'];
        }
        $f = round((float) $v, 2);
        return [floor($f) == $f ? (int) $f : $f, null];
    }

    /** @return array{0:?int,1:?string} */
    public static function parseStock(string $raw): array
    {
        $v = trim($raw);
        if ($v === '') return [null, null];
        if (!preg_match('/^\d{1,6}$/', $v) || (int) $v > self::STOCK_MAX) {
            return [null, 'Stock must be a whole number from 0 to ' . number_format(self::STOCK_MAX) . '.'];
        }
        return [(int) $v, null];
    }

    /** @return array{0:list<string>,1:?string} */
    public static function parseKeywords(string $raw): array
    {
        $out = [];
        foreach (preg_split('/[,;\n\r]+/u', $raw) ?: [] as $kw) {
            $kw = preg_replace('/[\x00-\x1F\x7F]/u', ' ', $kw) ?? '';
            $kw = mb_strtolower(trim(preg_replace('/\s+/u', ' ', $kw) ?? ''));
            if ($kw === '') continue;
            if (mb_strlen($kw) > self::KEYWORD_LEN) return [[], 'Each keyword can be at most ' . self::KEYWORD_LEN . ' characters ("' . mb_substr($kw, 0, 20) . '…" is ' . mb_strlen($kw) . ').'];
            $out[$kw] = true;
        }
        $out = array_map('strval', array_keys($out));
        if (count($out) > self::KEYWORDS_MAX) return [[], 'Use at most ' . self::KEYWORDS_MAX . ' keywords (now ' . count($out) . ').'];
        return [$out, null];
    }

    /**
     * Validate commerce fields from a raw POST (only known keys are read). Empty price/stock = null.
     * @param list<string> $only restrict to these keys (bulk edit)
     * @return array{0:array<string,mixed>,1:array<string,string>} [values, per-field errors]
     */
    public static function validateCommerce(array $in, array $only = []): array
    {
        $use = static fn(string $k): bool => !$only || in_array($k, $only, true);
        $str = static fn(string $k): string => is_string($in[$k] ?? null) ? $in[$k] : '';
        $v = [];
        $err = [];
        if ($use('price')) {
            [$v['price'], $m] = self::parsePrice($str('price'));
            if ($m) $err['price'] = $m;
        }
        if ($use('stock')) {
            [$v['stock'], $m] = self::parseStock($str('stock'));
            if ($m) $err['stock'] = $m;
        }
        if ($use('availability')) {
            $a = $str('availability');
            if (isset(self::AVAILABILITY[$a])) { $v['availability'] = $a; } else { $err['availability'] = 'Choose In stock, Out of stock or On request.'; }
        }
        if ($use('status')) {
            $a = $str('status');
            if (isset(self::STATUS[$a])) { $v['status'] = $a; } else { $err['status'] = 'Choose Active, Inactive or Archived.'; }
        }
        if ($use('keywords')) {
            [$v['keywords'], $m] = self::parseKeywords($str('keywords'));
            if ($m) $err['keywords'] = $m;
        }
        if ($use('brand')) {
            $b = preg_replace('/[\x00-\x1F\x7F]/u', ' ', $str('brand')) ?? '';
            $b = trim(preg_replace('/\s+/u', ' ', $b) ?? '');
            if (mb_strlen($b) > self::BRAND_MAX) $err['brand'] = 'Brand can be at most ' . self::BRAND_MAX . ' characters (now ' . mb_strlen($b) . ').';
            $v['brand'] = $b;
        }
        if ($use('featured')) $v['featured'] = !empty($in['featured']);
        return [$v, $err];
    }

    /** Merge validated values into an entry; a key is stored only when it differs from the build-time default. */
    public static function storeCommerce(array $entry, array $values, array $default): array
    {
        foreach (self::COMMERCE as $k) {
            if (!array_key_exists($k, $values)) continue;
            $val = $values[$k];
            if ($k === 'price' || $k === 'stock') {
                $same = $val === null || ($default[$k] !== null && (float) $val === (float) $default[$k]);
            } else {
                $same = $val == $default[$k];
            }
            if ($same) { unset($entry[$k]); } else { $entry[$k] = $val; }
        }
        return $entry;
    }

    public static function formatPrice(int|float $p): string
    {
        $i = (string) (int) floor($p);
        if (strlen($i) > 3) $i = preg_replace('/\B(?=(\d{2})+(?!\d))/', ',', substr($i, 0, -3)) . ',' . substr($i, -3);
        $dec = floor($p) == $p ? '' : '.' . substr(sprintf('%.2f', $p), -2);
        return "\u{20B9}" . $i . $dec;
    }

    /* ── Validation ───────────────────────────────────────────────────────── */

    /**
     * @param array<string,mixed> $in raw POST
     * @return array{0:array<string,string>,1:array<string,string>} [clean text fields (non-empty only), errors]
     */
    public static function validateText(array $in, array $default): array
    {
        $clean = [];
        $err = [];
        foreach (self::FIELDS as $k => [$label, $max, $multi]) {
            $v = is_string($in[$k] ?? null) ? $in[$k] : '';
            $v = str_replace(["\r\n", "\r"], "\n", $v);
            $v = preg_replace($multi ? '/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u' : '/[\x00-\x1F\x7F]/u', '', $v) ?? '';
            $v = trim($v);
            if (!$multi) {
                $v = preg_replace('/\s+/u', ' ', $v) ?? $v;
            }
            if (mb_strlen($v) > $max) {
                $err[$k] = $label . ' can be at most ' . $max . ' characters (now ' . mb_strlen($v) . ').';
            }
            $def = (string) ($default[$k] ?? '');
            if ($v !== '' && $v !== $def) {
                $clean[$k] = $v;
            }
        }
        return [$clean, $err];
    }

    public static function cleanAlt(mixed $v): string
    {
        $v = is_string($v) ? preg_replace('/\s+/u', ' ', preg_replace('/[\x00-\x1F\x7F]/u', ' ', $v) ?? '') : '';
        return trim((string) $v);
    }

    /* ── Image storage ────────────────────────────────────────────────────── */

    public static function uploadsDir(): string
    {
        return AlokConfig::dataDir() . '/uploads';
    }

    public static function validId(string $id): bool
    {
        return (bool) preg_match('/^[a-f0-9]{16}$/', $id);
    }

    /** Absolute path of a stored image, or null. */
    public static function fileFor(string $id): ?string
    {
        if (!self::validId($id)) return null;
        $hits = glob(self::uploadsDir() . '/*/*-' . $id . '.{jpg,webp,png}', GLOB_BRACE) ?: [];
        return $hits[0] ?? null;
    }

    public static function deleteFile(string $id): void
    {
        $f = self::fileFor($id);
        if ($f !== null) {
            @unlink($f);
        }
    }

    /**
     * Normalise $_FILES['new_images'] into a list of single-file arrays.
     * @return list<array{name:string,tmp_name:string,error:int,size:int}>
     */
    public static function incomingFiles(): array
    {
        $f = $_FILES['new_images'] ?? null;
        if (!is_array($f) || !is_array($f['name'] ?? null)) return [];
        $out = [];
        foreach ($f['name'] as $i => $n) {
            $out[] = ['name' => (string) $n, 'tmp_name' => (string) ($f['tmp_name'][$i] ?? ''), 'error' => (int) ($f['error'][$i] ?? UPLOAD_ERR_NO_FILE), 'size' => (int) ($f['size'][$i] ?? 0)];
        }
        return $out;
    }

    /**
     * Validate + re-encode one upload and store it. Returns [id, null] or [null, message].
     * When GD is available the image is resized, rotated per EXIF, and re-encoded (metadata stripped).
     * When GD is unavailable the file is validated by MIME type and stored as-is (fallback path).
     * @param array{name:string,tmp_name:string,error:int,size:int} $file
     * @return array{0:?string,1:?string}
     */
    public static function storeUpload(array $file, string $slug): array
    {
        $label = $file['name'] !== '' ? mb_substr(preg_replace('/[^\p{L}\p{N}._ -]/u', '', $file['name']) ?? '', 0, 40) : 'image';
        switch ($file['error']) {
            case UPLOAD_ERR_OK: break;
            case UPLOAD_ERR_INI_SIZE:
            case UPLOAD_ERR_FORM_SIZE: return [null, $label . ': the file is too large (8 MB maximum).'];
            default: return [null, $label . ': the upload did not complete. Please try again.'];
        }
        if (!is_uploaded_file($file['tmp_name'])) return [null, $label . ': not a valid upload.'];
        if ($file['size'] > self::MAX_UPLOAD || filesize($file['tmp_name']) > self::MAX_UPLOAD) return [null, $label . ': the file is larger than 8 MB.'];

        // getimagesize() works without the GD extension — use it for format + dimension validation.
        $info = @getimagesize($file['tmp_name']);
        $map = [IMAGETYPE_JPEG => 'jpg', IMAGETYPE_PNG => 'png', IMAGETYPE_WEBP => 'webp'];
        if ($info === false || !isset($map[$info[2]])) return [null, $label . ': only JPEG, PNG or WebP images are accepted.'];
        [$w, $h] = [(int) $info[0], (int) $info[1]];
        if ($w < 1 || $h < 1 || $w * $h > self::MAX_PIXELS) return [null, $label . ': the image dimensions are not supported.'];
        $ext = $map[$info[2]];

        $id = bin2hex(random_bytes(8));
        $dir = self::uploadsDir() . '/' . gmdate('Y-m');
        if (!is_dir($dir) && !@mkdir($dir, 0750, true) && !is_dir($dir)) return [null, 'The uploads folder cannot be created.'];
        foreach ([self::uploadsDir() . '/.htaccess' => "Require all denied\n<IfModule !mod_authz_core.c>\nOrder deny,allow\nDeny from all\n</IfModule>\n", self::uploadsDir() . '/index.html' => ''] as $p => $c) {
            if (!is_file($p)) @file_put_contents($p, $c);
        }
        $path = $dir . '/' . $slug . '-' . $id . '.' . $ext;

        if (self::gdOk()) {
            // GD path: resize to max 2400 px, fix EXIF rotation, strip metadata, re-encode.
            if ($ext === 'webp' && !function_exists('imagewebp')) $ext = 'jpg';
            $raw = @file_get_contents($file['tmp_name']);
            $src = $raw !== false ? @imagecreatefromstring($raw) : false;
            unset($raw);
            if ($src === false) return [null, $label . ': the file could not be read as an image.'];

            if ($info[2] === IMAGETYPE_JPEG && function_exists('exif_read_data')) {
                $ex = @exif_read_data($file['tmp_name']);
                $rot = [3 => 180, 6 => -90, 8 => 90][(int) ($ex['Orientation'] ?? 1)] ?? 0;
                if ($rot !== 0 && ($r = @imagerotate($src, $rot, 0)) !== false) {
                    $src = $r;
                    [$w, $h] = [imagesx($src), imagesy($src)];
                }
            }
            $scale = min(1.0, self::MAX_SIDE / max($w, $h));
            if ($scale < 1.0) {
                $nw = max(1, (int) round($w * $scale));
                $nh = max(1, (int) round($h * $scale));
                $dst = imagecreatetruecolor($nw, $nh);
                if ($ext !== 'jpg') {
                    imagealphablending($dst, false);
                    imagesavealpha($dst, true);
                    imagefill($dst, 0, 0, imagecolorallocatealpha($dst, 0, 0, 0, 127));
                }
                imagecopyresampled($dst, $src, 0, 0, 0, 0, $nw, $nh, $w, $h);
                $src = $dst;
            }
            if ($ext === 'jpg') {
                $flat = imagecreatetruecolor(imagesx($src), imagesy($src));
                imagefill($flat, 0, 0, imagecolorallocate($flat, 255, 255, 255));
                imagecopy($flat, $src, 0, 0, 0, 0, imagesx($src), imagesy($src));
                $src = $flat;
            } else {
                imagealphablending($src, false);
                imagesavealpha($src, true);
            }
            $ok = match ($ext) {
                'png'   => imagepng($src, $path, 6),
                'webp'  => imagewebp($src, $path, 85),
                default => imagejpeg($src, $path, 85),
            };
            if (!$ok || !is_file($path)) return [null, $label . ': the image could not be saved.'];
        } else {
            // Fallback path (no GD): validate MIME via finfo and store the raw file as-is.
            if (function_exists('finfo_open')) {
                $fi = @finfo_open(FILEINFO_MIME_TYPE);
                if ($fi !== false) {
                    $mime = @finfo_file($fi, $file['tmp_name']);
                    @finfo_close($fi);
                    if (!$mime || !in_array($mime, self::TYPES, true)) {
                        return [null, $label . ': only JPEG, PNG or WebP images are accepted.'];
                    }
                }
            }
            if (!@copy($file['tmp_name'], $path)) return [null, $label . ': the image could not be saved.'];
        }
        @chmod($path, 0640);
        return [$id, null];
    }
}

/* ══ Screens ═════════════════════════════════════════════════════════════════ */

function product_default_for_form(array $c): array
{
    return ['name' => !empty($c['custom']) ? '' : $c['name'], 'summary' => $c['summary'], 'description' => '', 'fitment' => '', 'material' => $c['material'], 'sku' => $c['sku'],
        'hsn' => $c['hsn'], 'moq' => $c['moq'], 'packing' => $c['packing'], 'seoTitle' => '', 'seoDescription' => ''];
}

/** Whitelisted list-screen filter parameters (GET or POST) => normalised values. */
function products_filters(array $src): array
{
    $pick = static fn(string $k, array $allowed): string => in_array((string) ($src[$k] ?? ''), $allowed, true) ? (string) $src[$k] : '';
    return [
        'q'      => mb_substr(trim((string) ($src['q'] ?? '')), 0, 60),
        'group'  => preg_replace('/[^a-z0-9-]/', '', strtolower((string) ($src['group'] ?? ''))) ?? '',
        'status' => $pick('status', array_keys(AlokProducts::STATUS)),
        'avail'  => $pick('avail', array_keys(AlokProducts::AVAILABILITY)),
        'vis'    => $pick('vis', ['hidden', 'shown']),
        'edited' => $pick('edited', ['yes', 'no']),
        'attn'   => $pick('attn', ['any', 'img', 'price', 'desc']),
        'sort'   => $pick('sort', ['recent', 'price-asc', 'price-desc']),
    ];
}

function page_products(array $user, bool $isPost): never
{
    $cat = AlokProducts::catalogueAll();
    $hidden = AlokContent::hiddenProducts();
    $f = products_filters($isPost ? $_POST : $_GET);
    $keep = array_filter($f, static fn($v) => $v !== '');
    $bulkIn = [];
    $bulkErr = [];

    if ($isPost) {
        $do = isset($_POST['toggle']) ? 'toggle' : (string) ($_POST['do'] ?? '');
        if ($do === 'toggle') { // hide / show (unchanged: writes product-overrides.json)
            $slug = (string) ($_POST['toggle'] ?? '');
            if (!isset($cat[$slug]) || !$cat[$slug]['published']) {
                flash_set('err', 'Unknown product.');
                redirect(u('products', $keep));
            }
            $isHidden = in_array($slug, $hidden, true);
            $new = $isHidden ? array_values(array_diff($hidden, [$slug])) : array_merge($hidden, [$slug]);
            AlokContent::saveHidden($new);
            AlokStore::open()->audit($user['username'], 'product_visibility', 'product-overrides.json', ($isHidden ? 'showed ' : 'hid ') . $slug, AlokAuth::clientIp());
            flash_set('ok', '"' . $cat[$slug]['name'] . '" is now ' . ($isHidden ? 'shown in' : 'hidden from') . ' the website lists.');
            redirect(u('products', $keep));
        }
        if ($do !== 'bulk') {
            flash_set('err', 'Unknown action.');
            redirect(u('products', $keep));
        }

        // Bulk quick-edit: price, availability, status. Slugs come only from the catalogue whitelist.
        $all = AlokProducts::all();
        $inPrice = (array) ($_POST['pr'] ?? []);
        $inAvail = (array) ($_POST['av'] ?? []);
        $inStatus = (array) ($_POST['st'] ?? []);
        $changes = [];
        $next = $all;
        foreach ($cat as $slug => $c) {
            if (!array_key_exists($slug, $inPrice) && !array_key_exists($slug, $inAvail) && !array_key_exists($slug, $inStatus)) continue;
            $row = ['price' => is_string($inPrice[$slug] ?? null) ? $inPrice[$slug] : '',
                'availability' => is_string($inAvail[$slug] ?? null) ? $inAvail[$slug] : '',
                'status' => is_string($inStatus[$slug] ?? null) ? $inStatus[$slug] : ''];
            $bulkIn[$slug] = $row;
            [$vals, $errs] = AlokProducts::validateCommerce($row, ['price', 'availability', 'status']);
            if ($errs) { $bulkErr[$slug] = $errs; continue; }
            $before = $all[$slug] ?? [];
            $entry = AlokProducts::storeCommerce($before, $vals, AlokProducts::commerceDefaults($c));
            $ch = [];
            foreach (['price', 'availability', 'status'] as $k) {
                if (($before[$k] ?? null) !== ($entry[$k] ?? null)) $ch[] = $k;
            }
            if ($ch) {
                unset($entry['updatedAt']);
                if ($entry) { $entry['updatedAt'] = gmdate('Y-m-d\TH:i:s\Z'); $next[$slug] = $entry; } else { unset($next[$slug]); }
                $changes[] = $slug . ' (' . implode('/', $ch) . ')';
            }
        }
        if (!$bulkErr) {
            if (!$changes) {
                flash_set('ok', 'Nothing changed.');
                redirect(u('products', $keep));
            }
            try {
                AlokProducts::saveAll($next);
                AlokStore::open()->audit($user['username'], 'product_bulk_edit', 'products.json', mb_substr(count($changes) . ' products: ' . implode(', ', $changes), 0, 400), AlokAuth::clientIp());
                flash_set('ok', 'Updated ' . count($changes) . ' product(s). The website picks it up on the next page load.');
                redirect(u('products', $keep));
            } catch (RuntimeException $ex) {
                flash_set('err', 'Could not save: ' . $ex->getMessage());
                redirect(u('products', $keep));
            }
        }
        // else: fall through and re-render with the owner's input and per-row errors.
    }

    $groups = [];
    foreach (AlokProducts::groups() as $g) {
        $groups[$g['slug']] = $g['name'];
    }
    $saved = AlokProducts::all();
    $rows = [];
    $attnCount = ['img' => 0, 'price' => 0, 'desc' => 0, 'any' => 0];
    foreach ($cat as $slug => $c) {
        $s = $saved[$slug] ?? [];
        $c = AlokProducts::placed($c, $s);
        $name = (string) ($s['name'] ?? $c['name']);
        $eff = AlokProducts::effective($c, $s);
        $isHidden = in_array($slug, $hidden, true);
        $noImg = empty($s['images']) && empty($c['image']);
        $noPrice = $eff['price'] === null;
        $noDesc = trim((string) ($s['description'] ?? '')) === '';
        // Counts ignore the attention filter itself so the chips show what each would find.
        $match = static function (bool $ignoreAttn) use ($f, $c, $slug, $s, $name, $eff, $isHidden, $noImg, $noPrice, $noDesc): bool {
            if ($f['group'] !== '' && ($c['group']['slug'] ?? '-') !== $f['group']) return false;
            if ($f['status'] !== '' && $eff['status'] !== $f['status']) return false;
            if ($f['avail'] !== '' && $eff['availability'] !== $f['avail']) return false;
            if ($f['vis'] === 'hidden' && !$isHidden) return false;
            if ($f['vis'] === 'shown' && $isHidden) return false;
            $ed = AlokProducts::isEdited($s);
            if ($f['edited'] === 'yes' && !$ed) return false;
            if ($f['edited'] === 'no' && $ed) return false;
            if (!$ignoreAttn) {
                if ($f['attn'] === 'img' && !$noImg) return false;
                if ($f['attn'] === 'price' && !$noPrice) return false;
                if ($f['attn'] === 'desc' && !$noDesc) return false;
                if ($f['attn'] === 'any' && !($noImg || $noPrice || $noDesc)) return false;
            }
            if ($f['q'] !== '') {
                $hay = $name . ' ' . $c['name'] . ' ' . $slug . ' ' . ($c['group']['name'] ?? '') . ' ' . ($s['sku'] ?? $c['sku']) . ' ' . $c['sku'] . ' '
                    . $eff['brand'] . ' ' . implode(' ', (array) $eff['keywords']);
                if (mb_stripos($hay, $f['q']) === false) return false;
            }
            return true;
        };
        if ($match(true)) {
            if ($noImg) $attnCount['img']++;
            if ($noPrice) $attnCount['price']++;
            if ($noDesc) $attnCount['desc']++;
            if ($noImg || $noPrice || $noDesc) $attnCount['any']++;
        }
        if (!$match(false)) continue;
        $rows[] = ['c' => $c, 'name' => $name, 'saved' => $s, 'edited' => AlokProducts::isEdited($s), 'hidden' => $isHidden, 'eff' => $eff,
            'attn' => ['img' => $noImg, 'price' => $noPrice, 'desc' => $noDesc], 'updated' => (string) ($s['updatedAt'] ?? '')];
    }
    $priceKey = static fn(array $r, bool $asc): float => $r['eff']['price'] === null ? ($asc ? INF : -INF) : (float) $r['eff']['price'];
    usort($rows, match ($f['sort']) {
        'recent'     => static fn($a, $b) => strcmp($b['updated'], $a['updated']) ?: strcasecmp($a['name'], $b['name']),
        'price-asc'  => static fn($a, $b) => $priceKey($a, true) <=> $priceKey($b, true) ?: strcasecmp($a['name'], $b['name']),
        'price-desc' => static fn($a, $b) => $priceKey($b, false) <=> $priceKey($a, false) ?: strcasecmp($a['name'], $b['name']),
        default      => static fn($a, $b) => strcasecmp($a['name'], $b['name']),
    });
    render('products', ['title' => 'Products', 'nav' => 'products', 'user' => $user, 'rows' => $rows, 'total' => count($cat),
        'f' => $f, 'groups' => $groups, 'hiddenCount' => count(array_intersect($hidden, array_keys($cat))), 'attnCount' => $attnCount,
        'bulkIn' => $bulkIn, 'bulkErr' => $bulkErr], $bulkErr ? 422 : 200);
}

function page_product(array $user, bool $isPost): never
{
    $cat = AlokProducts::catalogueAll();
    $slug = (string) ($_GET['slug'] ?? '');
    $isNew = $slug === '' && isset($_GET['new']);
    if ($isNew) {
        $c = ['slug' => '', 'name' => '', 'published' => true, 'custom' => true] + ['group' => null, 'path' => null] + AlokProducts::rowDefaults();
    } elseif (!isset($cat[$slug])) {
        render('error', ['title' => 'Product not found', 'user' => $user, 'message' => 'That product does not exist.'], 404);
    } else {
        $c = $cat[$slug];
    }
    $isCustom = !empty($c['custom']);
    $all = AlokProducts::all();
    $saved = $all[$slug] ?? [];
    $c = AlokProducts::placed($c, $saved);
    $def = product_default_for_form($c);
    $groups = AlokProducts::groups();
    $defaultGroup = (string) (($isCustom ? '' : ($cat[$slug]['group']['id'] ?? '')));
    $defaultMachines = $isCustom ? [] : AlokProducts::machineIds($cat[$slug], []);
    $gform = (string) ($c['group']['id'] ?? '');
    $mform = AlokProducts::machineIds($c, $saved);
    $hidden = AlokContent::hiddenProducts();
    $isHidden = in_array($slug, $hidden, true);
    $self = $isNew ? u('product', ['new' => 1]) : u('product', ['slug' => $slug]);
    $ip = AlokAuth::clientIp();
    $errors = [];
    $form = [];
    foreach (array_keys(AlokProducts::FIELDS) as $k) $form[$k] = (string) ($saved[$k] ?? '');
    $cdef = AlokProducts::commerceDefaults($c);
    $ceff = AlokProducts::effective($c, $saved);
    $cform = ['price' => $ceff['price'] === null ? '' : (string) $ceff['price'], 'availability' => $ceff['availability'],
        'stock' => $ceff['stock'] === null ? '' : (string) $ceff['stock'], 'keywords' => implode(', ', $ceff['keywords']),
        'brand' => $ceff['brand'], 'featured' => $ceff['featured'] ? '1' : '', 'status' => $ceff['status']];
    $images = array_values(array_filter((array) ($saved['images'] ?? []), static fn($i) => is_array($i) && AlokProducts::validId((string) ($i['id'] ?? ''))));
    $gd = AlokProducts::gdOk();

    if ($isPost) {
        $do = (string) ($_POST['do'] ?? 'save');

        if ($do === 'delete') {
            if (($_POST['confirm'] ?? '') !== 'yes' || $isNew) {
                flash_set('err', 'Tick the box to confirm.');
                redirect($self);
            }
            if ($isCustom) {
                foreach ((array) ($all[$slug]['images'] ?? []) as $im) AlokProducts::deleteFile((string) ($im['id'] ?? ''));
                unset($all[$slug]);
                AlokProducts::saveAll($all);
                AlokContent::saveHidden(array_values(array_diff($hidden, [$slug])));
                AlokStore::open()->audit($user['username'], 'product_delete', $slug, (string) $c['name'], $ip);
                flash_set('ok', '"' . $c['name'] . '" was permanently deleted.');
            } else {
                $entry = AlokProducts::storeCommerce($all[$slug] ?? [], ['status' => 'archived'], AlokProducts::commerceDefaults($cat[$slug]));
                $entry['updatedAt'] = gmdate('Y-m-d\TH:i:s\Z');
                $all[$slug] = $entry;
                AlokProducts::saveAll($all);
                AlokStore::open()->audit($user['username'], 'product_remove', $slug, 'archived', $ip);
                flash_set('ok', '"' . $c['name'] . '" was removed from the website. Set its status back to Active to bring it back.');
            }
            redirect(u('products'));
        }

        if ($do === 'reset') {
            if (isset($all[$slug])) {
                foreach ((array) ($all[$slug]['images'] ?? []) as $im) AlokProducts::deleteFile((string) ($im['id'] ?? ''));
                unset($all[$slug]);
                AlokProducts::saveAll($all);
                AlokStore::open()->audit($user['username'], 'product_reset', $slug, 'all edits and images removed', $ip);
            }
            flash_set('ok', 'All edits for "' . $c['name'] . '" were removed. The website shows the built-in details again.');
            redirect($self);
        }

        $gIn = (string) ($_POST['group'] ?? '');
        if (isset($groups[$gIn])) {
            $gform = $gIn;
        } else {
            $errors['group'] = 'Choose which product group this belongs to.';
        }
        $mIn = array_values(array_intersect(array_keys(AlokProducts::MACHINES), array_map('strval', (array) ($_POST['machines'] ?? []))));
        $mform = $mIn;

        [$clean, $textErrors] = AlokProducts::validateText($_POST, $def);
        $errors += $textErrors;
        if ($isCustom && ($clean['name'] ?? '') === '' && !isset($errors['name'])) {
            $errors['name'] = 'Enter the product name.';
        }
        foreach ($clean as $k => $v) $form[$k] = $v;
        foreach (array_keys(AlokProducts::FIELDS) as $k) if (!isset($clean[$k]) && !isset($errors[$k])) $form[$k] = '';
        [$cvals, $cerr] = AlokProducts::validateCommerce($_POST);
        $errors += $cerr;
        foreach (['price', 'availability', 'stock', 'keywords', 'brand'] as $k) $cform[$k] = is_string($_POST[$k] ?? null) ? mb_substr($_POST[$k], 0, 2000) : '';
        $cform['featured'] = !empty($_POST['featured']) ? '1' : '';
        if (!isset($cerr['status'])) $cform['status'] = $cvals['status']; else $cform['status'] = $ceff['status'];
        if (isset($cerr['availability'])) $cform['availability'] = $ceff['availability'];

        if ($isNew && !$errors) {
            $base = AlokProducts::slugify((string) $clean['name']);
            $slug = $base;
            for ($i = 2; isset($cat[$slug]) || isset($all[$slug]); $i++) $slug = $base . '-' . $i;
            $self = u('product', ['slug' => $slug]);
        }

        // Existing images: alt, order, removal (ids come only from what is already stored).
        $byId = [];
        foreach ($images as $im) $byId[$im['id']] = $im;
        $del = array_map('strval', (array) ($_POST['img_del'] ?? []));
        $alts = (array) ($_POST['img_alt'] ?? []);
        $pos = (array) ($_POST['img_pos'] ?? []);
        $keep = [];
        $removed = [];
        $n = 0;
        foreach ($byId as $id => $im) {
            if (in_array($id, $del, true)) { $removed[] = $id; continue; }
            $alt = AlokProducts::cleanAlt($alts[$id] ?? $im['alt'] ?? '');
            if (mb_strlen($alt) > AlokProducts::ALT_MAX) $errors['img_alt_' . $id] = 'Image description can be at most ' . AlokProducts::ALT_MAX . ' characters.';
            $keep[] = ['sort' => (float) ($pos[$id] ?? ($n + 1)) + $n / 1000, 'img' => ['id' => $id, 'url' => '/api/media.php?id=' . $id, 'alt' => $alt]];
            $n++;
        }
        usort($keep, static fn($a, $b) => $a['sort'] <=> $b['sort']);
        $keepImgs = array_column($keep, 'img');

        // New uploads.
        $newIds = [];
        $uploadNotes = [];
        $files = array_filter(AlokProducts::incomingFiles(), static fn($f) => $f['error'] !== UPLOAD_ERR_NO_FILE);
        if ($files) {
            $newAlt = AlokProducts::cleanAlt($_POST['new_alt'] ?? '');
            if (mb_strlen($newAlt) > AlokProducts::ALT_MAX) $errors['new_alt'] = 'Image description can be at most ' . AlokProducts::ALT_MAX . ' characters.';
            foreach ($files as $f) {
                if (count($keepImgs) + count($newIds) >= AlokProducts::MAX_IMAGES) { $uploadNotes[] = 'Only ' . AlokProducts::MAX_IMAGES . ' images per product; extra files were skipped.'; break; }
                if ($errors) break;
                [$id, $msg] = AlokProducts::storeUpload($f, $slug);
                if ($id === null) { $uploadNotes[] = (string) $msg; continue; }
                $newIds[] = $id;
                $keepImgs[] = ['id' => $id, 'url' => '/api/media.php?id=' . $id, 'alt' => $newAlt !== '' ? $newAlt : (string) ($clean['name'] ?? $c['name'])];
            }
        }

        // Visibility (only for published products).
        $wantShow = !empty($_POST['show']);

        if (!$errors) {
            $entry = AlokProducts::storeCommerce($clean, $cvals, $cdef);
            if ($keepImgs) $entry['images'] = $keepImgs;
            if ($isCustom) {
                $entry['custom'] = true;
                $entry['group'] = $gform;
                $entry['machines'] = $mform;
                $entry['createdAt'] = (string) ($saved['createdAt'] ?? gmdate('Y-m-d\TH:i:s\Z'));
            } else {
                if ($gform !== $defaultGroup) $entry['group'] = $gform;
                if ($mform !== $defaultMachines) $entry['machines'] = $mform;
            }
            $before = $saved;
            $changed = [];
            foreach (array_keys(AlokProducts::FIELDS) as $k) if (($before[$k] ?? '') !== ($entry[$k] ?? '')) $changed[] = $k;
            foreach (AlokProducts::COMMERCE as $k) if (json_encode($before[$k] ?? null) !== json_encode($entry[$k] ?? null)) $changed[] = $k;
            if (json_encode($before['images'] ?? []) !== json_encode($entry['images'] ?? [])) $changed[] = 'images';
            foreach (['group', 'machines'] as $k) if (json_encode($before[$k] ?? null) !== json_encode($entry[$k] ?? null)) $changed[] = $k;
            if ($isNew) $changed = ['created'];
            $visChanged = $c['published'] && $wantShow === $isHidden;
            try {
                if ($changed) {
                    if ($entry) { $entry['updatedAt'] = gmdate('Y-m-d\TH:i:s\Z'); $all[$slug] = $entry; } else { unset($all[$slug]); }
                    AlokProducts::saveAll($all);
                    foreach ($removed as $id) AlokProducts::deleteFile($id);
                    AlokStore::open()->audit($user['username'], 'product_edit', $slug, implode(', ', $changed), $ip);
                }
                if ($visChanged) {
                    AlokContent::saveHidden($wantShow ? array_values(array_diff($hidden, [$slug])) : array_merge($hidden, [$slug]));
                    AlokStore::open()->audit($user['username'], 'product_visibility', 'product-overrides.json', ($wantShow ? 'showed ' : 'hid ') . $slug, $ip);
                    $changed[] = 'visibility';
                }
                $msg = $isNew ? 'Product added. The website picks it up on the next page load.' : ($changed ? 'Saved: ' . implode(', ', $changed) . '. The website picks it up on the next page load.' : 'Nothing changed.');
                if ($uploadNotes) { flash_set('err', $msg . ' ' . implode(' ', $uploadNotes)); } else { flash_set('ok', $msg); }
                redirect($self);
            } catch (RuntimeException $ex) {
                foreach ($newIds as $id) AlokProducts::deleteFile($id);
                $errors['_save'] = 'Could not save: ' . $ex->getMessage();
            }
        } else {
            // Re-show the form with the owner's input; uploaded files must be chosen again.
            $images = $keepImgs;
        }
        $isHidden = !$wantShow && $c['published'];
    }

    render('product', ['title' => $isNew ? 'Add product' : ($saved['name'] ?? $c['name']), 'nav' => 'products', 'user' => $user, 'c' => $c, 'def' => $def, 'form' => $form,
        'images' => $images, 'errors' => $errors, 'cform' => $cform, 'cdef' => $cdef, 'gd' => $gd, 'isHidden' => $isHidden, 'self' => $self,
        'isNew' => $isNew, 'isCustom' => $isCustom, 'groups' => $groups, 'gform' => $gform, 'mform' => $mform,
        'edited' => AlokProducts::isEdited($saved), 'updatedAt' => (string) ($saved['updatedAt'] ?? '')], $errors ? 422 : 200);
}
