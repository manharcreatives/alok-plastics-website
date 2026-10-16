import type { NextRequest } from 'next/server';
import { clientIp, rateLimit, readBody, respond, sameSite } from '@/server/http';
import { carts } from '@/server/collection';
import { now } from '@/server/db';
import { cleanCartLines, customerFromRequest } from '@/server/shop';

/* Live cart sync: the website posts the visitor's cart (debounced) so the admin can see what people add.
   Best-effort: the cart never depends on this call. Anonymous until the visitor has given name + mobile. */

export async function POST(req: NextRequest) {
  if (!sameSite(req)) return respond(403, { ok: false, error: 'Forbidden.' });
  try {
    const body = await readBody(req);
    const visitor = String(body.visitor ?? '');
    if (!/^[a-zA-Z0-9_-]{16,64}$/.test(visitor)) return respond(422, { ok: false, error: 'Invalid visitor.' });
    if (!(await rateLimit(`cart:${visitor}`, 120, 3600)) || !(await rateLimit(`cartip:${clientIp(req)}`, 600, 3600))) {
      return respond(429, { ok: false, error: 'Too many updates.' });
    }
    const lines = cleanCartLines(body.items);
    const customer = await customerFromRequest(req);
    const open = (await carts().where('visitor', visitor)).find((c) => c.status === 'open') ?? null;

    // Housekeeping: drop carts untouched for 30 days.
    const stale = await carts().all();
    for (const c of stale) if (c.updated_at < now() - 30 * 86400) await carts().delete(c.id);

    if (lines.length === 0) {
      if (open) await carts().delete(open.id);
      return respond(200, { ok: true });
    }
    const patch = {
      lines,
      name: customer?.name ?? open?.name ?? '',
      phone: customer?.phone ?? open?.phone ?? '',
      customer_id: customer?.id ?? open?.customer_id ?? 0,
    };
    if (open) await carts().update(open.id, patch);
    else await carts().insert({ ...patch, visitor, status: 'open', started_at: now(), ip: clientIp(req) });
    return respond(200, { ok: true });
  } catch (e) {
    console.error('[alok-cart]', e);
    return respond(500, { ok: false, error: 'Could not sync the cart.' });
  }
}
