import Link from 'next/link';
import { EmptyState, Icon, PageHead, Pager } from '@/components/admin/ui';
import { requireAdmin } from '@/server/admin-auth';
import { PER_PAGE, likeTerm, pageCount, pageOf } from '@/server/admin-util';
import { query } from '@/server/db';
import { fmtDateTime } from '@/server/shop';

export const metadata = { title: 'Customers' };

type Props = { searchParams: Promise<{ q?: string; page?: string }> };
type Row = { id: string; name: string; phone: string; created_at: string; last_login: string | null; orders: string };

const dayOf = (ts: number): string => new Date(ts * 1000).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short', year: 'numeric' });

export default async function CustomersPage({ searchParams }: Props) {
  await requireAdmin();
  const sp = await searchParams;
  const page = pageOf(sp.page);
  const q = (sp.q ?? '').trim().slice(0, 100);
  const args: unknown[] = [];
  let filter = '';
  if (q) {
    args.push(likeTerm(q));
    filter = ` and (c.data->>'name' ilike $1 or c.data->>'phone' ilike $1)`;
  }
  const total = Number((await query<{ n: string }>(`select count(*) as n from docs c where c.collection = 'customers'${filter}`, args))[0]?.n ?? 0);
  const rows = await query<Row>(
    `select c.id, c.data->>'name' as name, c.data->>'phone' as phone, c.created_at, c.data->>'last_login' as last_login,
            (select count(*) from docs o where o.collection = 'orders' and o.data->>'customer_id' = c.id::text) as orders
       from docs c where c.collection = 'customers'${filter}
      order by c.id desc limit ${PER_PAGE} offset ${(page - 1) * PER_PAGE}`,
    args,
  );
  return (
    <>
      <PageHead
        title="Customers"
        crumbs={[['Dashboard', '/admin/'], ['Customers', null]]}
        lead="People who gave their name and mobile number in the cart."
        extra={<> <span className="meta">{total} {total === 1 ? 'result' : 'results'}</span></>}
      />

      <form className="card flush" method="get" action="/admin/customers/" role="search" aria-label="Search customers">
        <div className="toolbar">
          <div className="field field-wide">
            <label htmlFor="q">Search</label>
            <div className="search-box"><Icon name="search" /><input id="q" name="q" type="search" defaultValue={q} placeholder="Name or mobile" maxLength={100} /></div>
          </div>
          <div className="filter-actions">
            <button className="btn btn-primary" type="submit">Search</button>
            {q ? <Link className="btn btn-quiet" href="/admin/customers/">Clear</Link> : null}
          </div>
        </div>
      </form>

      {rows.length === 0 ? (
        <EmptyState icon="inbox" title={q ? 'No customers match your search' : 'No customers yet'}>
          <p>Customers appear here after they enter their name and mobile number in the cart.</p>
        </EmptyState>
      ) : (
        <>
          <div className="card flush">
            <div className="table-wrap">
              <table className="table stack">
                <thead>
                  <tr><th scope="col">Name</th><th scope="col">Mobile</th><th scope="col">Orders</th><th scope="col">First seen</th><th scope="col">Last sign-in</th><th scope="col"><span className="sr-only">Orders</span></th></tr>
                </thead>
                <tbody>
                  {rows.map((c) => (
                    <tr key={c.id}>
                      <td data-label="Name"><span className="cell-main">{c.name}</span></td>
                      <td data-label="Mobile" className="nowrap">+{c.phone}</td>
                      <td data-label="Orders">{c.orders}</td>
                      <td data-label="First seen" className="nowrap">{dayOf(Number(c.created_at))}</td>
                      <td data-label="Last sign-in" className="nowrap">{fmtDateTime(Number(c.last_login ?? c.created_at))}</td>
                      <td className="cell-go">{Number(c.orders) > 0 ? <Link className="btn btn-secondary btn-sm" href={`/admin/orders/?q=${c.phone}`}>View orders</Link> : null}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <Pager page={page} pages={pageCount(total)} href={(p) => `/admin/customers/?${new URLSearchParams({ ...(q ? { q } : {}), ...(p > 1 ? { page: String(p) } : {}) }).toString()}`} />
        </>
      )}
    </>
  );
}
