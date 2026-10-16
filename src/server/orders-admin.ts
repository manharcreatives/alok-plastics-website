import { query } from './db';
import { orders, type Doc, type Order, type PdfPayload } from './collection';
import { PER_PAGE, likeTerm } from './admin-util';
import { clean, phone91 } from './http';
import { fmtDay, normStatus, ORDER_STATUSES } from './shop';
import { getBusiness } from './kv';

type Raw = { id: string; data: Order; created_at: string; updated_at: string };

export async function listOrders(f: { status?: string; q?: string; page: number }): Promise<{ rows: Doc<Order>[]; total: number; counts: Record<string, number> }> {
  const where = ["collection = 'orders'"];
  const args: unknown[] = [];
  if (f.status && (ORDER_STATUSES as readonly string[]).includes(f.status)) {
    args.push(f.status);
    where.push(`data->>'status' = $${args.length}`);
  }
  if (f.q) {
    args.push(likeTerm(f.q));
    where.push(`(data->>'code' ilike $${args.length} or data->>'name' ilike $${args.length} or data->>'phone' ilike $${args.length})`);
  }
  const clause = where.join(' and ');
  const total = Number((await query<{ n: string }>(`select count(*) as n from docs where ${clause}`, args))[0]?.n ?? 0);
  const raw = await query<Raw>(
    `select id, data, created_at, updated_at from docs where ${clause} order by id desc limit ${PER_PAGE} offset ${(f.page - 1) * PER_PAGE}`,
    args,
  );
  const countRows = await query<{ s: string; n: string }>("select data->>'status' as s, count(*) as n from docs where collection = 'orders' group by 1");
  const counts: Record<string, number> = Object.fromEntries(ORDER_STATUSES.map((s) => [s, 0]));
  for (const r of countRows) counts[normStatus(r.s)] = (counts[normStatus(r.s)] ?? 0) + Number(r.n);
  const rows = raw.map((r) => ({ ...r.data, status: normStatus(r.data.status), id: Number(r.id), created_at: Number(r.created_at), updated_at: Number(r.updated_at) }));
  return { rows, total, counts };
}

export async function getOrder(id: string): Promise<Doc<Order> | null> {
  const o = await orders().find(Number(id));
  return o ? { ...o, status: normStatus(o.status) } : null;
}

/** Starting values for the PDF form: the order's own data over the business defaults. */
export async function pdfDefaults(o: Doc<Order>, type: 'proforma' | 'invoice'): Promise<PdfPayload & { type: string; no: string; date: string }> {
  const b = await getBusiness();
  return {
    type,
    no: type === 'invoice' ? o.invoice_no ?? '' : '',
    date: fmtDay(Math.floor(Date.now() / 1000)),
    customer: { name: o.name, phone: o.phone, address: o.address ?? '', state: b.state, gstin: '' },
    mode: 'ut',
    rate: 18,
    items: o.items.map((it) => ({ name: `${it.name}${it.variant ? ` - ${it.variant}` : ''}`.trim(), hsn: '', qty: it.qty, unit: it.unit, price: it.price })),
    note: '',
    transport: {
      transporter: o.transporter ?? '',
      gr_no: o.lr_no ?? '',
      gr_dt: o.dispatched_at ? fmtDay(o.dispatched_at) : '',
    },
  };
}

/** Validate the PDF form. Returns an error string or the document ready to store. */
export function pdfFromForm(form: FormData): { error: string } | { type: 'invoice' | 'proforma'; no: string; date: string; payload: PdfPayload } {
  const f = (k: string, max = 120, multi = false): string => clean(form.get(k), max, multi);
  const type = form.get('type') === 'invoice' ? 'invoice' : 'proforma';
  const mode = ['intra', 'inter', 'ut'].includes(String(form.get('mode'))) ? (String(form.get('mode')) as 'intra' | 'inter' | 'ut') : 'ut';
  const rate = String(form.get('rate') ?? '18').trim();
  const name = f('c_name', 80);
  const phone = phone91(f('c_phone', 30));
  const errs: string[] = [];
  if (name.length < 2) errs.push('Enter the customer name.');
  if (phone === null) errs.push('Enter a valid 10-digit WhatsApp number.');
  if (rate === '' || !Number.isFinite(Number(rate)) || Number(rate) < 0 || Number(rate) > 40) errs.push('GST % must be between 0 and 40.');
  let date = f('doc_date', 10);
  if (!/^\d{2}-\d{2}-\d{4}$/.test(date)) date = fmtDay(Math.floor(Date.now() / 1000));
  const no = f('doc_no', 40);
  if (no !== '' && !/^[A-Za-z0-9/_.\- ]+$/.test(no)) errs.push('The document number may only use letters, digits, / - . and _.');

  const names = form.getAll('it_name').map(String);
  const hsns = form.getAll('it_hsn').map(String);
  const qtys = form.getAll('it_qty').map(String);
  const units = form.getAll('it_unit').map(String);
  const prices = form.getAll('it_price').map(String);
  const items: PdfPayload['items'] = [];
  names.slice(0, 60).forEach((raw, i) => {
    const n = clean(raw, 160);
    if (n === '') return;
    const qty = (qtys[i] ?? '').trim();
    const price = (prices[i] ?? '').trim();
    if (qty === '' || !Number.isFinite(Number(qty)) || Number(qty) <= 0 || Number(qty) > 10_000_000) { errs.push(`Enter a quantity above 0 for "${n.slice(0, 40)}".`); return; }
    if (price !== '' && (!Number.isFinite(Number(price)) || Number(price) < 0)) { errs.push(`The price for "${n.slice(0, 40)}" must be a number, or blank for "On request".`); return; }
    items.push({ name: n, hsn: clean(hsns[i], 12), qty: Number(qty), unit: clean(units[i], 12) || 'pcs', price: price === '' ? null : Number(price) });
  });
  if (items.length === 0) errs.push('Add at least one item.');
  if (type === 'invoice' && items.some((it) => it.price === null)) errs.push('A GST invoice needs a price on every line.');
  if (errs.length > 0 || phone === null) return { error: [...new Set(errs)].join(' ') };
  return {
    type, no, date,
    payload: {
      customer: { name, phone, address: f('c_address', 300, true), state: f('c_state', 40), gstin: f('c_gstin', 15).toUpperCase() },
      mode, rate: Number(rate), items, note: f('note', 300, true),
      transport: { transporter: f('t_transporter', 60), gr_no: f('t_gr_no', 40), gr_dt: f('t_gr_dt', 20) },
    },
  };
}
