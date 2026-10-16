import Link from 'next/link';
import { Badge, Flash, Pager } from '@/components/admin/ui';
import { pageCount, pageOf, rupees } from '@/server/admin-util';
import { listOrders } from '@/server/orders-admin';
import { fmtDateTime, ORDER_LABELS, ORDER_STATUSES } from '@/server/shop';

type Props = { searchParams: Promise<{ status?: string; q?: string; page?: string; ok?: string; err?: string }> };

export default async function OrdersPage({ searchParams }: Props) {
  const sp = await searchParams;
  const page = pageOf(sp.page);
  const q = (sp.q ?? '').trim().slice(0, 100);
  const { rows, total, counts } = await listOrders({ status: sp.status, q, page });
  const href = (p: number, status = sp.status) => {
    const u = new URLSearchParams();
    if (status) u.set('status', status);
    if (q) u.set('q', q);
    if (p > 1) u.set('page', String(p));
    const s = u.toString();
    return `/admin/orders/${s ? `?${s}` : ''}`;
  };
  return (
    <>
      <h1>Orders</h1>
      <p className="sub">Enquiries placed from the cart. {total} shown.</p>
      <Flash ok={sp.ok} err={sp.err} />
      <div className="adm-chips">
        <Link href={href(1, '')} aria-current={!sp.status ? 'true' : undefined}>All</Link>
        {ORDER_STATUSES.map((s) => (
          <Link key={s} href={href(1, s)} aria-current={sp.status === s ? 'true' : undefined}>{ORDER_LABELS[s]} ({counts[s] ?? 0})</Link>
        ))}
      </div>
      <form className="adm-filters" method="get" action="/admin/orders/">
        {sp.status ? <input type="hidden" name="status" value={sp.status} /> : null}
        <input type="text" name="q" defaultValue={q} placeholder="Search code, name or phone" aria-label="Search" style={{ minWidth: 260 }} />
        <button className="adm-btn" type="submit">Search</button>
      </form>
      <section className="adm-card">
        {rows.length === 0 ? <p className="adm-empty">No orders.</p> : (
          <div className="adm-tablewrap">
            <table>
              <thead><tr><th>Code</th><th>When</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th></tr></thead>
              <tbody>
                {rows.map((o) => (
                  <tr key={o.id}>
                    <td><Link href={`/admin/orders/${o.id}/`}>{o.code}</Link></td>
                    <td>{fmtDateTime(o.created_at)}</td>
                    <td>{o.name}<br />+{o.phone}</td>
                    <td>{o.items.length}</td>
                    <td>{rupees(o.total)}</td>
                    <td><Badge s={o.status} label={ORDER_LABELS[o.status] ?? o.status} /></td>
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
