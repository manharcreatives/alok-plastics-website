'use client';

/**
 * CartProvider: owns the mini-cart open state and mounts the slide-over plus the
 * mobile "N items · View cart" bar (catalogue routes only). Cart data itself lives in
 * the localStorage-backed store in useCart.ts.
 */

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingCart } from '@phosphor-icons/react/dist/csr/ShoppingCart';
import { trackCartOpen } from '@/lib/analytics';
import { syncCart, useSession } from '@/lib/auth-client';
import MiniCart from './MiniCart';
import { CartUiContext, useCart, useCartLines } from './useCart';
import './cart.css';

function CartBar() {
  const pathname = usePathname() ?? '';
  const { count, lines } = useCart();
  /* Catalogue and group pages only; product pages keep their own sticky enquiry bar. */
  const segments = pathname.split('/').filter(Boolean);
  const onCatalogue = segments[0] === 'products' && segments.length <= 2;
  if (!onCatalogue || count === 0) return null;
  return (
    <Link href="/cart/" className="cbar" onClick={() => trackCartOpen({ source: 'bar', lineCount: lines.length })}>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-xs)' }}>
        <ShoppingCart weight="light" size={20} aria-hidden="true" />
        {count} {count === 1 ? 'item' : 'items'}
      </span>
      <span>View cart</span>
    </Link>
  );
}

/** Mirrors the cart to the server (debounced) so the admin panel's "Live carts" page can see it. */
function CartSync() {
  const lines = useCartLines();
  const session = useSession();
  const token = session?.token;
  const payload = useMemo(
    () => lines.filter(l => l.product && !l.unavailable).map(l => ({
      slug: l.slug,
      name: l.product?.name ?? l.slug,
      sku: l.product?.sku ?? '',
      qty: l.qty,
      price: l.price,
      availability: l.availability,
    })),
    [lines],
  );
  const key = JSON.stringify(payload);
  const first = useRef(true);
  useEffect(() => {
    /* Skip the empty initial render so opening the site never wipes a stored server cart. */
    const isFirst = first.current;
    first.current = false;
    if (isFirst && payload.length === 0) return;
    const t = setTimeout(() => { void syncCart(payload, token); }, 1200);
    return () => clearTimeout(t);
  }, [key, token]); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}

export default function CartProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [isOpen, setOpen] = useState(false);
  const [prevPath, setPrevPath] = useState(pathname);
  if (prevPath !== pathname) {
    setPrevPath(pathname);
    setOpen(false);
  }
  const open = useCallback(() => setOpen(true), []);
  const close = useCallback(() => setOpen(false), []);
  const ui = useMemo(() => ({ isOpen, open, close }), [isOpen, open, close]);

  return (
    <CartUiContext.Provider value={ui}>
      {children}
      <MiniCart />
      <CartSync />
      <CartBar />
    </CartUiContext.Provider>
  );
}
