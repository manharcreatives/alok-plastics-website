'use client';
/**
 * PartCard — a catalogue plate: the part drawn on a grid with crop marks. The pictogram is the
 * placeholder; the product photo (/images/products/<slug>.webp, 1:1) fades in over it once the file
 * exists (PhotoBg renders nothing when the file is missing). Photos an owner uploads in the admin
 * replace the plate entirely.
 * Price only when the admin set one, else "Price on request". Availability only claims
 * "In stock" when the admin set it (availabilityOf). Unknown fields are omitted.
 */
import HideWhenHidden from '@/components/runtime/HideWhenHidden';
import { useRuntimeProduct } from '@/components/runtime/useRuntime';
import Link from 'next/link';
import { ArrowUpRight } from '@phosphor-icons/react/dist/ssr/ArrowUpRight';
import PartPicto, { pictogramFor } from './PartPicto';
import Tag from '@/components/ui/Tag';
import PhotoBg from '@/components/ui/PhotoBg';
import AddToCart from '@/components/cart/AddToCart';
import { getGroup, productPath, productPhoto } from '@/content/products';
import type { Product } from '@/content/types';
import { availabilityOf, formatPrice, type Availability } from '@/lib/catalog-search';
import './products.css';

export { pictogramFor };

export function PartArt({ product: base, photoAlt = '', priority = false, photo: withPhoto = true }: { product: Product; photoAlt?: string; priority?: boolean; photo?: boolean }) {
  const product = useRuntimeProduct(base);
  const img = product.images[0]; // only photos uploaded in the admin panel live here; the old catalogue crops are not shown
  if (img) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={img.src} alt={img.alt} width={img.w || undefined} height={img.h || undefined} loading="lazy" decoding="async" />;
  }
  const name = pictogramFor(product.slug);
  const photo = withPhoto ? productPhoto(product) : null;
  return (
    <>
      {name ? <PartPicto slug={name} size={48} className="p-picto" /> : (
        <span aria-hidden="true" className="p-plate"><span className="p-plate__cap">Drawing to come</span></span>
      )}
      {photo && <PhotoBg src={photo} alt={photoAlt} width={1200} height={1200} priority={priority} />}
    </>
  );
}

/** Listed price in INR, only when the owner set one (never 0, never invented). */
export function priceOf(p: Product): number | null {
  const v = (p as { price?: unknown }).price;
  const n = typeof v === 'number' ? v : v && typeof v === 'object' ? (v as { amount?: unknown }).amount : null;
  return typeof n === 'number' && Number.isFinite(n) && n > 0 ? n : null;
}

const AVAIL_LABEL: Record<Availability, string> = {
  'in-stock': 'In stock',
  'out-of-stock': 'Out of stock',
  'on-request': 'Availability on request',
};

export function AvailabilityBadge({ product }: { product: Product }) {
  const a = availabilityOf(product);
  return <span className={`p-avail p-avail--${a}`}>{AVAIL_LABEL[a]}</span>;
}

export default function PartCard({ product: base, level = 3 }: { product: Product; level?: 2 | 3 }) {
  const product = useRuntimeProduct(base);
  const H = `h${level}` as 'h2' | 'h3';
  const href = productPath(product);
  const group = product.group ? getGroup(product.group) : undefined;
  const price = priceOf(product);
  const out = availabilityOf(product) === 'out-of-stock';
  return (
    <article className="p-card">
      <div className="p-card__art">
        <PartArt product={product} />
        {product.material && <span className="p-card__mat"><Tag material={product.material} /></span>}
      </div>
      <div className="p-card__body">
        {group && <p className="p-card__group">{group.name}</p>}
        <H className="p-card__title">
          <Link className="p-card__go" href={href}>{product.name}</Link>
        </H>
        {product.sku && <p className="p-card__sku">SKU {product.sku}</p>}
        <p className="p-card__price">{price !== null ? formatPrice(price) : <span className="p-card__por">Price on request</span>}</p>
        <AvailabilityBadge product={product} />
        {!out && <div className="p-card__buy"><AddToCart product={product} compact /></div>}
        <Link className="p-link p-card__more" href={href} aria-label={`View details: ${product.name}`}>
          View details <ArrowUpRight size={18} weight="light" aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}

export function PartGrid({ items, level = 3 }: { items: Product[]; level?: 2 | 3 }) {
  return (
    <ul className="p-grid">
      {items.map(p => <HideWhenHidden key={p.slug} slug={p.slug}><li><PartCard product={p} level={level} /></li></HideWhenHidden>)}
    </ul>
  );
}
