'use client';
/**
 * Buy box for the product page: SKU, material, price (or "Price on request"), availability,
 * quantity + Add to cart (owned by AddToCart), and the secondary Get a quote / Call actions.
 * Inactive and archived products stay reachable but cannot be added to the cart.
 */
import Link from 'next/link';
import { Info } from '@phosphor-icons/react/dist/ssr/Info';
import Tag from '@/components/ui/Tag';
import AddToCart from '@/components/cart/AddToCart';
import type { Product } from '@/content/types';
import { canAddToCart, formatInr, type PdpCommerce } from './pdp-data';
import { useCommerce } from './useCommerce';
import ProductCta from './ProductCta';
import './products.css';
import './pdp.css';

export function AvailabilityBadge({ commerce }: { commerce: PdpCommerce }) {
  if (commerce.unavailable) return <span className="p-avail p-avail--off">No longer available</span>;
  if (commerce.availability === 'out-of-stock') return <span className="p-avail p-avail--out">Out of stock</span>;
  if (commerce.availability === 'in-stock') return <span className="p-avail p-avail--in">In stock</span>;
  return <span className="p-avail p-avail--ask">Availability on request</span>;
}

export function lowStockHint(c: PdpCommerce): string | null {
  if (c.unavailable || c.availability !== 'in-stock' || c.stock === null || c.stock <= 0 || c.stock > 10) return null;
  return `Only ${c.stock} unit${c.stock === 1 ? '' : 's'} available`;
}

export default function ProductBuyBox({ product: base }: { product: Product }) {
  const { product, commerce } = useCommerce(base);
  const hint = lowStockHint(commerce);
  const buyable = canAddToCart(commerce);

  return (
    <div className="p-buy">
      {commerce.unavailable && (
        <div className="p-notice" role="status">
          <Info size={20} weight="light" aria-hidden="true" />
          <div>
            <strong>This product is no longer available.</strong>
            <p>You can still enquire, or see similar products below.</p>
          </div>
        </div>
      )}

      <div className="p-buy__meta">
        {product.sku && <span className="p-buy__sku">SKU {product.sku}</span>}
        {product.material && <Tag material={product.material} />}
        {commerce.brand && <span className="p-buy__sku">{commerce.brand}</span>}
      </div>

      <div className="p-buy__price" aria-live="polite">
        {commerce.price !== null && !commerce.unavailable ? (
          <>
            <span className="p-price">{formatInr(commerce.price)}</span>
            <span className="p-price__note">Price per piece, excluding GST and delivery</span>
          </>
        ) : (
          <span className="p-price p-price--ask">Price on request</span>
        )}
      </div>

      <div className="p-buy__avail">
        <AvailabilityBadge commerce={commerce} />
        {hint && <span className="p-buy__hint">{hint}</span>}
      </div>

      {buyable ? (
        <div className="p-buy__add"><AddToCart product={product} /></div>
      ) : (
        <div className="p-buy__add">
          <button type="button" className="p-btn p-btn--primary" disabled aria-disabled="true">
            {commerce.unavailable ? 'Not available' : 'Out of stock'}
          </button>
          {!commerce.unavailable && (
            <Link className="p-link" href={`/enquiry/?product=${product.slug}`}>Ask when it is back</Link>
          )}
        </div>
      )}

      <ProductCta slug={product.slug} />
      <p className="p-buy__note">Price, stock, delivery and payment are confirmed by Alok Plastics on WhatsApp. Sending an order request does not confirm an order.</p>
    </div>
  );
}
