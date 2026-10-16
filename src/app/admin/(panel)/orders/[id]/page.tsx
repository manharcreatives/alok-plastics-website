import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireAdmin } from '@/server/admin-auth';
import { rupees } from '@/server/admin-util';
import type { Doc, Order } from '@/server/collection';
import { getOrder, pdfDefaults } from '@/server/orders-admin';
import { fmtDateTime, nextStatus, ORDER_LABELS, prevStatus, stageMessage } from '@/server/shop';
import { Flash, Icon, NoteTimeline, ORDER_TONES, PageHead, ToneBadge } from '@/components/admin/ui';
import { addOrderNote, advanceOrder, backOrder, cancelOrder, editOrder, prepareDoc } from './actions';

export const metadata = { title: 'Order' };

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ok?: string; err?: string; pdf?: string; got?: string }>;
};

const FLOW = ['pending', 'reviewing', 'quoted', 'confirmed', 'paid', 'dispatched', 'invoiced', 'closed'];

function StageFields({ next }: { next: string }) {
  if (next === 'quoted') {
    return (
      <>
        <div className="field"><label htmlFor="quote_amount">Quoted amount, Rs. (optional)</label><input id="quote_amount" name="quote_amount" type="number" min="0" step="0.01" inputMode="decimal" /></div>
        <div className="field"><label htmlFor="quote_note">Quote note (optional)</label><input id="quote_note" name="quote_note" type="text" maxLength={300} placeholder="e.g. Valid for 7 days, freight extra" /></div>
      </>
    );
  }
  if (next === 'paid') {
    return (
      <>
        <div className="field"><label htmlFor="pay_amount">Amount received, Rs. *</label><input id="pay_amount" name="pay_amount" type="number" min="0" step="0.01" inputMode="decimal" required /></div>
        <div className="field"><label htmlFor="pay_mode">Mode</label>
          <select id="pay_mode" name="pay_mode"><option>NEFT / RTGS</option><option>UPI</option><option>Cheque</option><option>Cash</option></select></div>
        <div className="field"><label htmlFor="pay_ref">UTR / reference (optional)</label><input id="pay_ref" name="pay_ref" type="text" maxLength={80} /></div>
      </>
    );
  }
  if (next === 'dispatched') {
    return (
      <>
        <div className="field"><label htmlFor="transporter">Transporter (optional)</label><input id="transporter" name="transporter" type="text" maxLength={80} /></div>
        <div className="field"><label htmlFor="lr_no">LR / tracking no. (optional)</label><input id="lr_no" name="lr_no" type="text" maxLength={60} /></div>
      </>
    );
  }
  if (next === 'invoiced') return <p className="meta">A gapless GST invoice number (financial-year series) is generated when you continue.</p>;
  return null;
}

function PdfForm({ id, title, d, o }: { id: string; title: string; d: Awaited<ReturnType<typeof pdfDefaults>>; o: Doc<Order> }) {
  const rows = [...d.items, { name: '', hsn: '', qty: 0, unit: '', price: null as number | null }, { name: '', hsn: '', qty: 0, unit: '', price: null as number | null }];
  const c = d.customer;
  const t = d.transport;
  return (
    <form className="pdf-form" id="pdf-form" action={prepareDoc.bind(null, id)} data-pdf-form="">
      <h3 className="pdf-sec">{title}</h3>
      <div className="pdf-grid">
        <div className="field"><label htmlFor="pf-type">Document</label>
          <select id="pf-type" name="type" defaultValue={d.type} data-pdf-type=""><option value="proforma">Proforma invoice</option><option value="invoice">GST invoice</option></select></div>
        <div className="field"><label htmlFor="pf-no">Document no.</label><input id="pf-no" name="doc_no" type="text" maxLength={40} defaultValue={d.no} placeholder="Auto" /></div>
        <div className="field"><label htmlFor="pf-date">Date</label><input id="pf-date" name="doc_date" type="text" maxLength={10} pattern="\d{2}-\d{2}-\d{4}" placeholder="DD-MM-YYYY" defaultValue={d.date} /></div>
        <div className="field" data-pdf-only="invoice"><label htmlFor="pf-mode">Sale type</label>
          <select id="pf-mode" name="mode" defaultValue={d.mode}>
            <option value="ut">UT (UTGST + CGST)</option><option value="intra">Same state (SGST + CGST)</option><option value="inter">Other state (IGST)</option>
          </select></div>
        <div className="field" data-pdf-only="invoice"><label htmlFor="pf-rate">GST %</label><input id="pf-rate" name="rate" type="number" min="0" max="40" step="0.5" defaultValue={d.rate} /></div>
      </div>

      <h3 className="pdf-sec">Bill to</h3>
      <div className="pdf-grid">
        <div className="field"><label htmlFor="pf-cname">Customer name</label><input id="pf-cname" name="c_name" type="text" maxLength={80} required defaultValue={c.name} /></div>
        <div className="field"><label htmlFor="pf-cphone">WhatsApp number</label><input id="pf-cphone" name="c_phone" type="tel" inputMode="tel" maxLength={30} required defaultValue={c.phone.replace(/^\+?91(?=\d{10}$)/, '')} /></div>
        <div className="field"><label htmlFor="pf-cstate">State</label><input id="pf-cstate" name="c_state" type="text" maxLength={40} defaultValue={c.state} /></div>
        <div className="field" data-pdf-only="invoice"><label htmlFor="pf-cgstin">Party GSTIN</label><input id="pf-cgstin" name="c_gstin" type="text" maxLength={15} defaultValue={c.gstin} /></div>
        <div className="field pdf-wide"><label htmlFor="pf-caddr">Address</label><textarea id="pf-caddr" name="c_address" rows={2} maxLength={300} defaultValue={c.address} /></div>
      </div>

      <div data-pdf-only="invoice">
        <h3 className="pdf-sec">Transport</h3>
        <div className="pdf-grid">
          <div className="field"><label htmlFor="pf-ttr">Transporter</label><input id="pf-ttr" name="t_transporter" type="text" maxLength={60} defaultValue={t.transporter} /></div>
          <div className="field"><label htmlFor="pf-tgr">G.R. no.</label><input id="pf-tgr" name="t_gr_no" type="text" maxLength={40} defaultValue={t.gr_no} /></div>
          <div className="field"><label htmlFor="pf-tdt">G.R. date</label><input id="pf-tdt" name="t_gr_dt" type="text" maxLength={20} defaultValue={t.gr_dt} /></div>
        </div>
      </div>

      <h3 className="pdf-sec">Items <span className="meta">Leave the price blank to print &quot;On request&quot;.</span></h3>
      <div className="pdf-lines">
        {rows.map((r, i) => (
          <div className="pdf-line" key={i}>
            <div className="pdf-desc"><input name="it_name" type="text" maxLength={160} placeholder="Description of goods" aria-label="Description" defaultValue={r.name} /><span className="pdf-rm" /></div>
            <input name="it_hsn" type="text" maxLength={12} placeholder="HSN" aria-label="HSN code" defaultValue={r.hsn} />
            <input name="it_qty" type="number" min="0" step="any" placeholder="Qty" aria-label="Quantity" defaultValue={r.qty ? r.qty : ''} />
            <input name="it_unit" type="text" maxLength={12} placeholder="Unit" aria-label="Unit" defaultValue={r.unit} />
            <input name="it_price" type="number" min="0" step="0.01" placeholder="Price" aria-label="Price per unit" defaultValue={r.price === null ? '' : r.price} />
          </div>
        ))}
      </div>

      <div className="field"><label htmlFor="pf-note">Note on the PDF (optional)</label><textarea id="pf-note" name="note" rows={2} maxLength={300} defaultValue={d.note} /></div>
      <p className="actions">
        <button className="btn btn-wa" type="submit"><Icon name="download" />Generate PDF &amp; Download</button>
        <a className="btn btn-secondary" href={`https://wa.me/${c.phone || o.phone}`} target="_blank" rel="noopener noreferrer"><Icon name="chat" />Open WhatsApp chat</a>
        <Link className="btn btn-quiet" href={`/admin/orders/${id}/#pdfs`}>Cancel</Link>
      </p>
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
  const waText = stageMessage(o);
  const wa = `https://wa.me/${o.phone}?text=${encodeURIComponent(waText)}`;
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

  const facts: [string, string][] = [];
  if (o.quote_amount != null) facts.push(['Quote', `${rupees(o.quote_amount)}${o.quote_note ? ` · ${o.quote_note}` : ''}`]);
  if (o.pay_amount != null) facts.push(['Payment', `${rupees(o.pay_amount)} · ${o.pay_mode ?? ''}${o.pay_ref ? ` · ref ${o.pay_ref}` : ''}`]);
  if (o.lr_no || o.transporter) facts.push(['Dispatch', `${o.transporter ?? ''} · LR ${o.lr_no ?? ''}`.replace(/^ · /, '').replace(/ · LR $/, '')]);
  if (o.invoice_no) facts.push(['GST invoice', o.invoice_no]);

  const at: Record<string, number> = {};
  for (const h of o.history ?? []) at[h.to] = h.at;
  const curIdx = FLOW.indexOf(o.status);

  return (
    <>
      <PageHead
        title={`Enquiry ${o.code}`}
        crumbs={[['Dashboard', '/admin/'], ['Orders', '/admin/orders/'], [o.code, null]]}
        lead={`Received ${fmtDateTime(o.created_at)}`}
        extra={<> <ToneBadge tone={ORDER_TONES[o.status] ?? 'tone-muted'}>{ORDER_LABELS[o.status] ?? o.status}</ToneBadge></>}
      />
      <Flash ok={sp.ok} err={sp.err} />

      <div className="detail">
        <div className="detail-main">
          <section className="card" aria-labelledby="h-items">
            <div className="card-head"><h2 className="card-title" id="h-items">Items</h2><span className="card-sub">{o.items.length} {o.items.length === 1 ? 'line' : 'lines'}</span></div>
            <div className="table-wrap">
              <table className="table">
                <thead><tr><th scope="col">Product</th><th scope="col">Quantity</th><th scope="col">Unit price</th></tr></thead>
                <tbody>
                  {o.items.map((it, i) => (
                    <tr key={i}>
                      <td><span className="cell-main">{it.name}</span>{it.variant ? <span className="cell-sub">{it.variant}</span> : null}</td>
                      <td className="nowrap">{it.qty.toLocaleString('en-IN')} {it.unit}</td>
                      <td className="nowrap">{it.price !== null ? `Rs. ${Math.round(it.price).toLocaleString('en-IN')}` : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {o.total !== null ? <p className="meta">Estimated total: Rs. {Math.round(o.total).toLocaleString('en-IN')} (catalogue prices, before taxes and freight)</p> : null}
            {o.note ? <p className="msg" style={{ whiteSpace: 'pre-wrap' }}>{o.note}</p> : null}
          </section>

          <section className="card" aria-labelledby="h-stage">
            <div className="card-head"><h2 className="card-title" id="h-stage">Progress</h2><span className="card-sub">{ORDER_LABELS[o.status] ?? o.status}</span></div>
            <ol className="timeline">
              {FLOW.map((st, i) => {
                const done = curIdx >= 0 && i <= curIdx;
                const when = !done ? 0 : st === 'pending' ? o.created_at : at[st] ?? 0;
                return (
                  <li key={st}>
                    <span className="tl-meta">{when ? fmtDateTime(when) : done ? '' : 'Not yet'}</span>
                    <span className="tl-text">{done ? '✔ ' : '○ '}{ORDER_LABELS[st]}</span>
                  </li>
                );
              })}
              {o.status === 'cancelled' ? <li><span className="tl-meta">Cancelled</span><span className="tl-text">{o.cancel_reason ?? ''}</span></li> : null}
            </ol>
            {prev ? (
              <details className="step-back">
                <summary className="meta">Go back to &quot;{ORDER_LABELS[prev]}&quot;</summary>
                <form action={backOrder.bind(null, id)} data-confirm={`Move this order back to "${ORDER_LABELS[prev]}"? The customer is not messaged.`}>
                  <div className="field"><label htmlFor="back-reason">Reason (optional)</label><input id="back-reason" name="reason" type="text" maxLength={300} placeholder="e.g. Moved by mistake" /></div>
                  <button className="btn btn-secondary" type="submit">Move back to &quot;{ORDER_LABELS[prev]}&quot;</button>
                </form>
              </details>
            ) : null}
            {facts.length > 0 ? <dl className="dl">{facts.map(([k, v]) => <><dt key={`t${k}`}>{k}</dt><dd key={`d${k}`}>{v}</dd></>)}</dl> : null}
          </section>

          {next !== null && o.status !== 'cancelled' ? (
            <>
              <section className="card" aria-labelledby="h-next">
                <div className="card-head"><h2 className="card-title" id="h-next">Next step: {ORDER_LABELS[next]}</h2><span className="card-sub">Moves the order forward and logs it</span></div>
                <form action={advanceOrder.bind(null, id)}>
                  <StageFields next={next} />
                  <div className="field"><label htmlFor="status-note">Internal note (optional)</label><textarea id="status-note" name="note" rows={2} maxLength={1000} /></div>
                  <button className="btn btn-primary" type="submit">Mark as &quot;{ORDER_LABELS[next]}&quot;</button>
                </form>
                <details>
                  <summary className="meta">Cancel this enquiry</summary>
                  <form action={cancelOrder.bind(null, id)}>
                    <div className="field"><label htmlFor="reason">Reason *</label><input id="reason" name="reason" type="text" maxLength={300} required /></div>
                    <button className="btn btn-secondary" type="submit">Cancel enquiry</button>
                  </form>
                </details>
              </section>

              <section className="card" aria-labelledby="h-msg">
                <div className="card-head"><h2 className="card-title" id="h-msg">Message the customer</h2><span className="card-sub">Edit the text, then send it yourself from WhatsApp</span></div>
                <label htmlFor="wa-text" className="sr-only">Message</label>
                <textarea id="wa-text" rows={5} maxLength={1000} defaultValue={waText} />
                <p className="actions">
                  <a className="btn btn-wa" id="wa-open" data-wa-link="wa-text" href={wa} target="_blank" rel="noopener noreferrer"><Icon name="chat" />Open in WhatsApp</a>
                </p>
              </section>
            </>
          ) : null}

          <section className="card" id="pdfs" aria-labelledby="h-pdfs">
            <div className="card-head"><h2 className="card-title" id="h-pdfs">Proforma &amp; GST invoices</h2><span className="card-sub">Generate, download, then send from WhatsApp</span></div>
            {(o.pdfs ?? []).length === 0 ? (
              <p className="empty">No PDF has been generated for this order yet.</p>
            ) : (
              <ul className="pdf-list">
                {(o.pdfs ?? []).map((p, n) => ({ p, n })).reverse().map(({ p, n }) => (
                  <li className="pdf-item" key={n}>
                    <div className="pdf-head">
                      <span className={`badge ${p.type === 'invoice' ? 'tone-brand' : 'tone-info'}`}>{p.type === 'invoice' ? 'GST Invoice' : 'Proforma'}</span>
                      <strong className="pdf-no">{p.no}</strong>
                    </div>
                    <p className="meta">{p.date} · generated for +{p.to} · {fmtDateTime(p.created_at)}</p>
                    <p className="actions">
                      <a className="btn btn-secondary btn-sm" href={`/admin/orders/${id}/pdf/?n=${n}`} target="_blank" rel="noopener"><Icon name="eye" />View</a>
                      <a className="btn btn-secondary btn-sm" href={`/admin/orders/${id}/pdf/?n=${n}&dl=1`}><Icon name="download" />Download</a>
                      <Link className="btn btn-secondary btn-sm" href={`/admin/orders/${id}/?pdf=${n}#pdf-form`}><Icon name="file" />Edit &amp; Regenerate</Link>
                      <a className="btn btn-wa btn-sm" href={`https://wa.me/${p.to || o.phone}`} target="_blank" rel="noopener noreferrer"><Icon name="chat" />Open WhatsApp chat</a>
                      {sp.got !== undefined && Number(sp.got) === n ? <a hidden data-autodownload="" href={`/admin/orders/${id}/pdf/?n=${n}&dl=1`}>Download</a> : null}
                    </p>
                  </li>
                ))}
              </ul>
            )}
            {pdfForm === null ? (
              <p className="actions">
                <Link className="btn btn-primary" href={`/admin/orders/${id}/?pdf=new#pdf-form`}><Icon name="plus" />New proforma</Link>
                <Link className="btn btn-secondary" href={`/admin/orders/${id}/?pdf=inv#pdf-form`}><Icon name="plus" />New GST invoice</Link>
              </p>
            ) : <PdfForm id={id} title={pdfTitle} d={pdfForm} o={o} />}
          </section>

          {next !== null && o.status !== 'cancelled' ? (
            <>
              <section className="card" aria-labelledby="h-notes">
                <div className="card-head"><h2 className="card-title" id="h-notes">Internal notes</h2><span className="card-sub">Never shown to the customer</span></div>
                {o.notes.length === 0 ? <p className="empty">No notes yet.</p> : <NoteTimeline notes={o.notes} fmt={fmtDateTime} />}
                <form action={addOrderNote.bind(null, id)}>
                  <div className="field"><label htmlFor="note">Add a note</label><textarea id="note" name="note" rows={3} maxLength={1000} required /></div>
                  <button className="btn btn-primary" type="submit"><Icon name="plus" />Save note</button>
                </form>
              </section>

              <section className="card" id="edit" aria-labelledby="h-edit">
                <div className="card-head"><h2 className="card-title" id="h-edit">Edit details</h2><span className="card-sub">Fix a typo, address or quantity. Logged in the notes.</span></div>
                <form action={editOrder.bind(null, id)}>
                  <div className="form-grid">
                    <div className="field"><label htmlFor="ed-name">Customer name</label><input id="ed-name" name="name" type="text" maxLength={80} required defaultValue={o.name} /></div>
                    <div className="field"><label htmlFor="ed-phone">Mobile</label><input id="ed-phone" name="phone" type="tel" inputMode="tel" maxLength={30} required defaultValue={o.phone.replace(/^91/, '')} /></div>
                    <div className="field field-wide"><label htmlFor="ed-address">Delivery address</label><textarea id="ed-address" name="address" rows={3} maxLength={300} required defaultValue={o.address} /></div>
                    <div className="field field-wide"><label htmlFor="ed-note">Customer&apos;s note</label><textarea id="ed-note" name="order_note" rows={2} maxLength={600} defaultValue={o.note} /></div>
                  </div>
                  <div className="table-wrap">
                    <table className="table">
                      <thead><tr><th scope="col">Product</th><th scope="col">Quantity <span className="meta">(0 removes the line)</span></th></tr></thead>
                      <tbody>
                        {o.items.map((it, i) => (
                          <tr key={i}><td><span className="cell-main">{it.name}</span></td><td><input type="number" name="qty" min="0" max="100000" defaultValue={it.qty} aria-label={`Quantity of ${it.name}`} /></td></tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <button className="btn btn-primary" type="submit"><Icon name="check" />Save changes</button>
                </form>
              </section>

              <section className="card" aria-labelledby="h-danger">
                <div className="card-head"><h2 className="card-title" id="h-danger">Delete this order</h2></div>
                <p className="meta">Wrong or test order? Deleting removes it permanently. To keep a record instead, use &quot;Cancel&quot; above.</p>
                <Link className="btn btn-danger" href={`/admin/orders/${id}/delete/`}><Icon name="trash" />Delete order</Link>
              </section>
            </>
          ) : (
            <section className="card" aria-labelledby="h-danger">
              <div className="card-head"><h2 className="card-title" id="h-danger">Delete this order</h2></div>
              <Link className="btn btn-danger" href={`/admin/orders/${id}/delete/`}><Icon name="trash" />Delete order</Link>
            </section>
          )}
        </div>

        <div className="detail-side">
          <section className="card customer" aria-labelledby="h-who">
            <h2 className="sr-only" id="h-who">Customer</h2>
            <p className="customer-name">{o.name}</p>
            <div className="reach">
              <a className="btn btn-primary" href={`tel:+${o.phone}`}><Icon name="phone" />Call +{o.phone}</a>
              <a className="btn btn-wa" href={wa} target="_blank" rel="noopener noreferrer"><Icon name="chat" />Open chat</a>
            </div>
            <dl className="dl">
              <dt>Mobile</dt><dd>+{o.phone}</dd>
              <dt>Address</dt><dd style={{ whiteSpace: 'pre-wrap' }}>{o.address || '—'}</dd>
              <dt>Received</dt><dd>{fmtDateTime(o.created_at)}</dd>
              <dt>Last updated</dt><dd>{fmtDateTime(o.updated_at)}</dd>
              <dt>IP address</dt><dd>{o.ip || '—'}</dd>
            </dl>
          </section>
        </div>
      </div>
    </>
  );
}
