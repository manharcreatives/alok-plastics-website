import Link from 'next/link';
import { requireAdmin } from '@/server/admin-auth';
import { BUYER_TYPES, STATUS_LABELS, STATUSES, filterQs, fmtShort, listEnquiries, parseFilter, productNames } from '@/server/enquiries';
import { Badge, EmptyState, Icon, PageHead, Pager } from '@/components/admin/ui';

export const metadata = { title: 'Enquiries' };

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function EnquiriesPage({ searchParams }: Props) {
  await requireAdmin();
  const f = parseFilter(await searchParams);
  const [{ rows, total, pages, page }, products] = await Promise.all([listEnquiries(f), productNames()]);
  const qs = (o: Partial<typeof f> = {}) => {
    const s = filterQs(f, o);
    return `/admin/enquiries/${s ? `?${s}` : ''}`;
  };
  const sortLink = (key: typeof f.sort, label: string) => {
    const next = f.sort === key && f.dir === 'desc' ? 'asc' : 'desc';
    return <Link href={qs({ sort: key, dir: next, page: 1 })}>{label}{f.sort === key ? (f.dir === 'asc' ? ' ↑' : ' ↓') : ''}</Link>;
  };
  const ariaSort = (key: typeof f.sort) => (f.sort === key ? (f.dir === 'asc' ? 'ascending' : 'descending') : 'none');
  const active = [f.q, f.status, f.buyer, f.product, f.from, f.to, f.view !== 'active' ? f.view : ''].some(Boolean);
  const exportQs = filterQs(f, { page: 1 });

  const chips: [string, Partial<typeof f>][] = [];
  if (f.q) chips.push([`Search: ${f.q}`, { q: '' }]);
  if (f.status) chips.push([`Status: ${STATUS_LABELS[f.status] ?? f.status}`, { status: '' }]);
  if (f.buyer) chips.push([`Buyer: ${BUYER_TYPES[f.buyer] ?? f.buyer}`, { buyer: '' }]);
  if (f.product) chips.push([`Product: ${f.product}`, { product: '' }]);
  if (f.from) chips.push([`From ${f.from}`, { from: '' }]);
  if (f.to) chips.push([`To ${f.to}`, { to: '' }]);
  if (f.view !== 'active') chips.push([`Showing: ${f.view === 'archived' ? 'Archived' : 'Everything'}`, { view: 'active' }]);

  return (
    <>
      <PageHead
        title="Enquiries"
        crumbs={[['Dashboard', '/admin/'], ['Enquiries', null]]}
        lead="Every valid website submission, newest first. Unread ones are highlighted."
        actions={<Link className="btn btn-secondary" href={`/admin/enquiries/export/${exportQs ? `?${exportQs}` : ''}`} prefetch={false}><Icon name="download" />Download CSV</Link>}
        extra={<> <span className="meta">{total} {total === 1 ? 'result' : 'results'}</span></>}
      />

      <form className="card flush" method="get" action="/admin/enquiries/" role="search" aria-label="Filter enquiries">
        <div className="toolbar">
          <div className="field field-wide">
            <label htmlFor="q">Search</label>
            <div className="search-box">
              <Icon name="search" />
              <input id="q" name="q" type="search" defaultValue={f.q} placeholder="Name, company, phone, city, product, note" maxLength={100} />
            </div>
          </div>
          <div className="field field-sm">
            <label htmlFor="status">Status</label>
            <select id="status" name="status" defaultValue={f.status} data-autosubmit="">
              <option value="">All</option>
              {STATUSES.map((k) => <option key={k} value={k}>{STATUS_LABELS[k]}</option>)}
            </select>
          </div>
          <div className="field field-sm">
            <label htmlFor="buyer">Buyer type</label>
            <select id="buyer" name="buyer" defaultValue={f.buyer} data-autosubmit="">
              <option value="">All</option>
              {Object.entries(BUYER_TYPES).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
            </select>
          </div>
          <div className="field field-sm">
            <label htmlFor="view">Show</label>
            <select id="view" name="view" defaultValue={f.view} data-autosubmit="">
              <option value="active">Active</option>
              <option value="archived">Archived</option>
              <option value="all">Everything</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="product">Product</label>
            <input id="product" name="product" type="text" list="product-list" defaultValue={f.product} maxLength={120} placeholder="Any" />
            <datalist id="product-list">{products.map((p) => <option key={p} value={p} />)}</datalist>
          </div>
          <div className="field field-sm">
            <label htmlFor="from">From</label>
            <input id="from" name="from" type="date" defaultValue={f.from} />
          </div>
          <div className="field field-sm">
            <label htmlFor="to">To</label>
            <input id="to" name="to" type="date" defaultValue={f.to} />
          </div>
          <div className="filter-actions">
            <button className="btn btn-primary" type="submit">Apply filters</button>
            {active ? <Link className="btn btn-quiet" href="/admin/enquiries/">Clear all</Link> : null}
          </div>
        </div>
        {chips.length > 0 ? (
          <div className="chips" aria-label="Active filters">
            {chips.map(([label, off]) => (
              <Link key={label} className="chip" href={qs({ ...off, page: 1 })}>{label}<span className="chip-x" aria-hidden="true">×</span><span className="sr-only"> (remove filter)</span></Link>
            ))}
          </div>
        ) : null}
      </form>

      {rows.length === 0 ? (
        <EmptyState icon={active ? 'filter' : 'inbox'} title={active ? 'No enquiries match these filters' : 'No enquiries yet'}>
          <p>{active ? 'Try removing a filter or searching for something broader.' : 'Each valid website submission lands here.'}</p>
          {active ? <Link className="btn btn-secondary" href="/admin/enquiries/">Clear filters</Link> : null}
        </EmptyState>
      ) : (
        <>
          <div className="card flush">
            <div className="table-wrap">
              <table className="table stack">
                <thead>
                  <tr>
                    <th scope="col" aria-sort={ariaSort('date')}>{sortLink('date', 'Received')}</th>
                    <th scope="col" aria-sort={ariaSort('name')}>{sortLink('name', 'Name')}</th>
                    <th scope="col" aria-sort={ariaSort('company')}>{sortLink('company', 'Company')}</th>
                    <th scope="col" aria-sort={ariaSort('product')}>{sortLink('product', 'Product')}</th>
                    <th scope="col" aria-sort={ariaSort('status')}>{sortLink('status', 'Status')}</th>
                    <th scope="col"><span className="sr-only">Open</span></th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.id} className={!r.seen ? 'unread' : ''}>
                      <td data-label="Received" className="nowrap"><span>{!r.seen ? <><span className="dot" title="Unread" /><span className="sr-only">Unread. </span></> : null}{fmtShort(r.created_at)}</span></td>
                      <td data-label="Name"><span><span className="cell-main">{r.name}</span><span className="cell-sub">{r.phone}</span></span></td>
                      <td data-label="Company"><span>{r.company}{r.city ? <span className="cell-sub">{r.city}</span> : null}</span></td>
                      <td data-label="Product">{(r.product || '—').length > 70 ? `${(r.product || '').slice(0, 69)}…` : r.product || '—'}</td>
                      <td data-label="Status"><span><Badge s={r.status} label={STATUS_LABELS[r.status]} />{r.archived ? <> <span className="badge badge-archived">Archived</span></> : null}</span></td>
                      <td className="cell-go"><Link className="btn btn-secondary btn-sm" href={`/admin/enquiries/${r.id}/`}>Open<span className="sr-only"> enquiry {r.id} from {r.name}</span></Link></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <Pager page={page} pages={pages} href={(p) => qs({ page: p })} />
        </>
      )}
    </>
  );
}
