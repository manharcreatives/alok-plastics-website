/**
 * Sticky bar for the product detail page. Desktop: Get a Quote + Call (the buy box holds the
 * cart). Mobile: price and availability, Add to cart, and a WhatsApp enquiry, so the bar never
 * repeats what is already on screen. Client component so it follows the runtime phone, price and stock.
 */
'use client';

import Link from 'next/link';
import { ArrowUpRight } from '@phosphor-icons/react/dist/ssr/ArrowUpRight';
import { Phone } from '@phosphor-icons/react/dist/ssr/Phone';
import { WhatsappLogo } from '@phosphor-icons/react/dist/ssr/WhatsappLogo';
import AddToCart from '@/components/cart/AddToCart';
import { telHref } from '@/content/site';
import type { Product } from '@/content/types';
import { useRuntimeContact } from '@/components/runtime/useRuntime';
import { waProduct } from '@/lib/whatsapp';
import { canAddToCart, formatInr } from './pdp-data';
import { useCommerce } from './useCommerce';
import { AvailabilityBadge } from './ProductBuyBox';
import './products.css';
import './pdp.css';

export default function StickyEnquiryBar({ product: base }: { product: Product }) {
  const { phone, whatsapp } = useRuntimeContact();
  const { product, commerce } = useCommerce(base);
  const wa = waProduct({ productName: product.name }, whatsapp);
  const buyable = canAddToCart(commerce);
  return (
    <aside className="p-bar" aria-label={`Enquire about ${product.name}`}>
      <div className="p-bar__in">
        <div className="p-bar__id">
          <span className="p-bar__name">{product.name}</span>
          <span className="p-bar__sub">
            {commerce.price !== null && !commerce.unavailable
              ? <strong className="p-bar__price">{formatInr(commerce.price)}</strong>
              : <span className="p-bar__price p-bar__price--ask">Price on request</span>}
            <AvailabilityBadge commerce={commerce} />
          </span>
        </div>
        <div className="p-bar__btns">
          {buyable && <div className="p-bar__cart"><AddToCart product={product} compact /></div>}
          {wa && (
            <a className="p-btn p-btn--ghost p-bar__wa" href={wa} target="_blank" rel="noopener noreferrer">
              <WhatsappLogo size={18} weight="light" aria-hidden="true" /> Enquire<span className="p-sr"> on WhatsApp (opens in a new tab)</span>
            </a>
          )}
          {phone && (
            <a className="p-btn p-btn--ghost p-bar__call" href={telHref(phone)}>
              <Phone size={18} weight="light" aria-hidden="true" /> Call
            </a>
          )}
          <Link className={`p-btn p-btn--primary p-bar__quote${buyable ? " p-bar__quote--alt" : ""}`} href={`/enquiry/?product=${product.slug}`}>
            Get a Quote <ArrowUpRight size={18} weight="light" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </aside>
  );
}
