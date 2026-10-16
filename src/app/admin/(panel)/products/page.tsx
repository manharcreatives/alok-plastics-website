import Link from 'next/link';
import { Badge, Flash } from '@/components/admin/ui';
import { rupees } from '@/server/admin-util';
import { getHidden } from '@/server/content';
import { AVAILABILITY, STATUS, catalogueRows, isEdited, productGroups } from '@/server/products-admin';
import { bulkSave, toggleVisibility } from './actions';

type Props = { searchParams: Promise<{ q?: string; group?: string; status?: string; vis?: string; attn?: string; ok?: string; err?: string }> };

export default async function ProductsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const q = (sp.q ?? '').trim().toLowerCase().slice(0, 80);
  const hidden = new Set(await getHidden());
  const all = await catalogueRows();
  const rows = all
    .filter((r) => (!sp.group || r.groupId === sp.group) && (!sp.status || r.status === sp.status))
    .filter((r) => (sp.vis === 'hidden' ? hidden.has(r.slug) : sp.vis === 'shown' ? !hidden.has(r.slug) : true))
    .filter((r) => {
      if (sp.attn === 'price') return r.price === null;
      if (sp.attn === 'img') return !(r.edit.images?.length) && !r.base.photo;
      if (sp.attn === 'desc') return !r.edit.description;
      return true;
    })
    .filter((r) => !q || `${r.name} ${r.slug} ${String(r.edit.sku ?? r.base.sku ?? '')} ${r.brand} ${r.keywords.join(' ')}`.toLowerCase().includes(q))
    .sort((a, b) => a.name.localeCompare(b.name));
  const groupName = (id: string | null): string => productGroups.find((g) => g.id === id)?.name ?? '-';
  const noPrice = all.filter((r) => r.price === null).length;
  return (
    <>
      <h1>Products</h1>
      <p className="sub">{all.length} products &middot; {hidden.size} hidden &middot; {noPrice} without a price.</p>
      <Flash ok={sp.ok} err={sp.err} />
      <p><Link className="adm-btn" href="/admin/products/new/">Add a product</Link></p>
      <form className="adm-filters" method="get" action="/admin/products/">
        <input type="text" name="q" defaultValue={q} placeholder="Search name, SKU, brand, keyword" aria-label="Search" style={{ minWidth: 240 }} />
        <select name="group" defaultValue={sp.group ?? ''} aria-label="Group">
          <option value="">All groups</option>
          {productGroups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
        </select>
        <select name="status" defaultValue={sp.status ?? ''} aria-label="Status">
          <option value="">Any status</option>
          {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select name="vis" defaultValue={sp.vis ?? ''} aria-label="Visibility">
          <option value="">Shown + hidden</option>
          <option value="shown">Shown</option>
          <option value="hidden">Hidden</option>
        </select>
        <select name="attn" defaultValue={sp.attn ?? ''} aria-label="Needs attention">
          <option value="">All</option>
          <option value="price">No price</option>
          <option value="img">No photo</option>
          <option value="desc">No description</option>
        </select>
        <button className="adm-btn" type="submit">Filter</button>
      </form>
      <form action={bulkSave}>
        <section className="adm-card">
          {rows.length === 0 ? <p className="adm-empty">No products match.</p> : (
            <div className="adm-tablewrap">
              <table>
                <thead><tr><th>Product</th><th>Group</th><th>Price (Rs.)</th><th>Availability</th><th>Status</th><th>On site</th><th /></tr></thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.slug}>
                      <td>
                        <Link href={`/admin/products/${r.slug}/`}>{r.name}</Link>
                        {r.custom ? <> <Badge s="open" label="custom" /></> : null}
                        {isEdited(r.edit) ? <> <small>edited</small></> : null}
                        <br /><small>{String(r.edit.sku ?? r.base.sku ?? r.slug)}</small>
                      </td>
                      <td>{groupName(r.groupId)}</td>
                      <td><input type="text" name={`pr_${r.slug}`} defaultValue={r.price === null ? '' : String(r.price)} inputMode="decimal" aria-label={`Price of ${r.name}`} style={{ width: 100 }} placeholder={rupees(null)} /></td>
                      <td>
                        <select name={`av_${r.slug}`} defaultValue={r.availability} aria-label={`Availability of ${r.name}`}>
                          {Object.entries(AVAILABILITY).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                        </select>
                      </td>
                      <td>
                        <select name={`st_${r.slug}`} defaultValue={r.status} aria-label={`Status of ${r.name}`}>
                          {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                        </select>
                      </td>
                      <td><Badge s={hidden.has(r.slug) ? 'inactive' : 'active'} label={hidden.has(r.slug) ? 'Hidden' : 'Shown'} /></td>
                      <td><button className="adm-btn ghost" type="submit" formAction={toggleVisibility.bind(null, r.slug)}>{hidden.has(r.slug) ? 'Show' : 'Hide'}</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {rows.length > 0 ? <p><button className="adm-btn" type="submit">Save price, availability and status</button></p> : null}
        </section>
      </form>
    </>
  );
}
