import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireAdmin } from '@/server/admin-auth';
import { query } from '@/server/db';
import { BUYER_TYPES, STATUS_LABELS, contactLinks, fmtDate, fmtLong, getEnquiry } from '@/server/enquiries';
import { Badge, Icon, PageHead } from '@/components/admin/ui';
import { addNote, assignTo, setStatus, toggleArchive } from './actions';

export const metadata = { title: 'Enquiry' };

type Props = { params: Promise<{ id: string }> };

const PATH = ['new', 'contacted', 'quoted', 'won'] as const;

export default async function EnquiryPage({ params }: Props) {
  await requireAdmin();
  const { id } = await params;
  const r = await getEnquiry(id);
  if (!r) notFound();
  if (!r.seen) await query('update enquiries set seen = 1 where id = $1', [id]);
  const people = (await query<{ name: string }>('select name from admin_users order by name')).map((p) => p.name);
  const links = contactLinks(r);
  const cur = PATH.indexOf(r.status as (typeof PATH)[number]);
  const contact: [string, string][] = [
    ['Email', r.email], ['City', r.city], ['State', r.state], ['GSTIN', r.gstin],
    ['Buyer type', BUYER_TYPES[r.buyer_type] ?? r.buyer_type],
  ];
  const meta = `Received ${fmtLong(r.created_at)} · from ${r.source || 'unknown page'}${r.mail_ok ? '' : ' · email notification failed'}`;

  return (
    <>
      <PageHead
        title={`Enquiry #${r.id}`}
        crumbs={[['Dashboard', '/admin/'], ['Enquiries', '/admin/enquiries/'], [`#${r.id}`, null]]}
        lead={meta}
        extra={<> <Badge s={r.status} label={STATUS_LABELS[r.status]} />{r.archived ? <> <span className="badge badge-archived">Archived</span></> : null}</>}
      />

      <div className="detail">
        <div className="detail-main">
          <section className="card" aria-labelledby="h-track">
            <div className="card-head"><h2 className="card-title" id="h-track">Follow-up status</h2><span className="card-sub">Tap a step to move this enquiry</span></div>
            <form className="stepper-form" action={setStatus.bind(null, id)}>
              <ol className="stepper">
                {PATH.map((k, i) => {
                  const cls = cur === -1 ? '' : i < cur ? 'is-done' : i === cur ? 'is-current' : '';
                  return (
                    <li key={k} className={cls}>
                      <button className="step" type="submit" name="status" value={k} aria-current={cls === 'is-current' ? 'step' : undefined}>
                        <span className="step-dot">{cls === 'is-done' ? <Icon name="check" /> : i + 1}</span>
                        <span>{STATUS_LABELS[k]}</span>
                      </button>
                    </li>
                  );
                })}
              </ol>
              <button className="btn btn-secondary btn-sm step-lost" type="submit" name="status" value="lost" aria-current={r.status === 'lost' ? 'step' : undefined}>{r.status === 'lost' ? 'Marked as lost' : 'Mark as lost'}</button>
            </form>
          </section>

          <section className="card" aria-labelledby="h-what">
            <div className="card-head"><h2 className="card-title" id="h-what">What they need</h2></div>
            <dl className="dl">
              <dt>Product(s)</dt><dd>{r.product || '—'}</dd>
              {r.quantity > 0 ? <><dt>Quantity</dt><dd>{Number(r.quantity).toLocaleString('en-IN')} {r.unit}</dd></> : null}
            </dl>
            {r.message !== '' ? (
              <>
                <h3 className="sr-only">Message</h3>
                <p className="msg" style={{ whiteSpace: 'pre-wrap' }}>{r.message}</p>
              </>
            ) : <p className="meta">No additional message.</p>}
          </section>

          <section className="card" aria-labelledby="h-notes">
            <div className="card-head"><h2 className="card-title" id="h-notes">Internal notes</h2><span className="card-sub">Never shown to the customer</span></div>
            {r.notes.length === 0 ? (
              <p className="empty">No notes yet. Write down what was said so the next person knows.</p>
            ) : (
              <ol className="timeline">
                {[...r.notes].reverse().map((n, i) => (
                  <li key={i}><span className="tl-meta">{fmtDate(n.at)} · <span className="tl-who">{n.by}</span></span><span className="tl-text" style={{ whiteSpace: 'pre-wrap' }}>{n.text}</span></li>
                ))}
              </ol>
            )}
            <form action={addNote.bind(null, id)}>
              <div className="field">
                <label htmlFor="note">Add a note</label>
                <textarea id="note" name="text" rows={3} maxLength={1000} required placeholder="e.g. Called, wants a quote for 5,000 pcs by month end" />
              </div>
              <button className="btn btn-primary" type="submit"><Icon name="plus" />Save note</button>
            </form>
          </section>
        </div>

        <div className="detail-side">
          <section className="card customer" aria-labelledby="h-who">
            <h2 className="sr-only" id="h-who">Customer</h2>
            <p className="customer-name">{r.name}</p>
            <p className="customer-co">{r.company}</p>
            <div className="reach">
              {links.tel ? <a className="btn btn-primary" href={links.tel}><Icon name="phone" />Call {r.phone}</a> : null}
              {links.wa ? <a className="btn btn-wa" href={links.wa} target="_blank" rel="noopener noreferrer"><Icon name="chat" />WhatsApp</a> : null}
              {links.mail ? <a className="btn btn-secondary" href={links.mail}><Icon name="mail" />Email</a> : null}
            </div>
            <p className="help">Opens your phone, WhatsApp or mail app with a short greeting filled in. A 10-digit Indian mobile number is dialled as +91; check the number if the customer is abroad.</p>
            <dl className="dl">
              {r.phone ? <><dt>Phone</dt><dd>{r.phone}</dd></> : null}
              {contact.filter(([, v]) => v).map(([label, v]) => <><dt key={`t${label}`}>{label}</dt><dd key={`d${label}`}>{v}</dd></>)}
            </dl>
          </section>

          <section className="card" aria-labelledby="h-assign">
            <div className="card-head"><h2 className="card-title" id="h-assign">Assigned to</h2></div>
            <form className="inline-form" action={assignTo.bind(null, id)}>
              <div className="field">
                <label className="sr-only" htmlFor="assigned_to">Assigned to</label>
                <select id="assigned_to" name="assigned_to" defaultValue={r.assigned_to} data-autosubmit="quiet">
                  <option value="">Nobody</option>
                  {people.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <button className="btn btn-secondary" type="submit">Assign</button>
            </form>
          </section>

          <section className="card danger-zone" aria-labelledby="h-manage">
            <div className="card-head"><h2 className="card-title" id="h-manage">Tidy up</h2></div>
            <div className="actions">
              <form action={toggleArchive.bind(null, id)}>
                <button className="btn btn-secondary" type="submit">{r.archived ? 'Restore from archive' : 'Archive'}</button>
              </form>
              <Link className="btn btn-danger" href={`/admin/enquiries/${r.id}/delete/`}><Icon name="trash" />Delete…</Link>
            </div>
            <p className="help">Archiving hides it from the main list but keeps it. Deleting cannot be undone.</p>
          </section>
        </div>
      </div>
    </>
  );
}
