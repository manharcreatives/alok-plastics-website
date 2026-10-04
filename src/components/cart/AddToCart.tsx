'use client';

/**
 * AddToCart: qty stepper + "Add to cart". Out-of-stock products render a disabled
 * "Out of stock" button. Quantity is clamped to the owner's stock figure (when set)
 * with "Only N units available."; success is announced inline with a "View cart" link.
 */

import { useEffect, useRef, useState } from 'react';
import { ShoppingCart } from '@phosphor-icons/react/dist/csr/ShoppingCart';
import type { Product } from '@/content/types';
import { trackAddToCart, trackCartOpen } from '@/lib/analytics';
import { availabilityOf, maxOrderQty } from './cart-catalog';
import QtyStepper from './QtyStepper';
import { useCart } from './useCart';
import './cart.css';

interface Props {
  product: Product;
  compact?: boolean;
}

export default function AddToCart({ product, compact = false }: Props) {
  const cart = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [limitMsg, setLimitMsg] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const out = availabilityOf(product) === 'out-of-stock';
  const max = maxOrderQty(product);
  const inCart = cart.lines.find(l => l.slug === product.slug)?.qty ?? 0;
  const msg = (n: number) => `Only ${n} units available.`;

  if (out) {
    return (
      <div className={`atc${compact ? ' atc--compact' : ''}`}>
        <button type="button" className="cbtn cbtn--sm" disabled>Out of stock</button>
      </div>
    );
  }

  const onAdd = () => {
    const res = cart.add(product, qty);
    if (res.qty === 0) return;
    trackAddToCart({ productSlug: product.slug, qty, source: compact ? 'card' : 'product' });
    setLimitMsg(res.clamped && res.max ? msg(res.max) : null);
    setAdded(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setAdded(false), 6000);
  };

  const viewCart = () => {
    trackCartOpen({ source: 'added', lineCount: cart.lines.length });
    cart.open();
  };

  return (
    <div className={`atc${compact ? ' atc--compact' : ''}`}>
      <div className="atc__row">
        <QtyStepper
          value={qty}
          onChange={n => { setQty(n); setLimitMsg(null); }}
          max={max !== null && max > 0 ? Math.max(1, max - inCart) : null}
          label={`Quantity for ${product.name}`}
          onLimit={() => max && setLimitMsg(msg(max))}
        />
        <button type="button" className="cbtn cbtn--sm" onClick={onAdd}>
          <ShoppingCart weight="light" size={18} aria-hidden="true" />
          Add to cart
        </button>
      </div>
      <p className={`atc__msg${limitMsg ? ' atc__msg--warn' : ''}`} role="status" aria-live="polite">
        {limitMsg}
        {added && (
          <span className="atc__ok">
            {limitMsg ? ' ' : ''}Added to cart
            <button type="button" onClick={viewCart}>View cart</button>
          </span>
        )}
      </p>
    </div>
  );
}
