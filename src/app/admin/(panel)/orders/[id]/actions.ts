'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { audit, requireAdmin } from '@/server/admin-auth';
import { orders, type Order, type PdfEntry } from '@/server/collection';
import { clean, phone91 } from '@/server/http';
import { flash, makeNote, num } from '@/server/admin-util';
import { getOrder, pdfFromForm } from '@/server/orders-admin';
import { nextDocNo, nextStatus, ORDER_LABELS, prevStatus } from '@/server/shop';
import { now } from '@/server/db';

/* Every action re-checks the session: a server action is a public POST endpoint, never trust the page that rendered it. */

const here = (id: string): string => `/admin/orders/${id}/`;

async function load(id: string) {
  const user = await requireAdmin();
  const o = await getOrder(id);
  if (!o) redirect('/admin/orders/');
  return { user, o };
}

const field = (form: FormData, k: string, max = 120): string => clean(form.get(k), max);

export async function advanceOrder(id: string, form: FormData): Promise<void> {
  const { user, o } = await load(id);
  const target = nextStatus(o.status);
  if (target === null || ['closed', 'cancelled'].includes(o.status)) flash(here(id), 'err', 'This order cannot move any further.');
  const to = target as string;
  const patch: Partial<Order> & Record<string, unknown> = { status: to };
  let err: string | null = null;
  if (to === 'quoted') {
    const amt = String(form.get('quote_amount') ?? '').trim();
    if (amt !== '' && num(amt) === null) err = 'Quote amount must be a number.';
    Object.assign(patch, { quote_amount: amt === '' ? null : Math.max(0, Number(amt)), quote_note: field(form, 'quote_note', 300), quoted_at: now() });
  } else if (to === 'confirmed') {
    patch.confirmed_at = now();
  } else if (to === 'paid') {
    const amt = num(form.get('pay_amount'));
    if (amt === null || amt <= 0) err = 'Enter the amount received.';
    Object.assign(patch, { pay_amount: amt, pay_mode: field(form, 'pay_mode', 30), pay_ref: field(form, 'pay_ref', 80), paid_at: now() });
  } else if (to === 'dispatched') {
    Object.assign(patch, { transporter: field(form, 'transporter', 80), lr_no: field(form, 'lr_no', 60), dispatched_at: now() });
  } else if (to === 'invoiced') {
    const last = [...(o.pdfs ?? [])].reverse().find((p) => p.type === 'invoice' && p.no)?.no;
    Object.assign(patch, { invoice_no: o.invoice_no || last || (await nextDocNo('invoice')), invoiced_at: now() });
  } else if (to === 'closed') {
    patch.closed_at = now();
  }
  if (err) flash(here(id), 'err', err);
  const note = makeNote(user.name, form.get('note'));
  if (note) patch.notes = [...o.notes, note];
  patch.history = [...(o.history ?? []), { at: now(), by: user.name, from: o.status, to }];
  const updated = await orders().update(o.id, patch);
  await audit(user.username, 'order_status', o.code, `${o.status} -> ${to}`);
  flash(here(id), 'ok', `${o.code} is now "${ORDER_LABELS[to]}"${to === 'invoiced' && updated?.invoice_no ? `. Invoice ${updated.invoice_no}` : ''}. Use "Open in WhatsApp" to message the customer.`);
}

export async function cancelOrder(id: string, form: FormData): Promise<void> {
  const { user, o } = await load(id);
  if (['closed', 'cancelled'].includes(o.status)) flash(here(id), 'err', 'This order cannot be cancelled.');
  const reason = field(form, 'reason', 300);
  if (reason === '') flash(here(id), 'err', 'Add a reason for cancelling.');
  const note = makeNote(user.name, `Cancelled: ${reason}`);
  await orders().update(o.id, {
    status: 'cancelled',
    cancel_reason: reason,
    notes: note ? [...o.notes, note] : o.notes,
    history: [...(o.history ?? []), { at: now(), by: user.name, from: o.status, to: 'cancelled' }],
  });
  await audit(user.username, 'order_status', o.code, `${o.status} -> cancelled`);
  flash(here(id), 'ok', `${o.code} cancelled.`);
}

export async function backOrder(id: string, form: FormData): Promise<void> {
  const { user, o } = await load(id);
  const prev = prevStatus(o);
  if (prev === null) flash(here(id), 'err', 'This order is already at the first stage.');
  const to = prev as string;
  const reason = field(form, 'reason', 300);
  const note = makeNote(user.name, `Moved back from "${ORDER_LABELS[o.status]}" to "${ORDER_LABELS[to]}"${reason ? `: ${reason}` : '.'}`);
  await orders().update(o.id, {
    status: to,
    notes: note ? [...o.notes, note] : o.notes,
    history: [...(o.history ?? []), { at: now(), by: user.name, from: o.status, to, back: true }],
  });
  await audit(user.username, 'order_status', o.code, `${o.status} -> ${to} (back)`);
  flash(here(id), 'ok', `${o.code} moved back to "${ORDER_LABELS[to]}".`);
}

export async function addOrderNote(id: string, form: FormData): Promise<void> {
  const { user, o } = await load(id);
  const note = makeNote(user.name, form.get('note'));
  if (!note) flash(here(id), 'err', 'Write a note of up to 1000 characters.');
  await orders().update(o.id, { notes: [...o.notes, note as NonNullable<typeof note>] });
  flash(here(id), 'ok', 'Note added.');
}

export async function editOrder(id: string, form: FormData): Promise<void> {
  const { user, o } = await load(id);
  const name = clean(form.get('name'), 80);
  const phone = phone91(clean(form.get('phone'), 30));
  const address = clean(form.get('address'), 300, true);
  const orderNote = clean(form.get('order_note'), 600, true);
  const errs: string[] = [];
  if (name.length < 2) errs.push('Enter the customer name.');
  if (phone === null) errs.push('Enter a valid 10-digit mobile number.');
  if (address.length < 8) errs.push('Enter the full delivery address (at least 8 characters).');
  const qtys = form.getAll('qty').map(String);
  const removed: string[] = [];
  const items: Order['items'] = [];
  o.items.forEach((it, i) => {
    const q = qtys[i] === undefined ? it.qty : Math.trunc(Number(qtys[i]));
    if (!Number.isFinite(q) || q < 0 || q > 100_000) { errs.push('Quantity must be between 0 and 100,000.'); return; }
    if (q === 0) { removed.push(it.name); return; }
    items.push({ ...it, qty: q });
  });
  if (items.length === 0) errs.push('An order needs at least one product. Delete the order instead.');
  if (errs.length > 0 || phone === null) flash(here(id), 'err', [...new Set(errs)].join(' '), 'edit');
  const changes: string[] = [];
  if (name !== o.name) changes.push('name');
  if (phone !== o.phone) changes.push('mobile');
  if (address !== (o.address ?? '')) changes.push('address');
  if (orderNote !== (o.note ?? '')) changes.push('customer note');
  if (JSON.stringify(items) !== JSON.stringify(o.items)) changes.push(`items${removed.length ? ` (removed: ${removed.join(', ')})` : ''}`);
  if (changes.length === 0) flash(here(id), 'ok', 'Nothing changed.');
  const n = makeNote(user.name, `Edited by admin: ${changes.join(', ')}.`);
  await orders().update(o.id, { name, phone: phone as string, address, note: orderNote, items, notes: n ? [...o.notes, n] : o.notes });
  await audit(user.username, 'order_edit', o.code, changes.join(', '));
  flash(here(id), 'ok', `${o.code} updated (${changes.join(', ')}).`);
}

/** Generate the document and keep it on the order. Nothing is sent: the admin downloads it and sends it from WhatsApp. */
export async function prepareDoc(id: string, form: FormData): Promise<void> {
  const { user, o } = await load(id);
  const doc = pdfFromForm(form);
  if ('error' in doc) flash(here(id), 'err', doc.error, 'pdfs');
  const d = doc as Exclude<typeof doc, { error: string }>;
  const label = d.type === 'invoice' ? 'GST invoice' : 'proforma invoice';
  const no = d.no !== '' ? d.no : await nextDocNo(d.type);
  const payload = d.type === 'invoice' ? { ...d.payload, invoice_no: no } : d.payload;
  const first = d.payload.customer.name.split(' ')[0] ?? '';
  const caption = `Hello ${first}, please find your ${d.type === 'invoice' ? 'GST Invoice' : 'Proforma Invoice'} ${no} attached for enquiry ${o.code}.\n- Alok Plastics`;
  const entry: PdfEntry = { type: d.type, no, date: d.date, created_at: now(), to: d.payload.customer.phone, caption, payload };
  const note = makeNote(user.name, `${label.charAt(0).toUpperCase()}${label.slice(1)} ${no} generated for +${d.payload.customer.phone} (sent manually from WhatsApp).`);
  const pdfs = [...(o.pdfs ?? []), entry];
  await orders().update(o.id, { pdfs, notes: note ? [...o.notes, note] : o.notes, ...(d.type === 'invoice' && !o.invoice_no ? { invoice_no: no } : {}) });
  await audit(user.username, 'order_pdf', o.code, `${label} ${no} generated`);
  revalidatePath(here(id));
  redirect(`${here(id)}?ok=${encodeURIComponent(`${label} ${no} generated. Download it and send from WhatsApp.`)}&got=${pdfs.length - 1}#pdfs`);
}

export async function deleteOrder(id: string): Promise<void> {
  const { user, o } = await load(id);
  await orders().delete(o.id);
  await audit(user.username, 'order_delete', o.code, `${o.name} - ${o.status}`);
  flash('/admin/orders/', 'ok', `${o.code} was permanently deleted.`);
}
