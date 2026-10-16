import Link from 'next/link';
import { Pager } from '@/components/admin/ui';
import { PER_PAGE, likeTerm, pageCount, pageOf } from '@/server/admin-util';
import { query } from '@/server/db';
import { fmtDateTime } from '@/server/shop';

type Props = { searchParams: Promise<{ q?: string; page?: string }> };
type Row = { id: string; name: string; phone: string; created_at: string; last_login: string | null; orders: string };

export default async function CustomersPage({ searchParams }: Props) {
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
      <h1>Customers</h1>
      <p className="sub">People who gave their name and mobile number in the cart. {total} in total.</p>
      <form className="adm-filters" method="get" action="/admin/customers/">
        <input type="text" name="q" defaultValue={q} placeholder="Name or mobile" aria-label="Search" style={{ minWidth: 260 }} />
        <button className="adm-btn" type="submit">Search</button>
      </form>
      <section className="adm-card">
        {rows.length === 0 ? <p className="adm-empty">No customers yet.</p> : (
          <div className="adm-tablewrap">
            <table>
              <thead><tr><th>Name</th><th>Mobile</th><th>Orders</th><th>First seen</th><th>Last sign-in</th><th /></tr></thead>
              <tbody>
                {rows.map((c) => (
                  <tr key={c.id}>
                    <td>{c.name}</td>
                    <td>+{c.phone}</td>
                    <td>{c.orders}</td>
                    <td>{fmtDateTime(Number(c.created_at))}</td>
                    <td>{fmtDateTime(Number(c.last_login ?? c.created_at))}</td>
                    <td>{Number(c.orders) > 0 ? <Link href={`/admin/orders/?q=${c.phone}`}>View orders</Link> : null}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pager page={page} pages={pageCount(total)} href={(p) => `/admin/customers/?${new URLSearchParams({ ...(q ? { q } : {}), ...(p > 1 ? { page: String(p) } : {}) }).toString()}`} />
      </section>
    </>
  );
}
