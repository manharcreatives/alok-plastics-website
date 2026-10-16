import Link from 'next/link';
import { requireAdmin } from '@/server/admin-auth';
import { pageCount, pageOf } from '@/server/admin-util';
import { listOrders } from '@/server/orders-admin';
import { fmtDateTime, ORDER_LABELS, ORDER_STATUSES } from '@/server/shop';
import { EmptyState, Flash, Icon, ORDER_TONES, PageHead, Pager, ToneBadge } from '@/components/admin/ui';

export const metadata = { title: 'Orders' };

type Props = { searchParams: Promise<{ status?: string; q?: string; page?: string; ok?: string; err?: string }> };

export default async function OrdersPage({ searchParams }: Props) {
  await requireAdmin();
  const sp = await searchParams;
  const page = pageOf(sp.page);
  const q = (sp.q ?? '').trim().slice(0, 100);
  const status = sp.status ?? '';
  const { rows, total, counts } = await listOrders({ status, q, page });
  const all = Object.values(counts).reduce((a, b) => a + b, 0);
  const href = (p: number) => {
    const u = new URLSearchParams();
    if (status) u.set('status', status);
    if (q) u.set('q', q);
    if (p > 1) u.set('page', String(p));
    const s = u.toString();
    return `/admin/orders/${s ? `?${s}` : ''}`;
  };
  return (
    <>
      <PageHead
        title="Orders"
        crumbs={[['Dashboard', '/admin/'], ['Orders', null]]}
        lead="Enquiries and orders placed from the website cart, newest first."
        extra={<> <span className="meta">{total} {total === 1 ? 'result' : 'results'}</span></>}
      />
      <Flash ok={sp.ok} err={sp.err} />

      <form className="card flush" method="get" action="/admin/orders/" role="search" aria-label="Filter orders">
        <div className="toolbar">
          <div className="field field-wide">
            <label htmlFor="q">Search</label>
            <div className="search-box"><Icon name="search" /><input id="q" name="q" type="search" defaultValue={q} placeholder="Order ID, name or mobile" maxLength={100} /></div>
          </div>
          <div className="field field-sm">
            <label htmlFor="status">Status</label>
            <select id="status" name="status" defaultValue={status} data-autosubmit="">
              <option value="">All ({all})</option>
              {ORDER_STATUSES.map((k) => <option key={k} value={k}>{ORDER_LABELS[k]} ({counts[k] ?? 0})</option>)}
            </select>
          </div>
          <div className="filter-actions">
            <button className="btn btn-primary" type="submit">Apply filters</button>
            {status || q ? <Link className="btn btn-quiet" href="/admin/orders/">Clear all</Link> : null}
          </div>
        </div>
      </form>

      {rows.length === 0 ? (
        <EmptyState icon="box" title={all ? 'No orders match these filters' : 'No orders yet'}>
          <p>{all ? 'Try removing a filter or searching for something broader.' : 'Orders appear here as soon as a customer places one from the cart.'}</p>
        </EmptyState>
      ) : (
        <>
          <div className="card flush">
            <div className="table-wrap">
              <table className="table stack">
                <thead>
                  <tr>
                    <th scope="col">Placed</th><th scope="col">Order</th><th scope="col">Customer</th><th scope="col">Items</th><th scope="col">Status</th>
                    <th scope="col"><span className="sr-only">Open</span></th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((o) => {
                    const first = o.items[0]?.name ?? '';
                    const more = o.items.length - 1;
                    return (
                      <tr key={o.id}>
                        <td data-label="Placed" className="nowrap">{fmtDateTime(o.created_at)}</td>
                        <td data-label="Order" className="nowrap"><span className="cell-main">{o.code}</span></td>
                        <td data-label="Customer"><span><span className="cell-main">{o.name}</span><span className="cell-sub">+{o.phone}</span></span></td>
                        <td data-label="Items">{first.length > 48 ? `${first.slice(0, 47)}…` : first}{more > 0 ? <> <span className="meta">+{more} more</span></> : null}</td>
                        <td data-label="Status"><ToneBadge tone={ORDER_TONES[o.status] ?? 'tone-muted'}>{ORDER_LABELS[o.status] ?? o.status}</ToneBadge></td>
                        <td className="cell-go"><Link className="btn btn-secondary btn-sm" href={`/admin/orders/${o.id}/`}>Open<span className="sr-only"> order {o.code}</span></Link></td>
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
