'use client';
/**
 * Spec sheet for the product page. Server renders the build-time values; after hydration
 * the owner's edits from products.json (name, material, drg no., HSN, MOQ, packing, description)
 * replace them in place. Nothing is ever blanked: see applyProductOverride.
 */
import Tag from '@/components/ui/Tag';
import { MATERIAL_LABELS, getGroup } from '@/content/products';
import type { Product } from '@/content/types';
import { useCommerce } from './useCommerce';
import './products.css';
import './pdp.css';

export default function ProductSpecs({ product, groupName }: { product: Product; groupName: string }) {
  const { product: p, commerce } = useCommerce(product);
  const liveGroup = p.group ? getGroup(p.group)?.name : undefined;
  const cells: { label: string; value: string; wide?: boolean }[] = [{ label: 'Group', value: liveGroup ?? groupName, wide: true }];
  if (p.material) cells.push({ label: 'Material', value: MATERIAL_LABELS[p.material] });
  if (p.sku) cells.push({ label: 'Drg no.', value: p.sku });
  if (p.hsn) cells.push({ label: 'HSN', value: p.hsn });
  if (p.moq) cells.push({ label: 'MOQ', value: p.moq });
  if (p.packing) cells.push({ label: 'Packing', value: p.packing });
  if (p.fitment) cells.push({ label: 'Fitment', value: p.fitment, wide: true });
  for (const sp of p.specs ?? []) cells.push({ label: sp.label, value: sp.value });

  return (
    <>
      <div className="tb">
        <div className="tb__head">
          <h2 id="spec-h" className="tb__name">{p.name}</h2>
          {p.material && <Tag material={p.material} />}
        </div>
        <dl className="tb__grid">
          {cells.map(c => (
            <div key={c.label} className={`tb__cell${c.wide || cells.length === 1 ? ' tb__cell--wide' : ''}`}>
              <dt>{c.label}</dt>
              <dd>{c.value}</dd>
            </div>
          ))}
        </dl>
      </div>
      {(p.description || commerce.keywords.length > 0) && (
        <section aria-labelledby="desc-h" className="p-about">
          <h2 id="desc-h" className="p-h3">About this part</h2>
          {p.description && <p className="p-lead p-desc">{p.description}</p>}
          {commerce.keywords.length > 0 && (
            <p className="p-aka"><strong>Also known as:</strong> {commerce.keywords.join(', ')}</p>
          )}
        </section>
      )}
    </>
  );
}
