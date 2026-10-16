import Link from 'next/link';
import { EmptyState, PageHead } from '@/components/admin/ui';
import { requireAdmin } from '@/server/admin-auth';
import { likeTerm } from '@/server/admin-util';
import { query } from '@/server/db';

export const metadata = { title: 'Activity log' };

type Props = { searchParams: Promise<{ q?: string; action?: string; user?: string; from?: string; to?: string }> };
type Row = { id: string; at: string; actor: string; action: string; target: string; detail: string };

const LIMIT = 300;
const TZ = 'Asia/Kolkata';
const dayLabel = (ts: number): string => new Date(ts * 1000).toLocaleString('en-IN', { timeZone: TZ, weekday: 'long', day: '2-digit', month: 'short', year: 'numeric' });
const timeLabel = (ts: number): string => new Date(ts * 1000).toLocaleString('en-GB', { timeZone: TZ, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
const isDate = (v: string | undefined): v is string => !!v && /^\d{4}-\d{2}-\d{2}$/.test(v);

export default async function AuditPage({ searchParams }: Props) {
  await requireAdmin();
  const sp = await searchParams;
  const q = (sp.q ?? '').trim().slice(0, 80);
  const fAction = (sp.action ?? '').slice(0, 60);
  const fUser = (sp.user ?? '').slice(0, 60);
  const fFrom = isDate(sp.from) ? sp.from : '';
  const fTo = isDate(sp.to) ? sp.to : '';
  const where: string[] = [];
  const args: unknown[] = [];
  const add = (sql: string, v: unknown) => { args.push(v); where.push(sql.replace('$$', `$${args.length}`)); };
  if (fAction) add('action = $$', fAction);
  if (fUser) add('lower(actor) = $$', fUser.toLowerCase());
  if (fFrom) add('at >= $$', Math.floor(Date.parse(`${fFrom}T00:00:00+05:30`) / 1000));
  if (fTo) add('at <= $$', Math.floor(Date.parse(`${fTo}T23:59:59+05:30`) / 1000));
  if (q) { args.push(likeTerm(q)); where.push(`(action ilike $${args.length} or actor ilike $${args.length} or target ilike $${args.length} or detail ilike $${args.length})`); }
  const clause = where.length ? `where ${where.join(' and ')}` : '';
  const entries = await query<Row>(`select id, at, actor, action, target, detail from audit_log ${clause} order by at desc, id desc limit ${LIMIT}`, args);
  const [actionTypes, userNames] = await Promise.all([
    query<{ v: string }>('select distinct action as v from audit_log order by 1'),
    query<{ v: string }>("select distinct actor as v from audit_log where actor <> '' order by 1"),
  ]);
  const hasFilter = Boolean(q || fAction || fUser || fFrom || fTo);
  const linkTo = (act: string) => `/admin/audit/?${new URLSearchParams(Object.entries({ q, action: act, user: fUser, from: fFrom, to: fTo }).filter(([, v]) => v)).toString()}`;

  const groups: { day: string; items: Row[] }[] = [];
  for (const en of entries) {
    const d = dayLabel(Number(en.at));
    if (groups[groups.length - 1]?.day !== d) groups.push({ day: d, items: [] });
    groups[groups.length - 1]!.items.push(en);
  }

  return (
    <>
      <PageHead title="Activity log" crumbs={[['Dashboard', '/admin/'], ['Activity log', null]]} lead="Sign-ins and changes made in this panel, newest first. Network addresses are stored only as an anonymous code." />

      <form className="audit-filter" method="get" action="/admin/audit/">
        <div className="af-row">
          <div className="af-field"><label htmlFor="af-q">Search</label><input id="af-q" type="search" name="q" defaultValue={q} placeholder="Action, user, detail…" maxLength={80} /></div>
          <div className="af-field"><label htmlFor="af-action">Action type</label>
            <select id="af-action" name="action" defaultValue={fAction}>
              <option value="">All actions</option>
              {actionTypes.map((a) => <option key={a.v} value={a.v}>{a.v.replace(/_/g, ' ')}</option>)}
            </select></div>
          <div className="af-field"><label htmlFor="af-user">User</label>
            <select id="af-user" name="user" defaultValue={fUser.toLowerCase()}>
              <option value="">All users</option>
              {userNames.map((u) => <option key={u.v} value={u.v.toLowerCase()}>{u.v}</option>)}
            </select></div>
          <div className="af-field"><label htmlFor="af-from">From</label><input id="af-from" type="date" name="from" defaultValue={fFrom} /></div>
          <div className="af-field"><label htmlFor="af-to">To</label><input id="af-to" type="date" name="to" defaultValue={fTo} /></div>
          <div className="af-btns">
            <button className="btn btn-secondary" type="submit">Filter</button>
            {hasFilter ? <Link className="btn btn-quiet" href="/admin/audit/">Clear</Link> : null}
          </div>
        </div>
      </form>

      {entries.length === 0 ? (
        <EmptyState icon="clock" title={hasFilter ? 'No matching entries' : 'Nothing recorded yet'}>
          <p>{hasFilter ? <>Try different filters or <Link href="/admin/audit/">clear all filters</Link>.</> : 'Sign-ins, status changes, notes and exports will appear here.'}</p>
        </EmptyState>
      ) : (
        <>
          <p className="meta audit-count">{hasFilter ? `${entries.length} matching entr${entries.length === 1 ? 'y' : 'ies'}.` : `Showing the last ${entries.length} entries.`}</p>
          <div className="card">
            {groups.map((g) => (
              <div key={g.day}>
                <h2 className="log-day">{g.day}</h2>
                <ol className="timeline">
                  {g.items.map((en) => {
                    const act = en.action;
                    const cls = /fail|block|reject/.test(act) ? 'tl-fail' : act === 'login' || act === 'logout' ? 'tl-dim' : undefined;
                    const detail = `${en.target} ${en.detail}`.trim();
                    return (
                      <li key={en.id} className={cls}>
                        <span className="tl-meta">{timeLabel(Number(en.at))} · <span className="tl-who">{en.actor}</span></span>
                        <span className="tl-act">{hasFilter && !fAction ? <Link className="tl-filter-link" href={linkTo(act)}>{act.replace(/_/g, ' ')}</Link> : act.replace(/_/g, ' ')}</span>
                        {detail ? <span className="tl-detail">{detail}</span> : null}
                      </li>
                    );
                  })}
                </ol>
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
}
