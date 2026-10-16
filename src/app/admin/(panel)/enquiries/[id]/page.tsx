import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireAdmin } from '@/server/admin-auth';
import { query } from '@/server/db';
import { STATUSES, fmtDate, getEnquiry } from '@/server/enquiries';
import { addNote, deleteEnquiry, setStatus, toggleArchive } from './actions';

type Props = { params: Promise<{ id: string }> };

export default async function EnquiryPage({ params }: Props) {
  await requireAdmin();
  const { id } = await params;
  const r = await getEnquiry(id);
  if (!r) notFound();
  if (!r.seen) await query('update enquiries set seen = 1 where id = $1', [id]);

  const rows: [string, string][] = [
    ['Received', fmtDate(r.created_at)],
    ['Name', r.name],
    ['Company', r.company],
    ['Phone', r.phone],
    ['Email', r.email || '-'],
    ['City / State', [r.city, r.state].filter(Boolean).join(', ') || '-'],
    ['GSTIN', r.gstin || '-'],
    ['Buyer type', r.buyer_type],
    ['Product', r.product || '-'],
    ['Quantity', r.quantity > 0 ? `${r.quantity} ${r.unit}` : '-'],
    ['Message', r.message || '-'],
    ['Source', r.source || '-'],
    ['Email sent', r.mail_ok ? 'Yes' : 'No'],
  ];

  return (
    <>
      <p><Link href="/admin/enquiries/">&larr; All enquiries</Link></p>
      <h1>{r.name} <span className="adm-badge" data-s={r.status}>{r.status}</span></h1>
      <p className="sub">Enquiry #{r.id}{r.archived ? ' (archived)' : ''}</p>
      <div className="adm-cols">
        <section className="adm-card">
          <h2>Details</h2>
          <dl className="adm-dl">
            {rows.map(([k, v]) => (
              <div key={k} style={{ display: 'contents' }}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
          {r.phone ? <p><a className="adm-btn ghost" href={`tel:${r.phone.replace(/[^\d+]/g, '')}`}>Call</a></p> : null}
        </section>
        <div>
          <section className="adm-card">
            <h2>Status</h2>
            <form action={setStatus.bind(null, id)}>
              <select name="status" defaultValue={r.status} aria-label="Status">
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>{' '}
              <button className="adm-btn" type="submit">Save</button>
            </form>
          </section>
          <section className="adm-card">
            <h2>Notes</h2>
            {r.notes.length === 0 ? <p className="adm-empty" style={{ padding: 0 }}>No notes yet.</p> : null}
            {r.notes.map((n, i) => (
              <div className="adm-note" key={i}>
                <small>{n.by} &middot; {fmtDate(n.at)}</small>
                {n.text}
              </div>
            ))}
            <form action={addNote.bind(null, id)}>
              <textarea name="text" maxLength={1000} placeholder="Add a note" aria-label="Note" required />
              <p><button className="adm-btn" type="submit">Add note</button></p>
            </form>
          </section>
          <section className="adm-card">
            <h2>Actions</h2>
            <form action={toggleArchive.bind(null, id)} style={{ display: 'inline' }}>
              <button className="adm-btn ghost" type="submit">{r.archived ? 'Unarchive' : 'Archive'}</button>
            </form>{' '}
            <details style={{ marginTop: 14 }}>
              <summary>Delete this enquiry&hellip;</summary>
              <form action={deleteEnquiry.bind(null, id)}>
                <p>This permanently removes the enquiry and its notes.</p>
                <button className="adm-btn danger" type="submit">Yes, delete it</button>
              </form>
            </details>
          </section>
        </div>
      </div>
    </>
  );
}
