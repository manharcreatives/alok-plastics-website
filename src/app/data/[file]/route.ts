import type { NextRequest } from 'next/server';
import { kvGet } from '@/server/kv';

/* GET /data/<name>.json : the public JSON the admin publishes (settings, careers, product overrides, products).
   The browser overlays it on the build-time content (see src/components/runtime). Always revalidated. */

const FILES = new Set(['settings', 'careers', 'product-overrides', 'products']);
export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest, ctx: { params: Promise<{ file: string }> }) {
  const { file } = await ctx.params;
  const name = file.replace(/\.json$/, '');
  if (!FILES.has(name)) return new Response('Not found', { status: 404 });
  const value = await kvGet(name);
  if (value === null) return new Response('Not found', { status: 404 });
  return Response.json(value, { headers: { 'Cache-Control': 'no-cache', 'X-Content-Type-Options': 'nosniff' } });
}
