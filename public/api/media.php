<?php
/**
 * Alok Plastics — product image stream (GET /api/media.php?id=<16 hex>).
 *
 * Images are stored OUTSIDE the web root (<data_dir>/uploads/<yyyy-mm>/<slug>-<id>.<ext>) after the admin
 * re-encoded them with GD. This endpoint is public (product photos are public content) but allowlist
 * gated: the id must be well formed AND listed in products.json, the content type comes from a fixed
 * extension map, never from the request or the file. Anything else is a plain 404.
 */

declare(strict_types=1);

define('ALOK_ADMIN', true); // lets the shared config helpers load; nothing here renders admin UI
require dirname(__DIR__) . '/admin/lib/core.php';

const ALOK_MEDIA_TYPES = ['jpg' => 'image/jpeg', 'webp' => 'image/webp', 'png' => 'image/png'];

function media_404(): never
{
    http_response_code(404);
    header('Content-Type: text/plain; charset=utf-8');
    header('X-Content-Type-Options: nosniff');
    header('Cache-Control: no-store');
    echo 'Not found';
    exit;
}

$id = $_GET['id'] ?? '';
if (!is_string($id) || !preg_match('/^[a-f0-9]{16}$/', $id)) {
    media_404();
}

try {
    $json = AlokFs::readJson(AlokConfig::publicDataDir() . '/products.json');
    $listed = false;
    foreach ((array) ($json['products'] ?? []) as $p) {
        foreach ((array) ($p['images'] ?? []) as $im) {
            if (is_array($im) && ($im['id'] ?? null) === $id) {
                $listed = true;
                break 2;
            }
        }
    }
    if (!$listed) {
        media_404();
    }
    $hits = glob(AlokConfig::dataDir() . '/uploads/*/*-' . $id . '.{jpg,webp,png}', GLOB_BRACE) ?: [];
} catch (Throwable) {
    media_404();
}

$file = $hits[0] ?? null;
if ($file === null || !is_file($file)) {
    media_404();
}
$type = ALOK_MEDIA_TYPES[strtolower(pathinfo($file, PATHINFO_EXTENSION))] ?? null;
if ($type === null) {
    media_404();
}

$mtime = (int) filemtime($file);
$etag = '"' . $id . '-' . $mtime . '"';
header('X-Content-Type-Options: nosniff');
header('Cache-Control: public, max-age=31536000, immutable');
header('ETag: ' . $etag);
header('Last-Modified: ' . gmdate('D, d M Y H:i:s', $mtime) . ' GMT');
header("Content-Security-Policy: default-src 'none'; sandbox");
header('Cross-Origin-Resource-Policy: same-site');
if (($_SERVER['HTTP_IF_NONE_MATCH'] ?? '') === $etag) {
    http_response_code(304);
    exit;
}
header('Content-Type: ' . $type);
header('Content-Length: ' . (string) filesize($file));
readfile($file);
