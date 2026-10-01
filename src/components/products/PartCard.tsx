/**
 * PartCard — pictogram-led product card (no photos yet; shows photo if images exist).
 * No prices (site.showPrices = false). Unknown fields are omitted.
 */
import Link from 'next/link';
import Pictogram, { pictogramPaths, type PictogramName } from '@/components/brand/Pictogram';
import Tag from '@/components/ui/Tag';
import { productPath } from '@/content/products';
import type { Product } from '@/content/types';
import './products.css';

const ARROW = '↗︎';

export function pictogramFor(slug: string): PictogramName | null {
  return slug in pictogramPaths ? (slug as PictogramName) : null;
}

export function PartArt({ product }: { product: Product }) {
  const img = product.images[0];
  if (img) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={img.src} alt={img.alt} width={img.w} height={img.h} loading="lazy" />;
  }
  const name = pictogramFor(product.slug);
  return name ? <Pictogram name={name} size={48} className="p-picto" /> : (
    <span aria-hidden="true" className="p-ph__cap">{product.name}</span>
  );
}

export default function PartCard({ product, level = 3 }: { product: Product; level?: 2 | 3 }) {
  const H = `h${level}` as 'h2' | 'h3';
  const href = productPath(product);
  return (
    <article className="p-card">
      <div className="p-card__art"><PartArt product={product} /></div>
      <div className="p-card__body">
        {product.material && (
          <div className="p-card__tags"><Tag material={product.material} /></div>
        )}
        <H className="p-card__title">{product.name}</H>
        {product.summary && <p className="p-card__sum">{product.summary}</p>}
        <div className="p-card__actions">
          <Link className="p-link" href={href} aria-label={`View part: ${product.name}`}>View part {ARROW}</Link>
          <Link className="p-link p-link--quiet" href={`/enquiry/?product=${product.slug}`} aria-label={`Enquire about ${product.name}`}>Enquire</Link>
        </div>
      </div>
    </article>
  );
}

export function PartGrid({ items, level = 3 }: { items: Product[]; level?: 2 | 3 }) {
  return (
    <ul className="p-grid">
      {items.map(p => <li key={p.slug}><PartCard product={p} level={level} /></li>)}
    </ul>
  );
}
