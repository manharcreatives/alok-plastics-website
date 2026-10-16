import { Pager } from '@/components/admin/ui';
import { PER_PAGE, likeTerm, pageCount, pageOf } from '@/server/admin-util';
import { query } from '@/server/db';
import { fmtDateTime } from '@/server/shop';

type Props = { searchParams: Promise<{ q?: string; action?: string; user?: string; page?: string }> };
type Row = { id: string; at: string; actor: string; action: string; target: string; detail: string };

export default async function AuditPage({ searchParams }: Props) {
  const sp = await searchParams;
  const page = pageOf(sp.page);
  const q = (sp.q ?? '').trim().slice(0, 80);
  const where: string[] = [];
  const args: unknown[] = [];
  if (sp.action) { args.push(sp.action); where.push(`action = $${args.length}`); }
  if (sp.user) { args.push(sp.user); where.push(`actor = $${args.length}`); }
  if (q) { args.push(likeTerm(q)); where.push(`(action ilike $${args.length} or actor ilike $${args.length} or target ilike $${args.length} or detail ilike $${args.length})`); }
  const clause = where.length ? `where ${where.join(' and ')}` : '';
  const total = Number((await query<{ n: string }>(`select count(*) as n from audit_log ${clause}`, args))[0]?.n ?? 0);
  const rows = await query<Row>(`select id, at, actor, action, target, detail from audit_log ${clause} order by at desc, id desc limit ${PER_PAGE} offset ${(page - 1) * PER_PAGE}`, args);
  const [actions, users] = await Promise.all([
    query<{ v: string }>('select distinct action as v from audit_log order by 1'),
    query<{ v: string }>('select distinct actor as v from audit_log order by 1'),
  ]);
  const href = (p: number) => `/admin/audit/?${new URLSearchParams({ ...(q ? { q } : {}), ...(sp.action ? { action: sp.action } : {}), ...(sp.user ? { user: sp.user } : {}), ...(p > 1 ? { page: String(p) } : {}) }).toString()}`;
  return (
    <>
      <h1>Activity log</h1>
      <p className="sub">Sign-ins and changes made in this panel, newest first. {total} entries.</p>
      <form className="adm-filters" method="get" action="/admin/audit/">
        <input type="text" name="q" defaultValue={q} placeholder="Search action, user, detail" aria-label="Search" style={{ minWidth: 240 }} />
        <select name="action" defaultValue={sp.action ?? ''} aria-label="Action">
          <option value="">All actions</option>
          {actions.map((a) => <option key={a.v} value={a.v}>{a.v.replace(/_/g, ' ')}</option>)}
        </select>
        <select name="user" defaultValue={sp.user ?? ''} aria-label="User">
          <option value="">All users</option>
          {users.map((u) => <option key={u.v} value={u.v}>{u.v || '(none)'}</option>)}
        </select>
        <button className="adm-btn" type="submit">Filter</button>
      </form>
      <section className="adm-card">
        {rows.length === 0 ? <p className="adm-empty">Nothing recorded yet.</p> : (
          <div className="adm-tablewrap">
            <table>
              <thead><tr><th>When</th><th>User</th><th>Action</th><th>Target</th><th>Detail</th></tr></thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td>{fmtDateTime(Number(r.at))}</td>
                    <td>{r.actor}</td>
                    <td>{r.action.replace(/_/g, ' ')}</td>
                    <td>{r.target}</td>
                    <td>{r.detail}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pager page={page} pages={pageCount(total)} href={href} />
      </section>
    </>
  );
}
