import type { NextRequest } from 'next/server';
import { clean, clientIp, phone91, rateLimit, readBody, respond, sameSite } from '@/server/http';
import { customers } from '@/server/collection';
import { customerFromRequest, endSession, startSession, upsertCustomer } from '@/server/shop';

/* Customer "sign in" has no OTP: name + mobile creates (or finds) the customer and returns a session token. */

export async function POST(req: NextRequest) {
  if (!sameSite(req)) return respond(403, { ok: false, error: 'Forbidden.' });
  try {
    const body = await readBody(req);
    const action = String(body.action ?? '');
    const ip = clientIp(req);

    if (action === 'request') {
      const name = clean(body.name, 80);
      const phone = phone91(String(body.phone ?? ''));
      const errors: Record<string, string> = {};
      if (name.length < 2) errors.name = 'Enter your full name.';
      if (phone === null) errors.phone = 'Enter a valid 10-digit mobile number.';
      if (Object.keys(errors).length > 0 || phone === null) return respond(422, { ok: false, errors });
      if (!(await rateLimit(`signin:${phone}`, 10, 3600)) || !(await rateLimit(`signinip:${ip}`, 30, 3600))) {
        return respond(429, { ok: false, error: 'Too many attempts. Please try again later.' });
      }
      const customer = await upsertCustomer(phone, name, ip);
      await customers().update(customer.id, { verified: 0 });
      const token = await startSession(customer, ip);
      return respond(200, { ok: true, skipped: true, token, user: { name: customer.name, phone: customer.phone } });
    }

    if (action === 'me') {
      const c = await customerFromRequest(req);
      if (!c) return respond(401, { ok: false, error: 'Session expired.' });
      return respond(200, { ok: true, user: { name: c.name, phone: c.phone } });
    }

    if (action === 'logout') {
      await endSession(req);
      return respond(200, { ok: true });
    }

    return respond(400, { ok: false, error: 'Unknown action.' });
  } catch (e) {
    console.error('[alok-auth]', e);
    return respond(500, { ok: false, error: 'Something went wrong. Please try again.' });
  }
}
