import Link from 'next/link';
import { notFound } from 'next/navigation';
import ImagePicker from '@/components/admin/ImagePicker';
import ProductsEnhance from '@/components/admin/ProductsEnhance';
import { Flash } from '@/components/admin/ui';
import { requireAdmin } from '@/server/admin-auth';
import { getHidden } from '@/server/content';
import {
  AVAILABILITY, BRAND_MAX, FIELDS, KEYWORDS_MAX, KEYWORD_LEN, MACHINE_LABELS, MATERIAL_LABELS, MAX_IMAGES, STATUS, commerceDefaults, getRow, isEdited,
  productGroups, type Row, type TextKey,
} from '@/server/products-admin';
import { deleteProduct, resetProduct, saveProduct } from '../actions';

export const metadata = { title: 'Product' };

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ ok?: string; err?: string }> };

const clip = (s: string, n: number): string => (s.length > n ? `${s.slice(0, n)}…` : s);

/** /admin/products/new/ adds a product; /admin/products/<slug>/ edits one. */
export default async function ProductPage({ params, searchParams }: Props) {
  await requireAdmin();
  const { slug } = await params;
  const sp = await searchParams;
  const isNew = slug === 'new';
  const row: Row | null = isNew ? null : await getRow(slug);
  if (!isNew && !row) notFound();
  const base = row?.base;
  const edit = row?.edit ?? {};
  const isCustom = isNew || row?.custom === true;
  const edited = !isNew && isEdited(edit);
  const hidden = isNew ? false : (await getHidden()).includes(slug);
  const def = base ? commerceDefaults(base) : { price: null, availability: 'on-request', stock: null, keywords: [] as string[], brand: '', featured: false, status: 'active' };
  const defText = (k: TextKey): string => String((base as Record<string, unknown> | undefined)?.[k] ?? '');
  const val = (k: TextKey): string => (typeof edit[k] === 'string' ? (edit[k] as string) : '');
  const machines = new Set<string>((edit.machines as string[] | undefined) ?? (Array.isArray(base?.machine) ? base.machine : []));
  const groupId = row?.groupId ?? '';
  const images = edit.images ?? [];
  const groupName = productGroups.find((g) => g.id === groupId)?.name ?? 'No group yet';
  const groupSlug = productGroups.find((g) => g.id === groupId)?.slug ?? '';
  const host = 'alokplastics.com';
  const status = row?.status ?? 'active';

  const field = (k: TextKey, hint = '') => {
    const [label, max, multi] = FIELDS[k];
    const d = defText(k);
    const common = { id: `f-${k}`, name: k, maxLength: max + 40, 'data-max': max, 'data-default': d, placeholder: d !== '' ? d : 'Not set', defaultValue: val(k) } as const;
    return (
      <div className="field" key={k}>
        <label htmlFor={`f-${k}`}>{label}{k === 'name' && isCustom ? ' *' : ''}</label>
        {multi ? <textarea {...common} rows={max > 500 ? 8 : 3} /> : <input type="text" {...common} required={k === 'name' && isCustom} />}
        <p className="fmeta">
          <span className="meta">{d !== '' ? `Default: ${clip(d, 90)}` : 'No default. Leave empty to show nothing.'}</span>
          <span className="meta"><span className="count-out" data-for={`f-${k}`}>{val(k).length}</span>/{max}</span>
          <button className="btn btn-quiet btn-sm js-only" type="button" data-reset={`f-${k}`} hidden>Reset to default</button>
        </p>
        {hint ? <p className="meta">{hint}</p> : null}
      </div>
    );
  };

  return (
    <>
      <ProductsEnhance />
      <p className="crumb"><Link href="/admin/products/">← Products</Link></p>
      <div className="row-between">
        <div>
          <h1>{isNew ? 'Add product' : row!.name}</h1>
          <p className="pbadges">
            {isNew ? <span className="badge badge-new">New</span> : <><span className="badge badge-won">On website</span>{hidden ? <> <span className="badge badge-lost">Hidden from lists</span></> : null}</>}
            {edited && !isCustom ? <> <span className="badge badge-new">Edited</span></> : null}
            {isCustom && !isNew ? <> <span className="badge tone-brand">Added in admin</span></> : null}
            {status !== 'active' ? <> <span className="badge badge-quoted">{STATUS[status]}</span></> : null}
            {' '}<span className="meta">{groupName}</span>
          </p>
        </div>
        {!isNew && (isCustom || groupSlug) ? <a className="btn btn-secondary" href={isCustom ? `/products/item/?s=${encodeURIComponent(slug)}` : `/products/${groupSlug}/${slug}/`} target="_blank" rel="noopener">View on website</a> : null}
      </div>
      <Flash ok={sp.ok} err={sp.err} />

      <form action={saveProduct.bind(null, slug)} className="pedit">
        <fieldset>
          <legend>Basics</legend>
          {field('name')}
          {field('summary')}
          {field('description', 'Plain text. A blank line starts a new paragraph.')}
        </fieldset>

        <fieldset>
          <legend>Group and fitment</legend>
          <div className="field">
            <label htmlFor="f-group">Product group *</label>
            <select id="f-group" name="group" defaultValue={groupId} required>
              {groupId === '' ? <option value="" disabled>Choose a group</option> : null}
              {productGroups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
            <p className="meta">The group decides where the product appears on the website. Moving a built-in product changes its group in lists, search and filters.</p>
          </div>
          <fieldset className="check-group">
            <legend>Machines it fits</legend>
            {Object.entries(MACHINE_LABELS).map(([k, l]) => (
              <label className="check" key={k}><input type="checkbox" name="machines" value={k} defaultChecked={machines.has(k)} /> {l}</label>
            ))}
          </fieldset>
          {field('fitment', 'For example: Voltas 2 tap water cooler, 4 ft display counter. Shown on the product page.')}
        </fieldset>

        <fieldset>
          <legend>Specifications</legend>
          <div className="grid2">
            <div className="field">
              <label htmlFor="f-material">Material</label>
              <select id="f-material" name="material" defaultValue={String(edit.material ?? base?.material ?? '')}>
                <option value="">Not set</option>
                {Object.entries(MATERIAL_LABELS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
              </select>
            </div>
            {field('sku')}
            {field('hsn')}
            {field('moq')}
          </div>
          {field('packing')}
        </fieldset>

        <fieldset>
          <legend>Price and availability</legend>
          <p className="meta">Optional. Leave price empty and customers see <b>Price on request</b>. Customers never see a price, stock or “in stock” you have not entered here. Orders are requests only: Alok Plastics confirms price, stock, delivery and payment on WhatsApp.</p>
          <div className="grid2">
            <div className="field">
              <label htmlFor="f-price">Price (₹, per piece)</label>
              <input type="text" inputMode="decimal" id="f-price" name="price" maxLength={14} defaultValue={row?.price == null ? '' : String(row.price)} placeholder="e.g. 125 or 125.50" />
              <p className="meta">{def.price === null ? 'Default: Not set — customers see Price on request.' : `Default: ₹${def.price}`} Allowed: 0 to 9,999,999.</p>
            </div>
            <div className="field">
              <label htmlFor="f-availability">Availability</label>
              <select id="f-availability" name="availability" defaultValue={row?.availability ?? def.availability}>
                {Object.entries(AVAILABILITY).map(([v, l]) => <option key={v} value={v}>{l}{v === 'on-request' ? ' (default)' : ''}</option>)}
              </select>
              <p className="meta">Default: {AVAILABILITY[def.availability as keyof typeof AVAILABILITY] ?? 'On request'}. “On request” means customers are told to ask on WhatsApp.</p>
            </div>
            <div className="field">
              <label htmlFor="f-stock">Stock (pieces)</label>
              <input type="text" inputMode="numeric" id="f-stock" name="stock" maxLength={8} defaultValue={row?.stock == null ? '' : String(row.stock)} placeholder="Not set" />
              <p className="meta">{def.stock === null ? 'Default: Not set — no stock figure is shown.' : `Default: ${def.stock}`} Optional whole number, 0 to 100,000.</p>
            </div>
            <div className="field">
              <label htmlFor="f-brand">Brand</label>
              <input type="text" id="f-brand" name="brand" maxLength={BRAND_MAX + 20} defaultValue={row?.brand ?? ''} placeholder={def.brand !== '' ? def.brand : 'Not set'} />
              <p className="meta">Optional, up to {BRAND_MAX} characters.</p>
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>Search keywords and status</legend>
          <div className="field">
            <label htmlFor="f-keywords">Keywords / tags</label>
            <textarea id="f-keywords" name="keywords" rows={3} maxLength={1200} defaultValue={(row?.keywords ?? []).join(', ')} placeholder="e.g. sliding bush, freezer, nylon" />
            <p className="meta">Words customers might type to find this product. Separate with commas or new lines. Up to {KEYWORDS_MAX} keywords, each up to {KEYWORD_LEN} characters; saved in lowercase, duplicates removed.{def.keywords.length > 0 ? ` Default: ${def.keywords.join(', ')}.` : ' Default: none.'}</p>
          </div>
          <label className="check"><input type="checkbox" name="featured" value="1" defaultChecked={row?.featured ?? false} /> Featured product (shown first where the website highlights products)</label>
          <div className="field">
            <label htmlFor="f-status">Status</label>
            <select id="f-status" name="status" defaultValue={status}>
              {Object.entries(STATUS).map(([v, l]) => <option key={v} value={v}>{l}{v === 'active' ? ' (default)' : ''}</option>)}
            </select>
            <ul className="meta status-help">
              <li><b>Active:</b> shown on the website in lists, search and menus.</li>
              <li><b>Inactive:</b> removed from website lists, search and menus; the product page shows “no longer available”. Use for products you may bring back.</li>
              <li><b>Archived:</b> same as Inactive on the website; use it to keep an old product on file out of your way.</li>
            </ul>
          </div>
        </fieldset>

        <fieldset>
          <legend>SEO (how it looks on Google)</legend>
          {field('seoTitle', 'Aim for under 60 characters. Leave empty to use the product name.')}
          {field('seoDescription', 'Aim for 120 to 160 characters. Leave empty to use the short summary.')}
          <div className="seo-preview" id="seo-preview" aria-label="Google result preview" data-name={row?.name ?? ''} data-summary={defText('summary')}>
            <p className="sp-url">{host} › products{groupSlug ? ` › ${groupSlug}` : ''} › {isNew ? 'new-product' : slug}</p>
            <p className="sp-title" id="sp-title">{val('seoTitle') || val('name') || row?.name || ''}</p>
            <p className="sp-desc" id="sp-desc">{val('seoDescription') || val('summary') || defText('summary')}</p>
          </div>
          <p className="meta">A rough preview; Google may show something different.</p>
        </fieldset>

        <fieldset>
          <legend>Images</legend>
          {!isCustom && images.length === 0 ? <p className="meta">Built-in image shown on the website until you add your own:</p> : null}
          {!isCustom && images.length === 0 ? (
            <p className="built-in">{/* eslint-disable-next-line @next/next/no-img-element */}<img src={base?.photo ?? `/images/products/${slug}.webp`} alt="" width={96} height={96} loading="lazy" /></p>
          ) : null}
          {images.length > 0 ? (
            <>
              <p className="meta">Your photos replace the built-in image.</p>
              <ol className="imglist" id="imglist">
                {images.map((im, i) => (
                  <li className="imgrow" data-id={im.id} key={im.id}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={im.url} alt="" width={96} height={96} loading="lazy" />
                    <div className="imgfields">
                      <p className="meta">{i === 0 ? <><b>Main image</b> (shown first)</> : `Image ${i + 1}`}</p>
                      <label htmlFor={`alt-${im.id}`}>Description (alt text)</label>
                      <input id={`alt-${im.id}`} type="text" name={`img_alt_${im.id}`} maxLength={180} defaultValue={im.alt} />
                      <div className="imgctl">
                        <label className="posl" htmlFor={`pos-${im.id}`}>Position</label>
                        <input id={`pos-${im.id}`} className="pos" type="number" min={1} max={MAX_IMAGES} name={`img_pos_${im.id}`} defaultValue={i + 1} />
                        <button className="btn btn-quiet btn-sm js-only" type="button" data-move="up" hidden>Move up</button>
                        <button className="btn btn-quiet btn-sm js-only" type="button" data-move="down" hidden>Move down</button>
                        <label className="check"><input type="checkbox" name="img_del" value={im.id} /> Delete this image</label>
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
              <p className="meta">The image in position 1 is the main one. Change the numbers (or use the buttons) and save to reorder.</p>
            </>
          ) : null}
          {images.length < MAX_IMAGES ? (
            <>
              <div className="field">
                <label>Add images</label>
                <ImagePicker max={MAX_IMAGES} />
                <p className="meta">JPEG, PNG or WebP, {MAX_IMAGES} images per product. Large photos are resized in your browser and cleaned of camera data. Pick a few at a time.</p>
              </div>
              <div className="field">
                <label htmlFor="new_alt">Description for the new images</label>
                <input id="new_alt" type="text" name="new_alt" maxLength={180} placeholder={row?.name ?? ''} />
                <p className="meta">Used as the accessible description for the uploaded images.</p>
              </div>
            </>
          ) : <p className="meta">This product already has {MAX_IMAGES} images. Delete one to add another.</p>}
        </fieldset>

        {!isNew ? (
          <fieldset>
            <legend>Visibility</legend>
            <label className="check"><input type="checkbox" name="show" value="1" defaultChecked={!hidden} /> Show this product in the website’s lists and menus</label>
            <p className="meta">Untick for a temporary reason such as out of stock. The product’s own page stays reachable.</p>
          </fieldset>
        ) : null}

        <div className="sticky-actions">
          <button className="btn btn-primary" type="submit">{isNew ? 'Add product' : 'Save changes'}</button>
          <Link className="btn btn-quiet" href="/admin/products/">Cancel</Link>
        </div>
      </form>

      {!isNew ? (
        <form className="card danger-zone" action={deleteProduct.bind(null, slug)} data-confirm={isCustom ? 'Delete this product and its images permanently?' : 'Remove this product from the website?'}>
          <h2>{isCustom ? 'Delete this product' : 'Remove from website'}</h2>
          <p className="meta">{isCustom ? 'Permanently deletes this product and its uploaded images. This cannot be undone.' : 'Built-in products cannot be erased. This sets the status to Archived so it disappears from lists, search and menus; set the status back to Active to restore it.'}</p>
          <button className="btn btn-danger" type="submit">{isCustom ? 'Delete product' : 'Remove from website'}</button>
        </form>
      ) : null}

      {edited && !isCustom ? (
        <form className="card danger-zone" action={resetProduct.bind(null, slug)} data-confirm="Remove every edit and uploaded image for this product?">
          <h2>Reset this product</h2>
          <p className="meta">Removes every edit (including price, availability, stock, keywords, brand, featured and status) and uploaded image for this product and goes back to the built-in details.{edit.updatedAt ? ` Last edited ${edit.updatedAt} (UTC).` : ''}</p>
          <button className="btn btn-danger" type="submit">Reset all to default</button>
        </form>
      ) : null}
    </>
  );
}
