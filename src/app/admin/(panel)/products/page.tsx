import Link from 'next/link';
import { Flash, Icon } from '@/components/admin/ui';
import { requireAdmin } from '@/server/admin-auth';
import { getHidden } from '@/server/content';
import { AVAILABILITY, STATUS, catalogueRows, isEdited, productGroups, type Row } from '@/server/products-admin';
import { bulkSave, toggleVisibility } from './actions';

export const metadata = { title: 'Products' };

type Sp = { q?: string; group?: string; status?: string; avail?: string; vis?: string; edited?: string; sort?: string; attn?: string; ok?: string; err?: string };
type Props = { searchParams: Promise<Sp> };

const rupee = (n: number): string => `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

function Select({ name, opts, cur, any }: { name: string; opts: Record<string, string>; cur: string; any?: string }) {
  return (
    <select id={name} name={name} defaultValue={cur}>
      {any ? <option value="">{any}</option> : null}
      {Object.entries(opts).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
    </select>
  );
}

export default async function ProductsPage({ searchParams }: Props) {
  await requireAdmin();
  const sp = await searchParams;
  const f = {
    q: (sp.q ?? '').trim().slice(0, 60), group: sp.group ?? '', status: sp.status ?? '', avail: sp.avail ?? '', vis: sp.vis ?? '',
    edited: sp.edited ?? '', sort: sp.sort ?? '', attn: sp.attn ?? '',
  };
  const hidden = new Set(await getHidden());
  const all = await catalogueRows();
  const photoOf = (r: Row): string => r.edit.images?.[0]?.url ?? (r.custom ? '' : r.base.photo ?? `/images/products/${r.slug}.webp`);
  const needs = (r: Row) => ({
    img: !(r.edit.images?.length) && (r.custom || r.base.published === false),
    price: r.price === null,
    desc: !(r.edit.description) && !r.base.description,
  });
  const attnCount = { any: 0, img: 0, price: 0, desc: 0 };
  for (const r of all) {
    const n = needs(r);
    if (n.img) attnCount.img++;
    if (n.price) attnCount.price++;
    if (n.desc) attnCount.desc++;
    if (n.img || n.price || n.desc) attnCount.any++;
  }
  const q = f.q.toLowerCase();
  const rows = all
    .filter((r) => !f.group || r.groupId === f.group)
    .filter((r) => !f.status || r.status === f.status)
    .filter((r) => !f.avail || r.availability === f.avail)
    .filter((r) => (f.vis === 'hidden' ? hidden.has(r.slug) : f.vis === 'shown' ? !hidden.has(r.slug) : true))
    .filter((r) => (f.edited === 'yes' ? isEdited(r.edit) : f.edited === 'no' ? !isEdited(r.edit) : true))
    .filter((r) => {
      const n = needs(r);
      if (f.attn === 'any') return n.img || n.price || n.desc;
      if (f.attn === 'img' || f.attn === 'price' || f.attn === 'desc') return n[f.attn];
      return true;
    })
    .filter((r) => !q || `${r.name} ${r.slug} ${String(r.edit.sku ?? r.base.sku ?? '')} ${r.brand} ${r.keywords.join(' ')} ${productGroups.find((g) => g.id === r.groupId)?.name ?? ''}`.toLowerCase().includes(q))
    .sort((a, b) => {
      if (f.sort === 'recent') return String(b.edit.updatedAt ?? '').localeCompare(String(a.edit.updatedAt ?? '')) || a.name.localeCompare(b.name);
      if (f.sort === 'price-asc') return (a.price ?? Infinity) - (b.price ?? Infinity) || a.name.localeCompare(b.name);
      if (f.sort === 'price-desc') return (b.price ?? -1) - (a.price ?? -1) || a.name.localeCompare(b.name);
      return a.name.localeCompare(b.name);
    });

  const keep = Object.fromEntries(Object.entries(f).filter(([, v]) => v !== ''));
  const filtered = Object.keys(keep).some((k) => k !== 'sort');
  const chip = (label: string, val: string, n: number) => {
    const on = f.attn === val;
    const p = { ...keep } as Record<string, string>;
    if (val === '') delete p.attn; else p.attn = val;
    const s = new URLSearchParams(p).toString();
    return <Link className={`chip${on ? ' is-on' : ''}`} href={`/admin/products/${s ? `?${s}` : ''}`} aria-current={on ? 'true' : undefined}>{label}{val !== '' ? ` (${n})` : ''}</Link>;
  };
  const groups = Object.fromEntries(productGroups.map((g) => [g.id, g.name]));
  const hiddenCount = all.filter((r) => hidden.has(r.slug)).length;

  return (
    <>
      <Flash ok={sp.ok} err={sp.err} />
      <div className="row-between">
        <h1>Products</h1>
        <p className="meta">{all.length} products · {hiddenCount} hidden from lists</p>
        <Link className="btn btn-primary" href="/admin/products/new/"><Icon name="plus" />Add product</Link>
      </div>
      <p className="lead">Every product on the website. Add new products, or open one to change its group, name, description, price, availability, fitment, SEO tags and photos. Empty fields use the website’s built-in text; with no price, customers see “Price on request”.</p>

      <form className="card filters pfilters" method="get" action="/admin/products/">
        <div className="field field-wide">
          <label htmlFor="q">Search</label>
          <input id="q" name="q" type="search" maxLength={60} defaultValue={f.q} placeholder="Name, SKU, group, keyword or brand" />
        </div>
        <div className="field"><label htmlFor="group">Group</label><Select name="group" opts={groups} cur={f.group} any="All groups" /></div>
        <div className="field"><label htmlFor="status">Status</label><Select name="status" opts={STATUS} cur={f.status} any="Any status" /></div>
        <div className="field"><label htmlFor="avail">Availability</label><Select name="avail" opts={AVAILABILITY} cur={f.avail} any="Any availability" /></div>
        <div className="field"><label htmlFor="vis">Hidden from lists</label><Select name="vis" opts={{ hidden: 'Hidden only', shown: 'Shown only' }} cur={f.vis} any="Hidden and shown" /></div>
        <div className="field"><label htmlFor="edited">Edited</label><Select name="edited" opts={{ yes: 'Edited only', no: 'Not edited' }} cur={f.edited} any="Edited or not" /></div>
        <div className="field"><label htmlFor="sort">Sort by</label><Select name="sort" opts={{ recent: 'Recently edited', 'price-asc': 'Price, low to high', 'price-desc': 'Price, high to low' }} cur={f.sort} any="Name (A to Z)" /></div>
        {f.attn ? <input type="hidden" name="attn" value={f.attn} /> : null}
        <div className="filter-actions"><button className="btn btn-primary" type="submit">Filter</button>{filtered ? <Link className="btn btn-quiet" href="/admin/products/">Clear</Link> : null}</div>
      </form>

      <p className="pchips" role="group" aria-label="Needs attention">
        {chip('All products', '', 0)}{' '}
        {chip('Needs attention', 'any', attnCount.any)}{' '}
        {chip('No image', 'img', attnCount.img)}{' '}
        {chip('No price', 'price', attnCount.price)}{' '}
        {chip('No description', 'desc', attnCount.desc)}
      </p>

      {rows.length === 0 ? (
        <p className="card empty">No product matches those filters.</p>
      ) : (
        <form action={bulkSave} className="pbulk">
          <p className="meta">Quick edit: change price, availability or status on any row below, then use “Save quick edits”. Empty price = Price on request. Only products you changed are updated.</p>
          <ul className="plist">
            {rows.map((r) => {
              const thumb = photoOf(r);
              const n = needs(r);
              const edited = isEdited(r.edit);
              const sid = r.slug.replace(/[^a-z0-9-]/g, '');
              const material = String(r.edit.material ?? r.base.material ?? '');
              const sku = String(r.edit.sku ?? r.base.sku ?? '');
              const isHidden = hidden.has(r.slug);
              return (
                <li key={r.slug} className={`card pcard${isHidden || r.status !== 'active' ? ' is-hidden' : ''}`}>
                  <Link className="pthumb" href={`/admin/products/${r.slug}/`} tabIndex={-1} aria-hidden="true">
                    {thumb ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={thumb} alt="" width={72} height={72} loading="lazy" /> : <span className="pthumb-empty">No image</span>}
                  </Link>
                  <div className="pmain">
                    <h2 className="ptitle"><Link href={`/admin/products/${r.slug}/`}>{r.name}</Link></h2>
                    <p className="meta">{groups[r.groupId ?? ''] ?? 'No group yet'}{material ? ` · ${material}` : ''}{sku ? ` · ${sku}` : ''}</p>
                    <p className="pbadges">
                      <span className="badge badge-won">On website</span>
                      {isHidden ? <> <span className="badge badge-lost">Hidden from lists</span></> : null}
                      {r.custom ? <> <span className="badge tone-brand">Added in admin</span></> : null}
                      {r.status !== 'active' ? <> <span className="badge tone-warn">{STATUS[r.status]}</span></> : null}{' '}
                      <span className={`badge ${r.availability === 'in-stock' ? 'tone-ok' : r.availability === 'out-of-stock' ? 'tone-warn' : 'tone-info'}`}>{AVAILABILITY[r.availability]}{r.stock !== null ? ` · ${r.stock}` : ''}</span>
                      {r.featured ? <> <span className="badge tone-brand">Featured</span></> : null}
                      {edited ? <> <span className="badge badge-new">Edited</span></> : null}{' '}
                      <span className="pprice">{r.price === null ? <span className="muted">Price on request</span> : rupee(r.price)}</span>
                    </p>
                    {n.img || n.price || n.desc ? <p className="meta pattn">Needs: {[n.img ? 'image' : '', n.price ? 'price' : '', n.desc ? 'description' : ''].filter(Boolean).join(', ')}</p> : null}
                    <div className="pquick">
                      <div className="field">
                        <label htmlFor={`p-${sid}`}>Price (₹)</label>
                        <input id={`p-${sid}`} type="text" inputMode="decimal" name={`pr_${r.slug}`} maxLength={14} defaultValue={r.price === null ? '' : String(r.price)} placeholder="On request" />
                      </div>
                      <div className="field">
                        <label htmlFor={`a-${sid}`}>Availability</label>
                        <select id={`a-${sid}`} name={`av_${r.slug}`} defaultValue={r.availability}>
                          {Object.entries(AVAILABILITY).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                        </select>
                      </div>
                      <div className="field">
                        <label htmlFor={`s-${sid}`}>Status</label>
                        <select id={`s-${sid}`} name={`st_${r.slug}`} defaultValue={r.status}>
                          {Object.entries(STATUS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="pact">
                    <Link className="btn btn-secondary btn-sm" href={`/admin/products/${r.slug}/`}>Edit</Link>
                    <button className="btn btn-quiet btn-sm" type="submit" formAction={toggleVisibility.bind(null, r.slug)} formNoValidate>
                      {isHidden ? 'Show' : 'Hide'}<span className="sr-only"> {r.name}</span>
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
          <div className="sticky-actions">
            <button className="btn btn-primary" type="submit">Save quick edits</button>
            <span className="meta">{rows.length} product(s) shown</span>
          </div>
        </form>
      )}
      <p className="meta">Hiding removes a product from the website’s lists and menus; its own page stays reachable. Status “Inactive” or “Archived” also removes it from lists, search and menus, and the page shows “no longer available”. Products you add here appear on the website straight away in their group; built-in products can be moved between groups or removed from the website from their edit screen.</p>
    </>
  );
}
