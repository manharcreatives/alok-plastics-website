import type { NextRequest } from 'next/server';
import { clean, clientIp, rateLimit, readBody, respond, sameSite } from '@/server/http';
import { carts, customers, orders, type Order } from '@/server/collection';
import { getBusiness } from '@/server/kv';
import { sendMail } from '@/server/mail';
import { cleanItems, customerFromRequest, orderCode, orderText, orderTotal, waNumber } from '@/server/shop';

/* Orders ("enquiries" with a cart): place a new one, or list this customer's recent ones. */

export async function POST(req: NextRequest) {
  if (!sameSite(req)) return respond(403, { ok: false, error: 'Forbidden.' });
  try {
    const body = await readBody(req);
    const customer = await customerFromRequest(req);
    if (!customer) return respond(401, { ok: false, code: 'auth', error: 'Please sign in to place your order.' });
    const ip = clientIp(req);

    if (body.action === 'list') {
      const mine = (await orders().where('customer_id', customer.id)).sort((a, b) => b.created_at - a.created_at).slice(0, 50);
      return respond(200, {
        ok: true,
        // Only what the customer needs to see: never the team's internal notes or the IP address.
        orders: mine.map((o) => ({
          code: o.code,
          createdAt: o.created_at,
          updatedAt: o.updated_at,
          total: o.total ?? null,
          status: o.status || 'pending',
          itemCount: o.items.length,
          name: o.name,
          address: o.address,
          note: o.note,
          items: o.items.map((it) => ({ name: it.name, variant: it.variant, qty: it.qty, unit: it.unit })),
          quoteAmount: o.quote_amount ?? null,
          transporter: o.transporter ?? '',
          lrNo: o.lr_no ?? '',
          invoiceNo: o.invoice_no ?? '',
          cancelReason: o.cancel_reason ?? '',
        })),
      });
    }

    if (!(await rateLimit(`order:${customer.id}`, 10, 3600)) || !(await rateLimit(`orderip:${ip}`, 30, 3600))) {
      return respond(429, { ok: false, error: 'Too many orders in a short time. Please try again later.' });
    }
    const items = cleanItems(body.items);
    if (items.length === 0) return respond(422, { ok: false, error: 'Your cart is empty.' });
    const address = clean(body.address, 300, true);
    if (address.length < 8) {
      return respond(422, { ok: false, errors: { address: 'Enter your full delivery address.' }, error: 'Enter your full delivery address.' });
    }
    await customers().update(customer.id, { address });
    const note = clean(body.note, 1000, true);
    const fresh = await customers().find(customer.id);
    const order = await orders().insert({
      code: await orderCode(),
      customer_id: customer.id,
      name: customer.name,
      phone: customer.phone,
      address,
      verified: fresh?.verified ?? 1,
      items,
      total: orderTotal(items),
      note,
      status: 'pending',
      notes: [],
      ip,
    } satisfies Order);

    // The visitor's live cart becomes this order: mark it submitted so the admin stops listing it as open.
    const visitor = String(body.visitor ?? '');
    if (/^[a-zA-Z0-9_-]{16,64}$/.test(visitor)) {
      for (const c of await carts().where('visitor', visitor)) {
        if (c.status === 'open') await carts().update(c.id, { status: 'submitted', order_code: order.code, name: customer.name, phone: customer.phone });
      }
    }

    const text = orderText(order);
    const mailed = await sendMail({
      subject: `New enquiry ${order.code} — ${order.name}`, text: text.replace(/\*/g, ''), type: 'order',
      row: [order.code, order.name, `+${order.phone}`, address, items.map((i) => `${i.name}${i.variant ? ` (${i.variant})` : ''} x ${i.qty} ${i.unit}`).join('; '), order.total ?? '', note],
    });
    await orders().update(order.id, { mail_ok: mailed ? 1 : 0 });
    const business = await getBusiness();
    return respond(200, {
      ok: true,
      order: { code: order.code, createdAt: order.created_at, total: order.total },
      wa: { number: waNumber(business), text },
    });
  } catch (e) {
    console.error('[alok-order]', e);
    return respond(500, { ok: false, error: 'We could not place your order. Please try again or contact us on WhatsApp.' });
  }
}
