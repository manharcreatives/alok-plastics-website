import Link from 'next/link';
import { query, now } from '@/server/db';
import { fmtDate, type Enquiry } from '@/server/enquiries';

export default async function Dashboard() {
  const week = now() - 7 * 86400;
  const [counts, recent] = await Promise.all([
    query<{ total: string; fresh: string; unseen: string; week: string; won: string }>(
      `select count(*) filter (where archived = 0) as total,
              count(*) filter (where archived = 0 and status = 'new') as fresh,
              count(*) filter (where archived = 0 and seen = 0) as unseen,
              count(*) filter (where archived = 0 and created_at > $1) as week,
              count(*) filter (where archived = 0 and status = 'won') as won
         from enquiries`,
      [week],
    ),
    query<Enquiry>('select * from enquiries where archived = 0 order by created_at desc, id desc limit 6'),
  ]);
  const c = counts[0];
  const [shop] = await query<{ pending: string; active: string; carts: string; apps: string }>(
    `select count(*) filter (where collection = 'orders' and data->>'status' = 'pending') as pending,
            count(*) filter (where collection = 'orders' and data->>'status' not in ('closed', 'cancelled')) as active,
            count(*) filter (where collection = 'carts' and data->>'status' = 'open') as carts,
            count(*) filter (where collection = 'applications' and data->>'status' = 'new') as apps
       from docs`,
  );
  return (
    <>
      <h1>Dashboard</h1>
      <p className="sub">Enquiries from the website contact and quote forms.</p>
      <div className="adm-grid">
        <div className="adm-stat"><b>{c?.unseen ?? 0}</b><span>Unread</span></div>
        <div className="adm-stat"><b>{c?.fresh ?? 0}</b><span>Status: new</span></div>
        <div className="adm-stat"><b>{c?.week ?? 0}</b><span>Last 7 days</span></div>
        <div className="adm-stat"><b>{c?.won ?? 0}</b><span>Won</span></div>
        <div className="adm-stat"><b>{c?.total ?? 0}</b><span>Total enquiries</span></div>
        <Link className="adm-stat" href="/admin/orders/?status=pending" style={{ textDecoration: 'none', color: 'inherit' }}><b>{shop?.pending ?? 0}</b><span>New orders</span></Link>
        <Link className="adm-stat" href="/admin/orders/" style={{ textDecoration: 'none', color: 'inherit' }}><b>{shop?.active ?? 0}</b><span>Orders in progress</span></Link>
        <Link className="adm-stat" href="/admin/carts/" style={{ textDecoration: 'none', color: 'inherit' }}><b>{shop?.carts ?? 0}</b><span>Open carts</span></Link>
        <Link className="adm-stat" href="/admin/applications/?status=new" style={{ textDecoration: 'none', color: 'inherit' }}><b>{shop?.apps ?? 0}</b><span>New applications</span></Link>
      </div>
      <section className="adm-card">
        <h2>Latest enquiries</h2>
        {recent.length === 0 ? (
          <p className="adm-empty">No enquiries yet.</p>
        ) : (
          <div className="adm-tablewrap">
            <table>
              <thead><tr><th>When</th><th>From</th><th>Product</th><th>Status</th></tr></thead>
              <tbody>
                {recent.map((r) => (
                  <tr key={r.id} className={r.seen ? '' : 'unseen'}>
                    <td>{fmtDate(r.created_at)}</td>
                    <td><Link href={`/admin/enquiries/${r.id}/`}>{r.name}</Link><br />{r.company}</td>
                    <td>{r.product || '-'}</td>
                    <td><span className="adm-badge" data-s={r.status}>{r.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p><Link href="/admin/enquiries/">See all enquiries</Link></p>
      </section>
    </>
  );
}
