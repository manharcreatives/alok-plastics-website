import type { NextRequest } from 'next/server';
import { getFile } from '@/server/files';

/* GET /api/media.php?id=<id> : product photos uploaded in the admin. The URL shape is fixed by the runtime
   schema (src/lib/runtime-schema.ts). Public content, but only files stored as product images are served. */

const NOT_FOUND = () => new Response('Not found', { status: 404, headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' } });

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id') ?? '';
  if (!/^[a-z0-9_-]{1,64}$/.test(id)) return NOT_FOUND();
  const f = await getFile(id, 'product');
  if (!f) return NOT_FOUND();
  const etag = `"${f.id}-${f.size}"`;
  if (req.headers.get('if-none-match') === etag) return new Response(null, { status: 304 });
  return new Response(new Uint8Array(f.data), {
    headers: {
      'Content-Type': f.mime,
      'Content-Length': String(f.data.length),
      'Cache-Control': 'public, max-age=31536000, immutable',
      ETag: etag,
      'X-Content-Type-Options': 'nosniff',
      'Content-Security-Policy': "default-src 'none'; sandbox",
    },
  });
}
