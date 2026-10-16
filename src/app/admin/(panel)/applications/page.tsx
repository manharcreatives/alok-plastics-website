import Link from 'next/link';
import { Badge, Flash, Pager } from '@/components/admin/ui';
import { PER_PAGE, likeTerm, pageCount, pageOf } from '@/server/admin-util';
import { query } from '@/server/db';
import { APPLICATION_LABELS, APPLICATION_STATUSES, fmtDateTime } from '@/server/shop';

type Props = { searchParams: Promise<{ status?: string; q?: string; page?: string; ok?: string; err?: string }> };
type Row = { id: string; created_at: string; name: string; phone: string; email: string; position: string; status: string; has_resume: boolean };

export default async function ApplicationsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const page = pageOf(sp.page);
  const q = (sp.q ?? '').trim().slice(0, 100);
  const where = ["collection = 'applications'"];
  const args: unknown[] = [];
  if (sp.status && (APPLICATION_STATUSES as readonly string[]).includes(sp.status)) { args.push(sp.status); where.push(`data->>'status' = $${args.length}`); }
  if (q) { args.push(likeTerm(q)); where.push(`(data->>'name' ilike $${args.length} or data->>'phone' ilike $${args.length} or data->>'email' ilike $${args.length} or data->>'position' ilike $${args.length})`); }
  const clause = where.join(' and ');
  const total = Number((await query<{ n: string }>(`select count(*) as n from docs where ${clause}`, args))[0]?.n ?? 0);
  const rows = await query<Row>(
    `select id, created_at, data->>'name' as name, data->>'phone' as phone, data->>'email' as email, data->>'position' as position,
            data->>'status' as status, coalesce(data->>'resume_file', '') <> '' as has_resume
       from docs where ${clause} order by id desc limit ${PER_PAGE} offset ${(page - 1) * PER_PAGE}`,
    args,
  );
  const stat = await query<{ s: string; n: string }>("select data->>'status' as s, count(*) as n from docs where collection = 'applications' group by 1");
  const byStatus = Object.fromEntries(stat.map((r) => [r.s, Number(r.n)]));
  const byPos = await query<{ p: string; n: string }>("select coalesce(nullif(trim(data->>'position'), ''), 'General application') as p, count(*) as n from docs where collection = 'applications' group by 1 order by 2 desc limit 8");
  const href = (p: number, status = sp.status) => `/admin/applications/?${new URLSearchParams({ ...(status ? { status } : {}), ...(q ? { q } : {}), ...(p > 1 ? { page: String(p) } : {}) }).toString()}`;
  return (
    <>
      <h1>Applications</h1>
      <p className="sub">Career applications from the website. {total} shown.</p>
      <Flash ok={sp.ok} err={sp.err} />
      <div className="adm-chips">
        <Link href={href(1, '')} aria-current={!sp.status ? 'true' : undefined}>All</Link>
        {APPLICATION_STATUSES.map((s) => <Link key={s} href={href(1, s)} aria-current={sp.status === s ? 'true' : undefined}>{APPLICATION_LABELS[s]} ({byStatus[s] ?? 0})</Link>)}
      </div>
      {byPos.length > 0 ? <p className="sub">By role: {byPos.map((r) => `${r.p} (${r.n})`).join(' · ')}</p> : null}
      <form className="adm-filters" method="get" action="/admin/applications/">
        {sp.status ? <input type="hidden" name="status" value={sp.status} /> : null}
        <input type="text" name="q" defaultValue={q} placeholder="Name, phone, email or role" aria-label="Search" style={{ minWidth: 260 }} />
        <button className="adm-btn" type="submit">Search</button>
      </form>
      <section className="adm-card">
        {rows.length === 0 ? <p className="adm-empty">No applications.</p> : (
          <div className="adm-tablewrap">
            <table>
              <thead><tr><th>When</th><th>Applicant</th><th>Role</th><th>Resume</th><th>Status</th></tr></thead>
              <tbody>
                {rows.map((a) => (
                  <tr key={a.id}>
                    <td>{fmtDateTime(Number(a.created_at))}</td>
                    <td><Link href={`/admin/applications/${a.id}/`}>{a.name}</Link><br /><small>{a.phone} &middot; {a.email}</small></td>
                    <td>{a.position || '-'}</td>
                    <td>{a.has_resume ? 'File' : 'Link'}</td>
                    <td><Badge s={a.status} label={APPLICATION_LABELS[a.status] ?? a.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pager page={page} pages={pageCount(total)} href={(p) => href(p)} />
      </section>
    </>
  );
}
