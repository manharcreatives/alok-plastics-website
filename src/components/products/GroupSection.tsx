/** One taxonomy group: heading, tagline, part grid. Used on /products and group pages. */
import Link from 'next/link';
import { productsByGroup } from '@/content/products';
import type { ProductGroup } from '@/content/types';
import { PartGrid } from './PartCard';
import './products.css';

const ARROW = '↗︎';

export default function GroupSection({ group, linkToGroup = true }: { group: ProductGroup; linkToGroup?: boolean }) {
  const items = productsByGroup(group.id);
  const hid = `grp-${group.slug}-h`;
  return (
    <section aria-labelledby={hid} className="p-section">
      <div className="pw">
        <div className="p-head">
          <div>
            <p className="p-eyebrow"><span className="p-eyebrow__num">{group.id}</span><span>Group</span></p>
            <h2 id={hid} className="p-h2">{group.name}</h2>
            <p className="p-lead">{group.tagline}</p>
          </div>
          {linkToGroup && (
            <Link className="p-link" href={`/products/${group.slug}/`} aria-label={`View all ${group.name} parts`}>View all parts {ARROW}</Link>
          )}
        </div>
        <PartGrid items={items} level={3} />
      </div>
    </section>
  );
}
