import Link from 'next/link';
import { EmptyState, Flash, Icon, PageHead, Pager, APPLICATION_TONES, ToneBadge } from '@/components/admin/ui';
import { requireAdmin } from '@/server/admin-auth';
import { PER_PAGE, likeTerm, pageCount, pageOf } from '@/server/admin-util';
import { query } from '@/server/db';
import { APPLICATION_LABELS, APPLICATION_STATUSES, fmtDateTime } from '@/server/shop';

export const metadata = { title: 'Applications' };

type Props = { searchParams: Promise<{ status?: string; q?: string; page?: string; ok?: string; err?: string }> };
type Row = { id: string; created_at: string; name: string; phone: string; email: string; position: string; status: string; has_resume: boolean; has_link: boolean };

export default async function ApplicationsPage({ searchParams }: Props) {
  await requireAdmin();
  const sp = await searchParams;
  const page = pageOf(sp.page);
  const q = (sp.q ?? '').trim().slice(0, 100);
  const status = sp.status && (APPLICATION_STATUSES as readonly string[]).includes(sp.status) ? sp.status : '';
  const where = ["collection = 'applications'"];
  const args: unknown[] = [];
  if (status) { args.push(status); where.push(`data->>'status' = $${args.length}`); }
  if (q) { args.push(likeTerm(q)); where.push(`(data->>'name' ilike $${args.length} or data->>'phone' ilike $${args.length} or data->>'email' ilike $${args.length} or data->>'position' ilike $${args.length})`); }
  const clause = where.join(' and ');
  const total = Number((await query<{ n: string }>(`select count(*) as n from docs where ${clause}`, args))[0]?.n ?? 0);
  const rows = await query<Row>(
    `select id, created_at, data->>'name' as name, data->>'phone' as phone, data->>'email' as email, data->>'position' as position,
            data->>'status' as status, coalesce(data->>'resume_file', '') <> '' as has_resume, coalesce(data->>'resume_link', '') <> '' as has_link
       from docs where ${clause} order by id desc limit ${PER_PAGE} offset ${(page - 1) * PER_PAGE}`,
    args,
  );
  const stat = await query<{ s: string; n: string }>("select data->>'status' as s, count(*) as n from docs where collection = 'applications' group by 1");
  const byStatus: Record<string, number> = Object.fromEntries(stat.map((r) => [r.s, Number(r.n)]));
  const all = Object.values(byStatus).reduce((a, b) => a + b, 0);
  const byPos = await query<{ p: string; n: string }>("select coalesce(nullif(trim(data->>'position'), ''), 'General application') as p, count(*) as n from docs where collection = 'applications' group by 1 order by 2 desc limit 8");
  const times = await query<{ ph: string; n: string }>("select regexp_replace(data->>'phone', '\\D', '', 'g') as ph, count(*) as n from docs where collection = 'applications' group by 1 having count(*) > 1");
  const byPhone: Record<string, number> = Object.fromEntries(times.map((t) => [t.ph, Number(t.n)]));
  const href = (p: number) => `/admin/applications/?${new URLSearchParams({ ...(status ? { status } : {}), ...(q ? { q } : {}), ...(p > 1 ? { page: String(p) } : {}) }).toString()}`;

  return (
    <>
      <PageHead
        title="Applications"
        crumbs={[['Dashboard', '/admin/'], ['Applications', null]]}
        lead="Career applications sent from the website, newest first."
        extra={<> <span className="meta">{total} {total === 1 ? 'result' : 'results'}</span></>}
      />
      <Flash ok={sp.ok} err={sp.err} />

      {all > 0 ? (
        <div className="card app-summary" aria-label="Applicant summary">
          <p className="app-sum__line"><strong>{all}</strong> {all === 1 ? 'applicant' : 'applicants'} in total
            {APPLICATION_STATUSES.filter((k) => byStatus[k]).map((k) => <span key={k}> · {APPLICATION_LABELS[k]}: <strong>{byStatus[k]}</strong></span>)}
          </p>
          <p className="app-sum__line meta">By position:{' '}
            {byPos.map((r) => <span key={r.p}><span className="app-chip">{r.p} <strong>{r.n}</strong></span> </span>)}
          </p>
        </div>
      ) : null}

      <form className="card flush" method="get" action="/admin/applications/" role="search" aria-label="Filter applications">
        <div className="toolbar">
          <div className="field field-wide">
            <label htmlFor="q">Search</label>
            <div className="search-box"><Icon name="search" /><input id="q" name="q" type="search" defaultValue={q} placeholder="Name, phone, email or position" maxLength={100} /></div>
          </div>
          <div className="field field-sm">
            <label htmlFor="status">Status</label>
            <select id="status" name="status" defaultValue={status} data-autosubmit="">
              <option value="">All</option>
              {APPLICATION_STATUSES.map((k) => <option key={k} value={k}>{APPLICATION_LABELS[k]}</option>)}
            </select>
          </div>
          <div className="filter-actions">
            <button className="btn btn-primary" type="submit">Apply filters</button>
            {status || q ? <Link className="btn btn-quiet" href="/admin/applications/">Clear all</Link> : null}
          </div>
        </div>
      </form>

      {rows.length === 0 ? (
        <EmptyState icon="briefcase" title={all ? 'No applications match these filters' : 'No applications yet'}>
          <p>{all ? 'Try removing a filter or searching for something broader.' : 'Applications appear here as soon as someone applies on the Careers page.'}</p>
        </EmptyState>
      ) : (
        <>
          <div className="card flush">
            <div className="table-wrap">
              <table className="table stack">
                <thead>
                  <tr><th scope="col">Received</th><th scope="col">Applicant</th><th scope="col">Position</th><th scope="col">Resume / LinkedIn</th><th scope="col">Status</th><th scope="col"><span className="sr-only">Open</span></th></tr>
                </thead>
                <tbody>
                  {rows.map((a) => {
                    const n = byPhone[a.phone.replace(/\D+/g, '')] ?? 1;
                    return (
                      <tr key={a.id}>
                        <td data-label="Received" className="nowrap">{fmtDateTime(Number(a.created_at))}</td>
                        <td data-label="Applicant"><span><span className="cell-main">{a.name}</span><span className="cell-sub">{a.phone}{n > 1 ? ` · applied ${n} times` : ''}</span></span></td>
                        <td data-label="Position">{a.position}</td>
                        <td data-label="Resume / LinkedIn">{a.has_resume ? 'File' : a.has_link ? 'LinkedIn' : '—'}</td>
                        <td data-label="Status"><ToneBadge tone={APPLICATION_TONES[a.status] ?? 'tone-muted'}>{APPLICATION_LABELS[a.status] ?? a.status}</ToneBadge></td>
                        <td className="cell-go"><Link className="btn btn-secondary btn-sm" href={`/admin/applications/${a.id}/`}>Open<span className="sr-only"> application from {a.name}</span></Link></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          <Pager page={page} pages={pageCount(total)} href={href} />
        </>
      )}
    </>
  );
}
