import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Badge, Card, DeleteBox, Flash, Notes } from '@/components/admin/ui';
import { requireAdmin } from '@/server/admin-auth';
import { rupees } from '@/server/admin-util';
import type { Doc, Order } from '@/server/collection';
import { getOrder, pdfDefaults } from '@/server/orders-admin';
import { fmtDateTime, nextStatus, ORDER_LABELS, prevStatus, stageMessage } from '@/server/shop';
import { addOrderNote, advanceOrder, backOrder, cancelOrder, deleteOrder, editOrder, prepareDoc } from './actions';

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ok?: string; err?: string; pdf?: string; got?: string }>;
};

/** Extra fields the next stage asks for. */
function StageFields({ next }: { next: string }) {
  if (next === 'quoted') {
    return (
      <>
        <label>Quote amount (Rs.)<input type="text" name="quote_amount" inputMode="decimal" /></label>
        <label>Note to customer<input type="text" name="quote_note" maxLength={300} /></label>
      </>
    );
  }
  if (next === 'paid') {
    return (
      <>
        <label>Amount received (Rs.) *<input type="text" name="pay_amount" inputMode="decimal" required /></label>
        <label>Mode<input type="text" name="pay_mode" maxLength={30} placeholder="UPI / bank transfer / cash" /></label>
        <label>Reference<input type="text" name="pay_ref" maxLength={80} /></label>
      </>
    );
  }
  if (next === 'dispatched') {
    return (
      <>
        <label>Transporter<input type="text" name="transporter" maxLength={80} /></label>
        <label>LR / tracking no.<input type="text" name="lr_no" maxLength={60} /></label>
      </>
    );
  }
  return null;
}

function PdfForm({ id, title, d }: { id: string; title: string; d: Awaited<ReturnType<typeof pdfDefaults>> }) {
  const rows = [...d.items, ...Array.from({ length: 3 }, () => ({ name: '', hsn: '', qty: 0, unit: 'pcs', price: null as number | null }))];
  return (
    <form action={prepareDoc.bind(null, id)} className="adm-form">
      <h3>{title}</h3>
      <input type="hidden" name="type" value={d.type} />
      <div className="adm-row">
        <label>Document no. (blank = next number)<input type="text" name="doc_no" defaultValue={d.no} maxLength={40} /></label>
        <label>Date (dd-mm-yyyy)<input type="text" name="doc_date" defaultValue={d.date} maxLength={10} /></label>
        <label>GST type
          <select name="mode" defaultValue={d.mode}>
            <option value="ut">UTGST + CGST (Union Territory)</option>
            <option value="intra">SGST + CGST (same state)</option>
            <option value="inter">IGST (other state)</option>
          </select>
        </label>
        <label>GST %<input type="text" name="rate" defaultValue={String(d.rate)} inputMode="decimal" /></label>
      </div>
      <div className="adm-row">
        <label>Customer name<input type="text" name="c_name" defaultValue={d.customer.name} maxLength={80} required /></label>
        <label>WhatsApp no.<input type="text" name="c_phone" defaultValue={d.customer.phone} maxLength={30} required /></label>
        <label>State<input type="text" name="c_state" defaultValue={d.customer.state} maxLength={40} /></label>
        <label>Party GSTIN<input type="text" name="c_gstin" defaultValue={d.customer.gstin} maxLength={15} /></label>
      </div>
      <label>Address<textarea name="c_address" defaultValue={d.customer.address} maxLength={300} rows={2} /></label>
      <div className="adm-tablewrap">
        <table>
          <thead><tr><th>Description</th><th>HSN</th><th>Qty</th><th>Unit</th><th>Price (blank = on request)</th></tr></thead>
          <tbody>
            {rows.map((it, i) => (
              <tr key={i}>
                <td><input type="text" name="it_name" defaultValue={it.name} maxLength={160} /></td>
                <td><input type="text" name="it_hsn" defaultValue={it.hsn} maxLength={12} style={{ width: 90 }} /></td>
                <td><input type="text" name="it_qty" defaultValue={it.qty ? String(it.qty) : ''} inputMode="decimal" style={{ width: 80 }} /></td>
                <td><input type="text" name="it_unit" defaultValue={it.unit} maxLength={12} style={{ width: 70 }} /></td>
                <td><input type="text" name="it_price" defaultValue={it.price === null ? '' : String(it.price)} inputMode="decimal" style={{ width: 110 }} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="adm-row">
        <label>Transporter<input type="text" name="t_transporter" defaultValue={d.transport.transporter} maxLength={60} /></label>
        <label>G.R. no.<input type="text" name="t_gr_no" defaultValue={d.transport.gr_no} maxLength={40} /></label>
        <label>G.R. date<input type="text" name="t_gr_dt" defaultValue={d.transport.gr_dt} maxLength={20} /></label>
      </div>
      <label>Note on the document<textarea name="note" defaultValue={d.note} maxLength={300} rows={2} /></label>
      <p><button className="adm-btn" type="submit">Generate PDF</button></p>
    </form>
  );
}

export default async function OrderPage({ params, searchParams }: Props) {
  await requireAdmin();
  const { id } = await params;
  const sp = await searchParams;
  const o: Doc<Order> | null = await getOrder(id);
  if (!o) notFound();

  const next = nextStatus(o.status);
  const prev = prevStatus(o);
  const finished = ['closed', 'cancelled'].includes(o.status);
  const wa = `https://wa.me/${o.phone}?text=${encodeURIComponent(stageMessage(o))}`;
  const pick = sp.pdf ?? '';
  let pdfForm: Awaited<ReturnType<typeof pdfDefaults>> | null = null;
  let pdfTitle = '';
  if (pick === 'new' || pick === 'inv') {
    pdfForm = await pdfDefaults(o, pick === 'inv' ? 'invoice' : 'proforma');
    pdfTitle = pick === 'inv' ? 'New GST invoice' : 'New proforma invoice';
  } else if (/^\d+$/.test(pick) && o.pdfs?.[Number(pick)]) {
    const e = o.pdfs[Number(pick)]!;
    pdfForm = { type: e.type, no: e.no, date: e.date, ...e.payload };
    pdfTitle = `Edit & regenerate ${e.no}`;
  }

  const details: [string, string][] = [
    ['Placed', fmtDateTime(o.created_at)],
    ['Customer', o.name],
    ['Mobile', `+${o.phone}${o.verified ? '' : ' (not verified)'}`],
    ['Address', o.address || '-'],
    ['Customer note', o.note || '-'],
    ['Estimated total', rupees(o.total)],
  ];
  const stage: [string, string][] = [];
  if (o.quote_amount != null || o.quote_note) stage.push(['Quote', `${rupees(o.quote_amount)}${o.quote_note ? ` - ${o.quote_note}` : ''}`]);
  if (o.pay_amount != null) stage.push(['Payment', `${rupees(o.pay_amount)} ${[o.pay_mode, o.pay_ref].filter(Boolean).join(' / ')}`]);
  if (o.transporter || o.lr_no) stage.push(['Dispatch', [o.transporter, o.lr_no && `LR ${o.lr_no}`].filter(Boolean).join(' / ')]);
  if (o.invoice_no) stage.push(['Invoice no.', o.invoice_no]);
  if (o.cancel_reason) stage.push(['Cancelled because', o.cancel_reason]);

  return (
    <>
      <p><Link href="/admin/orders/">&larr; All orders</Link></p>
      <h1>{o.code} <Badge s={o.status} label={ORDER_LABELS[o.status] ?? o.status} /></h1>
      <p className="sub">{o.name} &middot; {fmtDateTime(o.created_at)}</p>
      <Flash ok={sp.ok} err={sp.err} />
      <div className="adm-cols">
        <div>
          <Card title="Order">
            <dl className="adm-dl">
              {details.map(([k, v]) => (<div key={k} style={{ display: 'contents' }}><dt>{k}</dt><dd>{v}</dd></div>))}
              {stage.map(([k, v]) => (<div key={k} style={{ display: 'contents' }}><dt>{k}</dt><dd>{v}</dd></div>))}
            </dl>
            <div className="adm-tablewrap" style={{ marginTop: 14 }}>
              <table>
                <thead><tr><th>#</th><th>Product</th><th>Qty</th><th>Price</th></tr></thead>
                <tbody>
                  {o.items.map((it, i) => (
                    <tr key={i}>
                      <td>{i + 1}</td>
                      <td>{it.name}{it.variant ? <><br /><small>{it.variant}</small></> : null}</td>
                      <td>{it.qty} {it.unit}</td>
                      <td>{it.price === null ? 'On request' : rupees(it.price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <details id="edit" open={Boolean(sp.err)} style={{ marginTop: 14 }}>
              <summary>Edit customer details or quantities</summary>
              <form action={editOrder.bind(null, id)} className="adm-form">
                <div className="adm-row">
                  <label>Name<input type="text" name="name" defaultValue={o.name} maxLength={80} required /></label>
                  <label>Mobile<input type="text" name="phone" defaultValue={o.phone} maxLength={30} required /></label>
                </div>
                <label>Address<textarea name="address" defaultValue={o.address} maxLength={300} rows={2} required /></label>
                <label>Customer note<textarea name="order_note" defaultValue={o.note} maxLength={600} rows={2} /></label>
                {o.items.map((it, i) => (
                  <label key={i}>{it.name} - quantity (0 removes it)<input type="text" name="qty" defaultValue={String(it.qty)} inputMode="numeric" style={{ width: 120 }} /></label>
                ))}
                <p><button className="adm-btn" type="submit">Save changes</button></p>
              </form>
            </details>
          </Card>

          <Card title="Documents (proforma / GST invoice)" id="pdfs">
            {sp.got !== undefined && o.pdfs?.[Number(sp.got)] ? (
              <p><a className="adm-btn" href={`/admin/orders/${id}/pdf/?n=${Number(sp.got)}&dl=1`}>Download {o.pdfs[Number(sp.got)]!.no}</a></p>
            ) : null}
            {(o.pdfs ?? []).length === 0 ? <p className="adm-empty" style={{ padding: 0 }}>No documents yet.</p> : (
              <ul className="adm-list">
                {(o.pdfs ?? []).map((p, i) => (
                  <li key={i}>
                    <strong>{p.type === 'invoice' ? 'GST invoice' : 'Proforma'} {p.no}</strong> &middot; {p.date}{' '}
                    <a href={`/admin/orders/${id}/pdf/?n=${i}`} target="_blank" rel="noreferrer">View</a>{' | '}
                    <a href={`/admin/orders/${id}/pdf/?n=${i}&dl=1`}>Download</a>{' | '}
                    <Link href={`/admin/orders/${id}/?pdf=${i}#pdfs`}>Edit</Link>
                  </li>
                ))}
              </ul>
            )}
            <p>
              <Link className="adm-btn ghost" href={`/admin/orders/${id}/?pdf=new#pdfs`}>New proforma</Link>{' '}
              <Link className="adm-btn ghost" href={`/admin/orders/${id}/?pdf=inv#pdfs`}>New GST invoice</Link>
            </p>
            {pdfForm ? <PdfForm id={id} title={pdfTitle} d={pdfForm} /> : null}
          </Card>

          <Card title="Notes">
            <Notes notes={o.notes} />
            <form action={addOrderNote.bind(null, id)}>
              <textarea name="note" maxLength={1000} placeholder="Add a note" aria-label="Note" required />
              <p><button className="adm-btn" type="submit">Add note</button></p>
            </form>
          </Card>

          {(o.history ?? []).length > 0 ? (
            <Card title="History">
              <ul className="adm-list">
                {[...(o.history ?? [])].reverse().map((h, i) => (
                  <li key={i}>{fmtDateTime(h.at)} &middot; {h.by}: {ORDER_LABELS[h.from] ?? h.from} &rarr; {ORDER_LABELS[h.to] ?? h.to}{h.back ? ' (moved back)' : ''}</li>
                ))}
              </ul>
            </Card>
          ) : null}
        </div>

        <div>
          <Card title="Next step">
            <p><a className="adm-btn" href={wa} target="_blank" rel="noreferrer">Open in WhatsApp</a></p>
            <p className="sub" style={{ margin: '0 0 12px' }}>Opens a chat with the message for this stage. Nothing is sent automatically.</p>
            {next && !finished ? (
              <form action={advanceOrder.bind(null, id)} className="adm-form">
                <p><strong>Move to: {ORDER_LABELS[next]}</strong></p>
                <StageFields next={next} />
                <label>Internal note (optional)<input type="text" name="note" maxLength={1000} /></label>
                <p><button className="adm-btn" type="submit">Move to &ldquo;{ORDER_LABELS[next]}&rdquo;</button></p>
              </form>
            ) : <p className="sub">This order is {ORDER_LABELS[o.status]?.toLowerCase()}.</p>}
            {prev ? (
              <details style={{ marginTop: 10 }}>
                <summary>Move back to &ldquo;{ORDER_LABELS[prev]}&rdquo;</summary>
                <form action={backOrder.bind(null, id)} className="adm-form">
                  <label>Reason (optional)<input type="text" name="reason" maxLength={300} /></label>
                  <button className="adm-btn ghost" type="submit">Move back</button>
                </form>
              </details>
            ) : null}
            {!finished ? (
              <details style={{ marginTop: 10 }}>
                <summary>Cancel this order</summary>
                <form action={cancelOrder.bind(null, id)} className="adm-form">
                  <label>Reason *<input type="text" name="reason" maxLength={300} required /></label>
                  <button className="adm-btn danger" type="submit">Cancel order</button>
                </form>
              </details>
            ) : null}
          </Card>
          <Card title="Danger zone">
            <DeleteBox label="Delete this order" action={deleteOrder.bind(null, id)}>
              <p>This permanently removes {o.code}, its notes and documents.</p>
            </DeleteBox>
          </Card>
        </div>
      </div>
    </>
  );
}
