'use client';

/** Header cart control: icon + count badge on mobile, icon + "Cart" pill on desktop. Opens the mini-cart. */

import { ShoppingCart } from '@phosphor-icons/react/dist/csr/ShoppingCart';
import { trackCartOpen } from '@/lib/analytics';
import { useCart } from './useCart';
import './cart.css';

export default function CartButton() {
  const { count, lines, open } = useCart();
  return (
    <button
      type="button"
      className="cart-btn"
      aria-haspopup="dialog"
      aria-label={count > 0 ? `Cart, ${count} ${count === 1 ? 'item' : 'items'}` : 'Cart, empty'}
      onClick={() => { trackCartOpen({ source: 'header', lineCount: lines.length }); open(); }}
    >
      <ShoppingCart weight="light" size={22} aria-hidden="true" />
      <span className="cart-btn__label" aria-hidden="true">Cart</span>
      {count > 0 && <span className="cart-btn__badge" aria-hidden="true">{count > 99 ? '99+' : count}</span>}
    </button>
  );
}
