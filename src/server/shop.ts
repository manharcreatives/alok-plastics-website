import { createHash, randomBytes } from 'node:crypto';
import type { NextRequest } from 'next/server';
import { clean } from './http';
import { now } from './db';
import { customers, sessions, type CartLine, type Customer, type Doc, type Order, type OrderItem } from './collection';
import { nextNumber, type Business } from './kv';

/* Customer-side commerce helpers (ported from admin/lib/shop.php). No OTP: a customer is just name + mobile. */

export const SESSION_DAYS = 30;
export const ENQ_START = 1001;

export const ORDER_STATUSES = ['pending', 'reviewing', 'quoted', 'confirmed', 'paid', 'dispatched', 'invoiced', 'closed', 'cancelled'] as const;
export const ORDER_LABELS: Record<string, string> = {
  pending: 'New enquiry',
  reviewing: 'Under review',
  quoted: 'Quote sent',
  confirmed: 'Order confirmed',
  paid: 'Payment received',
  dispatched: 'Dispatched',
  invoiced: 'GST invoice issued',
  closed: 'Closed',
  cancelled: 'Cancelled',
};
export const APPLICATION_STATUSES = ['new', 'reviewing', 'shortlisted', 'rejected', 'hired'] as const;
export const APPLICATION_LABELS: Record<string, string> = { new: 'New', reviewing: 'Reviewing', shortlisted: 'Shortlisted', rejected: 'Rejected', hired: 'Hired' };

const FLOW = ['pending', 'reviewing', 'quoted', 'confirmed', 'paid', 'dispatched', 'invoiced', 'closed'];

export const normStatus = (s: string): string => ({ processing: 'reviewing', completed: 'closed' } as Record<string, string>)[s] ?? s;

export function nextStatus(s: string): string | null {
  const i = FLOW.indexOf(normStatus(s));
  return i < 0 || i >= FLOW.length - 1 ? null : FLOW[i + 1]!;
}

/** The stage an order can step back to; for a cancelled order, the stage it was cancelled from. */
export function prevStatus(o: Pick<Order, 'status' | 'history'>): string | null {
  const s = normStatus(o.status);
  if (s === 'cancelled') {
    for (const h of [...(o.history ?? [])].reverse()) {
      if (h.to === 'cancelled' && FLOW.includes(normStatus(h.from))) return normStatus(h.from);
    }
    return 'pending';
  }
  const i = FLOW.indexOf(s);
  return i < 1 ? null : FLOW[i - 1]!;
}

export const sha256 = (s: string): string => createHash('sha256').update(s).digest('hex');

export async function upsertCustomer(phone: string, name: string, ip: string): Promise<Doc<Customer>> {
  const found = (await customers().where('phone', phone))[0];
  if (found) return (await customers().update(found.id, { name, last_login: now() })) ?? found;
  return customers().insert({ phone, name, last_login: now(), ip });
}

export async function startSession(customer: Doc<Customer>, ip: string): Promise<string> {
  const token = randomBytes(32).toString('hex');
  await sessions().insert({ customer_id: customer.id, hash: sha256(token), expires: now() + SESSION_DAYS * 86400, ip });
  return token;
}

const TOKEN_RE = /^[a-f0-9]{64}$/;

export async function customerFromRequest(req: NextRequest): Promise<Doc<Customer> | null> {
  const token = req.headers.get('x-alok-session') ?? '';
  if (!TOKEN_RE.test(token)) return null;
  const s = (await sessions().where('hash', sha256(token)))[0];
  if (!s || s.expires <= now()) return null;
  return customers().find(s.customer_id);
}

export async function endSession(req: NextRequest): Promise<void> {
  const token = req.headers.get('x-alok-session') ?? '';
  if (!TOKEN_RE.test(token)) return;
  for (const s of await sessions().where('hash', sha256(token))) await sessions().delete(s.id);
}

/** Sequential, human-friendly enquiry id: ENQ-1001, ENQ-1002 ... */
export async function orderCode(): Promise<string> {
  return `ENQ-${await nextNumber('seq:enq', ENQ_START)}`;
}

type RawLine = Record<string, unknown>;
const lines = (raw: unknown): RawLine[] => (Array.isArray(raw) ? raw.slice(0, 60).filter((x): x is RawLine => !!x && typeof x === 'object') : []);
const money = (v: unknown): number | null => (v !== null && v !== '' && v !== undefined && Number.isFinite(Number(v)) ? Math.max(0, Number(v)) : null);

export function cleanItems(raw: unknown): OrderItem[] {
  const out: OrderItem[] = [];
  for (const it of lines(raw)) {
    const name = clean(it.name, 140);
    const qty = Math.trunc(Number(it.qty) || 0);
    if (name === '' || qty < 1) continue;
    out.push({ slug: clean(it.slug, 120), name, variant: clean(it.variant, 120), qty: Math.min(qty, 999_999), unit: it.unit === 'sets' ? 'sets' : 'pcs', price: money(it.price) });
  }
  return out;
}

export function cleanCartLines(raw: unknown): CartLine[] {
  const out: CartLine[] = [];
  for (const it of lines(raw)) {
    const name = clean(it.name, 140);
    const qty = Math.trunc(Number(it.qty) || 0);
    if (name === '' || qty < 1) continue;
    const a = String(it.availability ?? '');
    out.push({
      slug: clean(it.slug, 120),
      name,
      sku: clean(it.sku, 60),
      qty: Math.min(qty, 999_999),
      price: money(it.price),
      availability: ['in-stock', 'out-of-stock', 'on-request'].includes(a) ? a : 'on-request',
    });
  }
  return out;
}

export function orderTotal(items: OrderItem[]): number | null {
  let sum = 0;
  for (const it of items) {
    if (it.price === null) return null;
    sum += it.price * it.qty;
  }
  return items.length ? sum : null;
}

const dateIn = (ts: number, opts: Intl.DateTimeFormatOptions): string => new Date(ts * 1000).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', ...opts });
export const fmtDateTime = (ts: number): string => dateIn(ts, { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
export const fmtDay = (ts: number): string => dateIn(ts, { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-');
const rs = (n: number): string => `Rs. ${Math.round(n).toLocaleString('en-IN')}`;

/** The enquiry as a WhatsApp message (also the text the customer is handed to send to the business). */
export function orderText(o: Pick<Order, 'code' | 'name' | 'phone' | 'address' | 'items' | 'total' | 'note'> & { created_at: number }): string {
  const L = ['*New Enquiry — Alok Plastics*', '', `Enquiry ID: ${o.code}`, `Date: ${dateIn(o.created_at, { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}`,
    `Name: ${o.name}`, `Mobile: +${o.phone}`, `Address: ${o.address ?? ''}`, '', '*Items*'];
  o.items.forEach((it, i) => L.push(`${i + 1}. ${it.name}${it.variant ? ` (${it.variant})` : ''} × ${it.qty} ${it.unit}`));
  if (o.total !== null) L.push('', `Estimated total: ${rs(Number(o.total))}`);
  if (o.note) L.push('', `Note: ${o.note}`);
  L.push('', 'Please share the quote / proforma invoice.');
  return L.join('\n');
}

/** Customer-facing WhatsApp text for the order's current stage; the admin sends it from the order screen. */
export function stageMessage(o: Order): string {
  const c = o.code;
  const name = o.name.trim().split(' ')[0] ?? '';
  const has = (v: unknown): boolean => v !== undefined && v !== null && v !== '';
  switch (normStatus(o.status)) {
    case 'pending': return `Hello ${name}, we have received your enquiry ${c}. Our team is reviewing it and will share the quote shortly. - Alok Plastics`;
    case 'reviewing': return `Hello ${name}, your enquiry ${c} is under review. We will send you the quote / proforma invoice soon. - Alok Plastics`;
    case 'quoted': return `Hello ${name}, please find the quote / proforma invoice for enquiry ${c}.${has(o.quote_amount) ? ` Quoted amount: ${rs(Number(o.quote_amount))}.` : ''}${has(o.quote_note) ? ` ${o.quote_note}` : ''} Reply here to confirm the order. - Alok Plastics`;
    case 'confirmed': return `Hello ${name}, your order ${c} is CONFIRMED. Please make the payment offline as per the proforma invoice and share the payment details here. - Alok Plastics`;
    case 'paid': return `Hello ${name}, we have received your payment${has(o.pay_amount) ? ` of ${rs(Number(o.pay_amount))}` : ''} for order ${c}. Thank you! We are preparing your dispatch. - Alok Plastics`;
    case 'dispatched': return `Hello ${name}, your order ${c} has been dispatched.${has(o.lr_no) ? ` LR / tracking no: ${o.lr_no}${has(o.transporter) ? ` (${o.transporter})` : ''}.` : ''} - Alok Plastics`;
    case 'invoiced': return `Hello ${name}, the GST invoice for order ${c} has been issued.${has(o.invoice_no) ? ` Invoice no: ${o.invoice_no}.` : ''} - Alok Plastics`;
    case 'closed': return `Hello ${name}, order ${c} is now closed. Thank you for choosing Alok Plastics!`;
    case 'cancelled': return `Hello ${name}, your enquiry ${c} has been cancelled.${has(o.cancel_reason) ? ` Reason: ${o.cancel_reason}.` : ''} Please contact us if you would like to place a new enquiry.`;
    default: return `Hello ${name}, this is Alok Plastics regarding ${c}.`;
  }
}

/** April-to-March financial year label, e.g. "2026-27". */
export function financialYear(d = new Date()): string {
  const ist = new Date(d.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  const start = ist.getMonth() + 1 >= 4 ? ist.getFullYear() : ist.getFullYear() - 1;
  return `${start}-${String(start + 1).slice(2)}`;
}

/** Gapless per-FY document numbers: AP/INV/2026-27/0001 and AP/PF/2026-27/0001. */
export async function nextDocNo(type: 'invoice' | 'proforma'): Promise<string> {
  const fy = financialYear();
  const n = await nextNumber(`seq:${type}:${fy}`, 1);
  return `AP/${type === 'invoice' ? 'INV' : 'PF'}/${fy}/${String(n).padStart(4, '0')}`;
}

export const waNumber = (b: Business): string => (b.whatsapp || '').replace(/\D/g, '');
