/**
 * One taxonomy group on /products: a sticky side column (name, what it does, link) beside the part
 * grid. Alternates canvas / surface-alt and, from the second group on, tucks under the previous
 * section with the logo's folded diagonal. Group ids are internal — never shown.
 */
import Link from 'next/link';
import { ArrowUpRight } from '@phosphor-icons/react/dist/ssr/ArrowUpRight';
import PartPicto from './PartPicto';
import FoldEdge, { FOLD_SECTION_CSS, type FoldVariant } from '@/components/sections/FoldEdge';
import { productsByGroup } from '@/content/products';
import type { ProductGroup } from '@/content/types';
import { PartGrid } from './PartCard';
import { pictogramFor } from './PartPicto';
import './products.css';

interface Props {
  group: ProductGroup;
  tone?: 'canvas' | 'alt';
  fold?: boolean;
  foldVariant?: FoldVariant;
}

export default function GroupSection({ group, tone = 'canvas', fold = false, foldVariant = 'fold' }: Props) {
  const items = productsByGroup(group.id);
  const hid = `grp-${group.slug}-h`;
  const glyph = items.map(p => pictogramFor(p.slug)).find(Boolean);
  return (
    <section aria-labelledby={hid} className={`p-grp p-grp--${tone}${fold ? ` fold-sec fold-sec--${foldVariant}` : ''}`}>
      {fold && (<><style>{FOLD_SECTION_CSS}</style><FoldEdge variant={foldVariant} /></>)}
      <div className="pw p-grp__in">
        <header className="p-grp__side">
          <p className="p-eyebrow">Part group</p>
          <h2 id={hid} className="p-h2">{group.name}</h2>
          <p className="p-lead">{group.tagline}</p>
          <span className="p-grp__count">{items.length} {items.length === 1 ? 'part' : 'parts'}</span>
          <div className="p-grp__cta">
            <Link className="p-link" href={`/products/${group.slug}/`} aria-label={`View the ${group.name} group`}>
              View group <ArrowUpRight size={18} weight="light" aria-hidden="true" />
            </Link>
          </div>
          {glyph && <div className="p-grp__glyph" aria-hidden="true"><PartPicto slug={glyph} size={48} strokePx={1} className="p-picto" /></div>}
        </header>
        <PartGrid items={items} level={3} />
      </div>
    </section>
  );
}
