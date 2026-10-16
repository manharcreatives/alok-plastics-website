import type { NextRequest } from 'next/server';
import { query, now } from '@/server/db';
import { clean, clientIp, ipHash, rateLimit, readBody, respond, sameSite } from '@/server/http';
import { sendMail } from '@/server/mail';

/* Enquiry endpoint (replaces public/api/enquiry.php). Validation mirrors src/lib/enquiry-schema.ts. */

const BUYER_TYPES = ['oem', 'dealer', 'distributor', 'repair-workshop', 'other'];
const PRODUCT_RE = /\s*((?:[^,(]|\((?!\d+\s*(?:pcs|sets)\s*\)))+?)\s*(?:\(\s*(\d+)\s*(pcs|sets)\s*\))?\s*(?:,|$)/gu;

/** "Hinge (50 pcs), Gasket" -> [{ name, qty, unit }] */
function parseProducts(s: string): { name: string; qty: number; unit: string }[] {
  const out: { name: string; qty: number; unit: string }[] = [];
  for (const m of s.trim().matchAll(PRODUCT_RE)) {
    const name = (m[1] ?? '').trim();
    if (name === '' || name.toLowerCase() === 'not specified') continue;
    out.push({ name: name.slice(0, 120), qty: Number(m[2] ?? 0), unit: m[3] ?? 'pcs' });
  }
  return out;
}

const validPhone = (p: string): boolean => /^[0-9+\-\s()]+$/.test(p) && p.replace(/\D/g, '').length >= 7 && p.replace(/\D/g, '').length <= 15;
const validGstin = (g: string): boolean => /^\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(g.toUpperCase());
const validEmail = (e: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

export async function POST(req: NextRequest) {
  if (!sameSite(req)) return respond(403, { ok: false, error: 'Forbidden.' });
  const body = await readBody(req);

  // Honeypot: pretend success so bots learn nothing.
  if (body._honey) return respond(200, { ok: true, message: 'Thank you for your enquiry.' });

  const name = clean(body.name);
  const company = clean(body.company);
  const phone = clean(body.phone);
  const message = clean(body.message, 5000, true);
  const email = clean(body.email);
  const product = clean(body.product ?? 'Not specified').slice(0, 600);
  const quantity = Math.max(0, Math.min(Math.trunc(Number(body.quantity) || 0), 9_999_999));
  const unit = body.quantityUnit === 'sets' ? 'sets' : 'pcs';
  const city = clean(body.city);
  const state = clean(body.state);
  const gstin = clean(body.gstin).toUpperCase();
  const buyerType = BUYER_TYPES.includes(clean(body.buyerType)) ? clean(body.buyerType) : 'other';
  const source = clean(body._source ?? 'unknown').slice(0, 40);

  const errors: Record<string, string> = {};
  if (name.length < 2) errors.name = 'Name is required (min 2 characters).';
  if (company.length < 2) errors.company = 'Company name is required.';
  if (!validPhone(phone)) errors.phone = 'Enter a valid phone number.';
  if (email !== '' && !validEmail(email)) errors.email = 'Enter a valid email address.';
  if (gstin !== '' && !validGstin(gstin)) errors.gstin = 'Enter a valid GSTIN (15 characters).';
  if (name.length > 80) errors.name = 'Name is too long.';
  if (company.length > 100) errors.company = 'Company name is too long.';
  if (message.length > 2000) errors.message = 'Message is too long.';
  if (Object.keys(errors).length > 0) return respond(422, { ok: false, errors });

  // One submit per IP per 30 s. Counted only after validation passes, so fixing a typo is never limited.
  const ip = clientIp(req);
  try {
    if (!(await rateLimit(`enq:${ipHash(ip)}`, 1, 30))) {
      return respond(429, { ok: false, error: 'Too many requests. Please wait a moment and try again.' });
    }
  } catch (e) {
    console.error('[alok-enquiry] rate limit unavailable', e);
  }

  const ist = new Date().toLocaleString('en-GB', { timeZone: 'Asia/Kolkata' });
  const line = '─────────────────────────────────────────\n';
  const text =
    'New enquiry received via the Alok Plastics website.\n\n' +
    `${line}Contact Information\n${line}` +
    `Name:       ${name}\nCompany:    ${company}\nPhone:      ${phone}\n` +
    (email ? `Email:      ${email}\n` : '') +
    (city ? `City:       ${city}\n` : '') +
    (state ? `State:      ${state}\n` : '') +
    (gstin ? `GSTIN:      ${gstin}\n` : '') +
    `Buyer Type: ${buyerType}\n\n` +
    `${line}Product / Requirement\n${line}` +
    `Product:    ${product}\n` +
    (quantity > 0 ? `Quantity:   ${quantity} ${unit}\n` : '') +
    (message ? `\nMessage:\n${message}\n` : '') +
    `\n${line}Source: ${source}\nSubmitted: ${ist} IST\n`;

  const sent = await sendMail({
    subject: `New Enquiry from ${name} (${company}) — Alok Plastics`,
    text,
    replyTo: email || undefined,
    type: 'enquiry',
    row: [name, company, phone, email, city, state, buyerType, product, quantity > 0 ? `${quantity} ${unit}` : '', message, source],
  });

  const t = now();
  let stored = false;
  try {
    await query(
      `insert into enquiries (created_at, updated_at, name, company, phone, email, city, state, gstin, buyer_type,
         product, products, quantity, unit, message, source, ip_hash, mail_ok, status)
       values ($1,$1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11::jsonb,$12,$13,$14,$15,$16,$17,'new')`,
      [t, name, company, phone, email, city, state, gstin, buyerType, product === 'Not specified' ? '' : product,
        JSON.stringify(parseProducts(product)), quantity, unit, message, source, ipHash(ip), sent ? 1 : 0],
    );
    stored = true;
  } catch (e) {
    console.error('[alok-enquiry] could not store enquiry', e);
  }

  if (!sent && !stored) {
    return respond(500, { ok: false, error: 'Email delivery failed. Please use WhatsApp or call us directly.' });
  }
  return respond(200, { ok: true, message: 'Thank you for your enquiry. We will respond within one business day.' });
}
