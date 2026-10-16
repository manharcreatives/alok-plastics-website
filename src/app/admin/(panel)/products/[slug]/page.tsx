import Link from 'next/link';
import { notFound } from 'next/navigation';
import ImagePicker from '@/components/admin/ImagePicker';
import { Badge, Card, DeleteBox, Flash } from '@/components/admin/ui';
import { getHidden } from '@/server/content';
import { AVAILABILITY, FIELDS, MACHINE_LABELS, MATERIAL_LABELS, MAX_IMAGES, STATUS, commerceDefaults, getRow, isEdited, productGroups, type Row, type TextKey } from '@/server/products-admin';
import { deleteProduct, resetProduct, saveProduct } from '../actions';

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ ok?: string; err?: string }> };

/** /admin/products/new/ adds a product; /admin/products/<slug>/ edits one. */
export default async function ProductPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = await searchParams;
  const isNew = slug === 'new';
  const row: Row | null = isNew ? null : await getRow(slug);
  if (!isNew && !row) notFound();
  const base = row?.base;
  const edit = row?.edit ?? {};
  const isCustom = isNew || row?.custom === true;
  const hidden = isNew ? false : (await getHidden()).includes(slug);
  const def = base ? commerceDefaults(base) : { price: null, availability: 'on-request', stock: null, keywords: [], brand: '', featured: false, status: 'active' };
  const val = (k: TextKey): string => (typeof edit[k] === 'string' ? (edit[k] as string) : isNew ? '' : '');
  const placeholder = (k: TextKey): string => String((base as Record<string, unknown> | undefined)?.[k] ?? '');
  const machines = new Set<string>((edit.machines as string[] | undefined) ?? (Array.isArray(base?.machine) ? base.machine : []));
  const groupId = row?.groupId ?? '';
  const images = edit.images ?? [];

  return (
    <>
      <p><Link href="/admin/products/">&larr; All products</Link></p>
      <h1>{isNew ? 'Add product' : row!.name} {!isNew && isEdited(edit) ? <Badge s="open" label="edited" /> : null}</h1>
      <p className="sub">{isNew ? 'Created products get their own page on the website.' : `${base?.slug}${isCustom ? ' (custom product)' : ''}${edit.updatedAt ? ` · last saved ${edit.updatedAt}` : ''}`}</p>
      <Flash ok={sp.ok} err={sp.err} />
      <form action={saveProduct.bind(null, slug)} className="adm-form">
        <Card title="Details">
          {(Object.entries(FIELDS) as [TextKey, readonly [string, number, boolean]][]).map(([k, [label, max, multi]]) => (
            <label key={k}>{label}{k === 'name' && isCustom ? ' *' : ''}
              {multi
                ? <textarea name={k} defaultValue={val(k)} maxLength={max} rows={k === 'description' ? 6 : 3} placeholder={placeholder(k)} />
                : <input type="text" name={k} defaultValue={val(k)} maxLength={max} placeholder={placeholder(k)} required={k === 'name' && isCustom} />}
            </label>
          ))}
          <div className="adm-row">
            <label>Group *
              <select name="group" defaultValue={groupId} required>
                <option value="">Choose...</option>
                {productGroups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            </label>
            <label>Material
              <select name="material" defaultValue={String(edit.material ?? base?.material ?? '')}>
                <option value="">Not set</option>
                {Object.entries(MATERIAL_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </label>
          </div>
          <fieldset style={{ border: 0, padding: 0, margin: '12px 0 0' }}>
            <legend style={{ fontWeight: 600, fontSize: 13 }}>Fits these machines</legend>
            {Object.entries(MACHINE_LABELS).map(([k, v]) => (
              <label key={k} style={{ display: 'inline-flex', gap: 6, alignItems: 'center', marginRight: 16, fontWeight: 400 }}>
                <input type="checkbox" name="machines" value={k} defaultChecked={machines.has(k)} /> {v}
              </label>
            ))}
          </fieldset>
        </Card>

        <Card title="Price, stock and listing">
          <div className="adm-row">
            <label>Price (Rs.)<input type="text" name="price" defaultValue={row?.price == null ? '' : String(row.price)} inputMode="decimal" placeholder="Blank = price on request" /></label>
            <label>Availability
              <select name="availability" defaultValue={row?.availability ?? def.availability}>
                {Object.entries(AVAILABILITY).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </label>
            <label>Stock<input type="text" name="stock" defaultValue={row?.stock == null ? '' : String(row.stock)} inputMode="numeric" /></label>
            <label>Status
              <select name="status" defaultValue={row?.status ?? 'active'}>
                {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </label>
          </div>
          <label>Keywords (comma separated)<input type="text" name="keywords" defaultValue={(row?.keywords ?? []).join(', ')} /></label>
          <div className="adm-row">
            <label>Brand<input type="text" name="brand" defaultValue={row?.brand ?? ''} maxLength={60} /></label>
          </div>
          <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}><input type="checkbox" name="featured" value="1" defaultChecked={row?.featured ?? false} /> Featured product</label>
          {!isNew ? <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}><input type="checkbox" name="show" defaultChecked={!hidden} /> Show on the website lists</label> : null}
        </Card>

        <Card title={`Photos (up to ${MAX_IMAGES})`}>
          {images.length > 0 ? (
            <div className="adm-imgs">
              {images.map((im, i) => (
                <figure key={im.id}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={im.url} alt={im.alt} />
                  <input type="text" name={`img_alt_${im.id}`} defaultValue={im.alt} maxLength={140} aria-label="Photo description" />
                  <input type="text" name={`img_pos_${im.id}`} defaultValue={String(i + 1)} inputMode="numeric" aria-label="Order" style={{ width: 60, marginTop: 4 }} />
                  <label style={{ fontWeight: 400 }}><input type="checkbox" name="img_del" value={im.id} /> Remove</label>
                </figure>
              ))}
            </div>
          ) : <p className="sub">No uploaded photos.{!isCustom ? ' The built-in photo is shown instead.' : ''}</p>}
          <label>Add photos (JPEG, PNG or WebP)</label>
          <ImagePicker max={MAX_IMAGES} />
          <label>Description for the new photos<input type="text" name="new_alt" maxLength={140} /></label>
        </Card>

        <p><button className="adm-btn" type="submit">{isNew ? 'Add product' : 'Save changes'}</button></p>
      </form>

      {!isNew ? (
        <Card title="Danger zone">
          {!isCustom && isEdited(edit) ? (
            <form action={resetProduct.bind(null, slug)} style={{ marginBottom: 10 }}>
              <button className="adm-btn ghost" type="submit">Remove all my edits and photos</button>
            </form>
          ) : null}
          <DeleteBox label={isCustom ? 'Delete this product' : 'Remove from the website'} action={deleteProduct.bind(null, slug)}>
            <p>{isCustom ? 'This permanently deletes the product and its photos.' : 'The product is archived and disappears from the website. Set its status back to Active to restore it.'}</p>
          </DeleteBox>
        </Card>
      ) : null}
    </>
  );
}
