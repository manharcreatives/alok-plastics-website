'use server';

import { redirect } from 'next/navigation';
import { audit, requireAdmin } from '@/server/admin-auth';
import { flash } from '@/server/admin-util';
import { getHidden, getProductEdits, saveHidden, saveProductEdits } from '@/server/content';
import { deleteFile } from '@/server/files';
import {
  ALT_MAX, MAX_IMAGES, MACHINE_LABELS, catalogueRows, cleanAlt, commerceDefaults, imageUrl, isSlug, slugify, storeCommerce, storeUpload,
  validateCommerce, validateText, getRow, type Edit, type TextKey,
} from '@/server/products-admin';
import { productGroups } from '@/content/products';

const stamp = (): string => new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
const str = (form: FormData, k: string): string => (typeof form.get(k) === 'string' ? (form.get(k) as string) : '');

export async function toggleVisibility(slug: string): Promise<void> {
  const user = await requireAdmin();
  const row = await getRow(slug);
  if (!row) flash('/admin/products/', 'err', 'Unknown product.');
  const hidden = await getHidden();
  const isHidden = hidden.includes(slug);
  await saveHidden(isHidden ? hidden.filter((s) => s !== slug) : [...hidden, slug]);
  await audit(user.username, 'product_visibility', slug, isHidden ? 'showed' : 'hid');
  flash('/admin/products/', 'ok', `"${row?.name}" is now ${isHidden ? 'shown in' : 'hidden from'} the website lists.`);
}

/** Quick edit of price / availability / status for many products at once. */
export async function bulkSave(form: FormData): Promise<void> {
  const user = await requireAdmin();
  const rows = await catalogueRows();
  const edits = (await getProductEdits()) as Record<string, Edit>;
  const next: Record<string, Edit> = { ...edits };
  const changes: string[] = [];
  const errors: string[] = [];
  for (const r of rows) {
    const pr = form.get(`pr_${r.slug}`);
    const av = form.get(`av_${r.slug}`);
    const st = form.get(`st_${r.slug}`);
    if (pr === null && av === null && st === null) continue;
    const input: Record<string, string> = { price: String(pr ?? ''), availability: String(av ?? ''), status: String(st ?? '') };
    const { values, errors: errs } = validateCommerce((k) => input[k] ?? '', ['price', 'availability', 'status']);
    if (Object.keys(errs).length > 0) { errors.push(`${r.name}: ${Object.values(errs).join(' ')}`); continue; }
    const before = edits[r.slug] ?? {};
    const entry = storeCommerce(before, values, commerceDefaults(r.base));
    const ch = (['price', 'availability', 'status'] as const).filter((k) => JSON.stringify(before[k] ?? null) !== JSON.stringify(entry[k] ?? null));
    if (ch.length === 0) continue;
    delete entry.updatedAt;
    if (Object.keys(entry).length > 0) next[r.slug] = { ...entry, updatedAt: stamp() };
    else delete next[r.slug];
    changes.push(`${r.slug} (${ch.join('/')})`);
  }
  if (errors.length > 0) flash('/admin/products/', 'err', errors.slice(0, 3).join(' | '));
  if (changes.length === 0) flash('/admin/products/', 'ok', 'Nothing changed.');
  await saveProductEdits(next);
  await audit(user.username, 'product_bulk_edit', 'products', `${changes.length} products: ${changes.join(', ')}`.slice(0, 400));
  flash('/admin/products/', 'ok', `Updated ${changes.length} product(s). The website picks it up on the next page load.`);
}

export async function saveProduct(slugParam: string, form: FormData): Promise<void> {
  const user = await requireAdmin();
  const isNew = slugParam === 'new';
  const rows = await catalogueRows();
  const existing = isNew ? null : rows.find((r) => r.slug === slugParam) ?? null;
  if (!isNew && !existing) flash('/admin/products/', 'err', 'That product does not exist.');
  const edits = (await getProductEdits()) as Record<string, Edit>;
  const isCustom = isNew || Boolean(existing?.custom);
  let slug = isNew ? '' : slugParam;
  const saved: Edit = edits[slug] ?? {};
  const base = existing?.base;
  const get = (k: string): string => str(form, k);
  const back = (msg: string): never => flash(isNew ? '/admin/products/new/' : `/admin/products/${slugParam}/`, 'err', msg);

  const errors: string[] = [];
  const gIn = get('group');
  if (!productGroups.some((g) => g.id === gIn)) errors.push('Choose which product group this belongs to.');
  const machines = (Object.keys(MACHINE_LABELS) as string[]).filter((m) => form.getAll('machines').map(String).includes(m));
  const defaults: Partial<Record<TextKey, string>> = base ? { name: base.name, summary: base.summary ?? '', sku: base.sku ?? '', hsn: base.hsn ?? '', moq: base.moq ?? '', packing: base.packing ?? '', fitment: base.fitment ?? '' } : {};
  const { clean, errors: textErrors } = validateText(get, defaults);
  errors.push(...Object.values(textErrors));
  if (isCustom && !clean.name && !textErrors.name) errors.push('Enter the product name.');
  const { values, errors: commerceErrors } = validateCommerce(get);
  errors.push(...Object.values(commerceErrors));
  const material = get('material');
  if (material !== '' && !(material in MATERIAL_IDS)) errors.push('Choose a valid material.');

  // Existing images: alt text, order and removal. Ids come only from what is already stored.
  const del = new Set(form.getAll('img_del').map(String));
  const keep: { sort: number; img: { id: string; url: string; alt: string } }[] = [];
  const removed: string[] = [];
  (saved.images ?? []).forEach((im, n) => {
    if (del.has(im.id)) { removed.push(im.id); return; }
    const alt = cleanAlt(form.get(`img_alt_${im.id}`) ?? im.alt);
    if (alt.length > ALT_MAX) errors.push(`Image description can be at most ${ALT_MAX} characters.`);
    keep.push({ sort: Number(form.get(`img_pos_${im.id}`) ?? n + 1) + n / 1000, img: { id: im.id, url: imageUrl(im.id), alt } });
  });
  keep.sort((a, b) => a.sort - b.sort);
  const images = keep.map((k) => k.img);

  const uploadNotes: string[] = [];
  const newIds: string[] = [];
  if (errors.length === 0) {
    const newAlt = cleanAlt(form.get('new_alt'));
    if (newAlt.length > ALT_MAX) errors.push(`Image description can be at most ${ALT_MAX} characters.`);
    for (const f of form.getAll('new_images')) {
      if (!(f instanceof File) || f.size === 0) continue;
      if (images.length >= MAX_IMAGES) { uploadNotes.push(`Only ${MAX_IMAGES} images per product; extra files were skipped.`); break; }
      if (errors.length > 0) break;
      const r = await storeUpload(f);
      if ('error' in r) { uploadNotes.push(r.error); continue; }
      newIds.push(r.id);
      images.push({ id: r.id, url: imageUrl(r.id), alt: newAlt || clean.name || existing?.name || 'Product image' });
    }
  }
  if (errors.length > 0) {
    for (const id of newIds) await deleteFile(id);
    back([...new Set(errors)].join(' '));
  }

  if (isNew) {
    const baseSlug = slugify(clean.name ?? '');
    slug = baseSlug;
    for (let i = 2; rows.some((r) => r.slug === slug) || slug in edits; i++) slug = `${baseSlug}-${i}`;
  }
  const def = commerceDefaults(base ?? { slug, name: '', group: null, machine: [], images: [], published: true, custom: true });
  const entry: Edit = storeCommerce({ ...clean }, values, def);
  if (material !== '' && material !== (base?.material ?? '')) entry.material = material;
  if (images.length > 0) entry.images = images;
  const defaultGroup = isCustom ? '' : base?.group ?? '';
  const defaultMachines = isCustom ? [] : Array.isArray(base?.machine) ? (base?.machine as string[]) : [];
  if (isCustom) {
    entry.custom = true;
    entry.group = gIn;
    entry.machines = machines;
    entry.createdAt = saved.createdAt ?? stamp();
  } else {
    if (gIn !== defaultGroup) entry.group = gIn;
    if (JSON.stringify(machines) !== JSON.stringify(defaultMachines)) entry.machines = machines;
  }

  const changed: string[] = [];
  for (const k of Object.keys({ ...saved, ...entry })) {
    if (k === 'updatedAt' || k === 'createdAt') continue;
    if (JSON.stringify(saved[k] ?? null) !== JSON.stringify(entry[k] ?? null)) changed.push(k);
  }
  const hidden = await getHidden();
  const wantShow = get('show') !== '';
  const isHidden = hidden.includes(slug);
  const visChanged = !isNew && wantShow === isHidden;
  const next = { ...edits };
  if (isNew) changed.splice(0, changed.length, 'created');
  if (changed.length > 0) {
    if (Object.keys(entry).length > 0) next[slug] = { ...entry, updatedAt: stamp() };
    else delete next[slug];
    await saveProductEdits(next);
    for (const id of removed) await deleteFile(id);
    await audit(user.username, 'product_edit', slug, changed.join(', '));
  }
  if (visChanged) {
    await saveHidden(wantShow ? hidden.filter((s) => s !== slug) : [...hidden, slug]);
    await audit(user.username, 'product_visibility', slug, wantShow ? 'showed' : 'hid');
    changed.push('visibility');
  }
  const msg = isNew ? 'Product added. The website picks it up on the next page load.' : changed.length ? `Saved: ${changed.join(', ')}. The website picks it up on the next page load.` : 'Nothing changed.';
  flash(`/admin/products/${slug}/`, uploadNotes.length ? 'err' : 'ok', uploadNotes.length ? `${msg} ${uploadNotes.join(' ')}` : msg);
}

/** Remove every edit and image for a built-in product; the website shows the built-in details again. */
export async function resetProduct(slug: string): Promise<void> {
  const user = await requireAdmin();
  const edits = (await getProductEdits()) as Record<string, Edit>;
  const row = await getRow(slug);
  if (!row) redirect('/admin/products/');
  if (edits[slug]) {
    for (const im of edits[slug]!.images ?? []) await deleteFile(im.id);
    const next = { ...edits };
    delete next[slug];
    await saveProductEdits(next);
    await audit(user.username, 'product_reset', slug, 'all edits and images removed');
  }
  flash(`/admin/products/${slug}/`, 'ok', `All edits for "${row!.name}" were removed. The website shows the built-in details again.`);
}

/** Custom products are deleted for good; built-in ones are archived (hidden from the site) because they live in the code. */
export async function deleteProduct(slug: string): Promise<void> {
  const user = await requireAdmin();
  if (!isSlug(slug)) redirect('/admin/products/');
  const row = await getRow(slug);
  if (!row) redirect('/admin/products/');
  const edits = (await getProductEdits()) as Record<string, Edit>;
  const next = { ...edits };
  if (row!.custom) {
    for (const im of edits[slug]?.images ?? []) await deleteFile(im.id);
    delete next[slug];
    await saveProductEdits(next);
    await saveHidden((await getHidden()).filter((s) => s !== slug));
    await audit(user.username, 'product_delete', slug, row!.name);
    flash('/admin/products/', 'ok', `"${row!.name}" was permanently deleted.`);
  }
  const entry = storeCommerce(edits[slug] ?? {}, { status: 'archived' }, commerceDefaults(row!.base));
  next[slug] = { ...entry, updatedAt: stamp() };
  await saveProductEdits(next);
  await audit(user.username, 'product_remove', slug, 'archived');
  flash('/admin/products/', 'ok', `"${row!.name}" was removed from the website. Set its status back to Active to bring it back.`);
}

const MATERIAL_IDS: Record<string, true> = { nylon: true, hdpe: true, ppcp: true, brass: true, ss: true, 'cast-iron': true };
