import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Badge, Card, DeleteBox, Flash, Notes } from '@/components/admin/ui';
import { requireAdmin } from '@/server/admin-auth';
import { applications } from '@/server/collection';
import { APPLICATION_LABELS, APPLICATION_STATUSES, fmtDateTime } from '@/server/shop';
import { addApplicationNote, deleteApplication, setApplicationStatus } from './actions';

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ ok?: string; err?: string }> };

export default async function ApplicationPage({ params, searchParams }: Props) {
  await requireAdmin();
  const { id } = await params;
  const sp = await searchParams;
  const a = await applications().find(Number(id));
  if (!a) notFound();
  const digits = a.phone.replace(/\D/g, '');
  const rows: [string, string][] = [
    ['Received', fmtDateTime(a.created_at)],
    ['Name', a.name],
    ['Phone', a.phone],
    ['Email', a.email],
    ['Role', a.position || '-'],
    ['Message', a.message || '-'],
    ['Resume link', a.resume_link || '-'],
    ['Resume file', a.resume_file ? `${a.resume_name} (${Math.max(1, Math.round(a.resume_size / 1024))} KB)` : '-'],
  ];
  return (
    <>
      <p><Link href="/admin/applications/">&larr; All applications</Link></p>
      <h1>{a.name} <Badge s={a.status} label={APPLICATION_LABELS[a.status] ?? a.status} /></h1>
      <p className="sub">Application #{a.id}</p>
      <Flash ok={sp.ok} err={sp.err} />
      <div className="adm-cols">
        <Card title="Details">
          <dl className="adm-dl">
            {rows.map(([k, v]) => (<div key={k} style={{ display: 'contents' }}><dt>{k}</dt><dd>{v}</dd></div>))}
          </dl>
          <p>
            {a.resume_file ? <a className="adm-btn" href={`/admin/applications/${a.id}/resume/`}>Download resume</a> : null}{' '}
            {a.resume_link ? <a className="adm-btn ghost" href={a.resume_link} target="_blank" rel="noopener noreferrer">Open resume link</a> : null}{' '}
            {digits ? <a className="adm-btn ghost" href={`https://wa.me/${digits}`} target="_blank" rel="noreferrer">WhatsApp</a> : null}
          </p>
        </Card>
        <div>
          <Card title="Status">
            <form action={setApplicationStatus.bind(null, id)}>
              <select name="status" defaultValue={a.status} aria-label="Status">
                {APPLICATION_STATUSES.map((s) => <option key={s} value={s}>{APPLICATION_LABELS[s]}</option>)}
              </select>{' '}
              <button className="adm-btn" type="submit">Save</button>
            </form>
          </Card>
          <Card title="Notes">
            <Notes notes={a.notes} />
            <form action={addApplicationNote.bind(null, id)}>
              <textarea name="note" maxLength={1000} placeholder="Add a note" aria-label="Note" required />
              <p><button className="adm-btn" type="submit">Add note</button></p>
            </form>
          </Card>
          <Card title="Danger zone">
            <DeleteBox label="Delete this application" action={deleteApplication.bind(null, id)}>
              <p>This removes the application and its resume file.</p>
            </DeleteBox>
          </Card>
        </div>
      </div>
    </>
  );
}
