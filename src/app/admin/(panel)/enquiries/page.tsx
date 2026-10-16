import Link from 'next/link';
import { PAGE_SIZE, STATUSES, fmtDate, listEnquiries } from '@/server/enquiries';

type Props = { searchParams: Promise<{ status?: string; q?: string; archived?: string; page?: string }> };

export default async function EnquiriesPage({ searchParams }: Props) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const q = (sp.q ?? '').trim().slice(0, 80);
  const archived = sp.archived === '1';
  const { rows, total } = await listEnquiries({ status: sp.status, q, archived, page });
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const link = (p: number) => {
    const u = new URLSearchParams();
    if (sp.status) u.set('status', sp.status);
    if (q) u.set('q', q);
    if (archived) u.set('archived', '1');
    if (p > 1) u.set('page', String(p));
    const s = u.toString();
    return `/admin/enquiries/${s ? `?${s}` : ''}`;
  };
  return (
    <>
      <h1>{archived ? 'Archived enquiries' : 'Enquiries'}</h1>
      <p className="sub">{total} {total === 1 ? 'enquiry' : 'enquiries'}</p>
      <form className="adm-filters" method="get" action="/admin/enquiries/">
        <input type="text" name="q" defaultValue={q} placeholder="Search name, company, phone, product" aria-label="Search" style={{ minWidth: 260 }} />
        <select name="status" defaultValue={sp.status ?? ''} aria-label="Status">
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select name="archived" defaultValue={archived ? '1' : ''} aria-label="Archive">
          <option value="">Active</option>
          <option value="1">Archived</option>
        </select>
        <button className="adm-btn" type="submit">Filter</button>
      </form>
      <section className="adm-card">
        {rows.length === 0 ? (
          <p className="adm-empty">Nothing matches.</p>
        ) : (
          <div className="adm-tablewrap">
            <table>
              <thead><tr><th>When</th><th>From</th><th>Phone</th><th>Product</th><th>Status</th></tr></thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className={r.seen ? '' : 'unseen'}>
                    <td>{fmtDate(r.created_at)}</td>
                    <td><Link href={`/admin/enquiries/${r.id}/`}>{r.name}</Link><br />{r.company}</td>
                    <td>{r.phone}</td>
                    <td>{r.product || '-'}</td>
                    <td><span className="adm-badge" data-s={r.status}>{r.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {pages > 1 ? (
          <div className="adm-pager">
            {page > 1 ? <Link href={link(page - 1)}>Previous</Link> : null}
            <span>Page {page} of {pages}</span>
            {page < pages ? <Link href={link(page + 1)}>Next</Link> : null}
          </div>
        ) : null}
      </section>
    </>
  );
}
