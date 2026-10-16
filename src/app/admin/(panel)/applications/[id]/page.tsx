import { notFound } from 'next/navigation';
import { APPLICATION_TONES, Flash, Icon, NoteTimeline, PageHead, ToneBadge } from '@/components/admin/ui';
import { requireAdmin } from '@/server/admin-auth';
import { applications } from '@/server/collection';
import { APPLICATION_LABELS, APPLICATION_STATUSES, fmtDateTime } from '@/server/shop';
import { addApplicationNote, deleteApplication, setApplicationStatus } from './actions';

export const metadata = { title: 'Application' };

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ ok?: string; err?: string }> };

export default async function ApplicationPage({ params, searchParams }: Props) {
  await requireAdmin();
  const { id } = await params;
  const sp = await searchParams;
  const a = await applications().find(Number(id));
  if (!a) notFound();
  const digits = a.phone.replace(/\D/g, '');
  const wa = digits ? `https://wa.me/${digits.length === 10 ? `91${digits}` : digits}` : '';

  return (
    <>
      <PageHead
        title={a.name}
        crumbs={[['Dashboard', '/admin/'], ['Applications', '/admin/applications/'], [`#${a.id}`, null]]}
        lead={`Received ${fmtDateTime(a.created_at)}`}
        extra={<> <ToneBadge tone={APPLICATION_TONES[a.status] ?? 'tone-muted'}>{APPLICATION_LABELS[a.status] ?? a.status}</ToneBadge></>}
      />
      <Flash ok={sp.ok} err={sp.err} />

      <div className="detail">
        <div className="detail-main">
          <section className="card" aria-labelledby="h-app">
            <div className="card-head"><h2 className="card-title" id="h-app">Application</h2></div>
            <dl className="dl">
              <dt>Position</dt><dd>{a.position || '—'}</dd>
              <dt>Resume / LinkedIn</dt>
              <dd>
                {a.resume_file ? <><a href={`/admin/applications/${a.id}/resume/`}>{a.resume_name || 'Download resume'}</a> <span className="meta">({Math.max(1, Math.round(a.resume_size / 1024))} KB)</span></> : null}
                {a.resume_link ? <>{a.resume_file ? <br /> : null}<a href={a.resume_link} target="_blank" rel="noopener noreferrer nofollow">{a.resume_link.length > 70 ? `${a.resume_link.slice(0, 69)}…` : a.resume_link}</a></> : null}
                {!a.resume_file && !a.resume_link ? '—' : null}
              </dd>
            </dl>
            {a.message ? <p className="msg" style={{ whiteSpace: 'pre-wrap' }}>{a.message}</p> : <p className="meta">No message.</p>}
          </section>

          <section className="card" aria-labelledby="h-status">
            <div className="card-head"><h2 className="card-title" id="h-status">Status</h2></div>
            <form className="inline-form" action={setApplicationStatus.bind(null, id)}>
              <div className="field">
                <label className="sr-only" htmlFor="status">Status</label>
                <select id="status" name="status" defaultValue={a.status}>
                  {APPLICATION_STATUSES.map((k) => <option key={k} value={k}>{APPLICATION_LABELS[k]}</option>)}
                </select>
              </div>
              <button className="btn btn-secondary" type="submit">Save status</button>
            </form>
          </section>

          <section className="card" aria-labelledby="h-notes">
            <div className="card-head"><h2 className="card-title" id="h-notes">Internal notes</h2></div>
            {a.notes.length === 0 ? <p className="empty">No notes yet.</p> : <NoteTimeline notes={a.notes} fmt={fmtDateTime} />}
            <form action={addApplicationNote.bind(null, id)}>
              <div className="field"><label htmlFor="note">Add a note</label><textarea id="note" name="note" rows={3} maxLength={1000} required /></div>
              <button className="btn btn-primary" type="submit"><Icon name="plus" />Save note</button>
            </form>
          </section>

          <section className="card danger-zone" aria-labelledby="h-del">
            <div className="card-head"><h2 className="card-title" id="h-del">Delete application</h2></div>
            <form action={deleteApplication.bind(null, id)} data-confirm="Delete this application and its resume file? This cannot be undone.">
              <p className="help">This removes the application and its resume file permanently.</p>
              <button className="btn btn-danger" type="submit"><Icon name="trash" />Delete application</button>
            </form>
          </section>
        </div>

        <div className="detail-side">
          <section className="card customer" aria-labelledby="h-who">
            <h2 className="sr-only" id="h-who">Applicant</h2>
            <p className="customer-name">{a.name}</p>
            <div className="reach">
              <a className="btn btn-primary" href={`tel:${a.phone}`}><Icon name="phone" />Call {a.phone}</a>
              {wa ? <a className="btn btn-wa" href={wa} target="_blank" rel="noopener noreferrer"><Icon name="chat" />WhatsApp</a> : null}
              {a.email ? <a className="btn btn-secondary" href={`mailto:${a.email}`}><Icon name="mail" />Email</a> : null}
            </div>
            <dl className="dl">
              <dt>Phone</dt><dd>{a.phone}</dd>
              <dt>Email</dt><dd>{a.email}</dd>
              <dt>Submitted</dt><dd>{fmtDateTime(a.created_at)}</dd>
              <dt>IP address</dt><dd>{a.ip || '—'}</dd>
            </dl>
          </section>
        </div>
      </div>
    </>
  );
}
