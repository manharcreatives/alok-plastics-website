'use client';
/**
 * "You may also like" — four related products. Server HTML and first client render use the
 * build-time catalogue (so crawlers see real links); once the runtime bundle arrives the list
 * is re-ranked with the owner's edits. Rank: same group, shared keywords, same material,
 * machine overlap. Never includes itself or unlisted (inactive, archived, hidden) products.
 */
import { useMemo } from 'react';
import type { Product } from '@/content/types';
import FoldEdge, { FOLD_SECTION_CSS } from '@/components/sections/FoldEdge';
import { useCatalogProducts } from '@/components/runtime/useRuntime';
import { PartGrid } from './PartCard';
import './products.css';
import './pdp.css';

const LIMIT = 4;

export function rankRelated(
  all: Product[],
  self: Product,
  skip: (p: Product) => boolean,
  limit = LIMIT,
): Product[] {
  const kw = new Set((self.keywords ?? []).map(k => k.toLowerCase()));
  const machines = Array.isArray(self.machine) ? self.machine : [];
  return all
    .filter(p => p.slug !== self.slug && p.published && p.group && !skip(p))
    .map((p, order) => {
      let score = 0;
      if (self.group && p.group === self.group) score += 1000;
      const shared = (p.keywords ?? []).filter(k => kw.has(k.toLowerCase())).length;
      score += Math.min(shared, 5) * 100;
      if (self.material && p.material === self.material) score += 10;
      const pm = Array.isArray(p.machine) ? p.machine : [];
      score += machines.filter(m => pm.includes(m)).length;
      return { p, score, order };
    })
    .sort((a, b) => b.score - a.score || a.order - b.order)
    .slice(0, limit)
    .map(x => x.p);
}

export default function RelatedProducts({ product }: { product: Product }) {
  const catalog = useCatalogProducts();
  const items = useMemo(() => {
    const self = catalog.find(p => p.slug === product.slug) ?? product;
    return rankRelated(catalog, self, () => false);
  }, [catalog, product]);

  if (items.length === 0) return null;
  return (
    <section aria-labelledby="rel-h" className="p-section p-section--canvas fold-sec fold-sec--diag">
      <style>{FOLD_SECTION_CSS}</style>
      <FoldEdge variant="diag" />
      <div className="pw">
        <p className="p-eyebrow">Related</p>
        <h2 id="rel-h" className="p-h2" style={{ marginBottom: 'var(--space-lg)' }}>You may also like</h2>
        <PartGrid items={items} level={3} />
      </div>
    </section>
  );
}
