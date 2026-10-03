'use client';

/** One cart line: image, name, SKU, price or "Price on request", stepper, remove, and honest stock / availability notes. */

import { useState } from 'react';
import Link from 'next/link';
import { Trash } from '@phosphor-icons/react/dist/csr/Trash';
import { productPath } from '@/content/products';
import { formatPrice } from './cart-catalog';
import QtyStepper from './QtyStepper';
import { useCart, type ResolvedLine } from './useCart';
import './cart.css';

export default function CartLineRow({ line, onNavigate }: { line: ResolvedLine; onNavigate?: () => void }) {
  const cart = useCart();
  const [limit, setLimit] = useState(false);
  const p = line.product;
  const name = p?.name ?? line.slug.replace(/-/g, ' ');
  const img = p?.images?.[0];
  const href = p && !line.unavailable ? productPath(p) : null;
  const gone = line.unavailable;

  return (
    <li className={`cl${gone ? ' cl--gone' : ''}`}>
      <div className="cl__img" aria-hidden="true">
        {img && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={img.src} alt="" width={img.w || undefined} height={img.h || undefined} loading="lazy" decoding="async" />
        )}
      </div>
      <div style={{ minWidth: 0 }}>
        <p className="cl__name">
          {href ? <Link href={href} onClick={onNavigate}>{name}</Link> : name}
        </p>
        {p?.sku && <p className="cl__meta">SKU: {p.sku}</p>}
        {!gone && (
          <p className={`cl__price${line.price === null ? ' cl__price--ask' : ''}`}>
            {line.price === null ? 'Price on request' : `${formatPrice(line.price)} each`}
          </p>
        )}

        {gone ? (
          <p className="cl__warn" role="alert">
            This product is no longer available. Please remove it from your cart.
          </p>
        ) : line.outOfStock ? (
          <p className="cl__warn" role="alert">This product is out of stock. Please remove it from your cart.</p>
        ) : line.overStock && line.max ? (
          <p className="cl__warn" role="alert">Only {line.max} units available.</p>
        ) : null}

        <div className="cl__ctl">
          {!gone && (
            <QtyStepper
              value={line.qty}
              onChange={n => { setLimit(false); cart.setQty(line.slug, n); }}
              max={line.max !== null && line.max > 0 ? Math.max(line.max, 1) : null}
              label={`Quantity for ${name}`}
              onLimit={() => setLimit(true)}
            />
          )}
          <button type="button" className="clink clink--muted" onClick={() => cart.remove(line.slug)} aria-label={`Remove ${name} from cart`}>
            <Trash weight="light" size={18} aria-hidden="true" />
            Remove
          </button>
        </div>
        {limit && line.max ? <p className="cl__meta" role="status" style={{ color: 'var(--error)' }}>Only {line.max} units available.</p> : null}
      </div>
    </li>
  );
}
