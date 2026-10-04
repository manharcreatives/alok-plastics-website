'use client';

/**
 * Slide-over mini-cart. Same dialog patterns as the navigation Drawer: focus moves in
 * and is trapped, Esc closes, the page behind is inert and scroll-locked, focus returns
 * to what opened it. Plain opaque surface (no glass: the blur effect is reserved for the nav).
 */

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { X } from '@phosphor-icons/react/dist/csr/X';
import { formatPrice } from './cart-catalog';
import CartLineRow from './CartLineRow';
import { useCart, useCartLines } from './useCart';
import './cart.css';

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function MiniCart() {
  const { isOpen, close } = useCart();
  const lines = useCartLines();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const opener = document.activeElement as HTMLElement | null;
    const main = document.querySelector('main');
    main?.setAttribute('inert', '');
    const html = document.documentElement;
    const prevOverflow = html.style.overflow;
    html.style.overflow = 'hidden';
    closeRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { close(); return; }
      if (e.key !== 'Tab' || !panelRef.current) return;
      const f = panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE);
      const first = f[0];
      const last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      main?.removeAttribute('inert');
      html.style.overflow = prevOverflow;
      opener?.focus?.();
    };
  }, [isOpen, close]);

  if (!isOpen) return null;

  const allPriced = lines.length > 0 && lines.every(l => !l.unavailable && l.price !== null);
  const total = allPriced ? lines.reduce((s, l) => s + (l.price as number) * l.qty, 0) : null;

  return (
    <div className="mc-overlay" onClick={e => { if (e.target === e.currentTarget) close(); }}>
      <div ref={panelRef} className="mc-panel" role="dialog" aria-modal="true" aria-label="Your cart" data-lenis-prevent>
        <div className="mc-head">
          <h2 className="mc-title">Your cart</h2>
          <button ref={closeRef} type="button" className="mc-close" onClick={close} aria-label="Close cart">
            <X weight="light" size={24} aria-hidden="true" />
          </button>
        </div>
        <div className="mc-body">
          {lines.length === 0 ? (
            <div className="mc-empty">
              <p>Your cart is empty.</p>
              <Link href="/products/" className="cbtn cbtn--sm" onClick={close}>Browse products</Link>
            </div>
          ) : (
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {lines.map(l => <CartLineRow key={l.slug} line={l} onNavigate={close} />)}
            </ul>
          )}
        </div>
        {lines.length > 0 && (
          <div className="mc-foot">
            <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--body)' }}>
              {total !== null ? <>Estimated total: <strong>{formatPrice(total)}</strong></> : 'Final price confirmed by Alok Plastics'}
            </p>
            <Link href="/cart/" className="cbtn cbtn--block" onClick={close}>View cart and send request</Link>
            <button type="button" className="clink clink--muted" onClick={close}>Continue shopping</button>
          </div>
        )}
      </div>
    </div>
  );
}
