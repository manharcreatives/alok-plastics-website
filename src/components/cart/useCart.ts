'use client';

/**
 * Cart state. Stores ONLY {slug, qty} in localStorage (`alok:cart:v1`) and resolves
 * products at render from the merged runtime catalogue, so admin edits, price and
 * status changes apply live and a stale price can never be sent.
 *
 * An external store (useSyncExternalStore): SSR and first client render are both
 * empty, then the stored cart appears without a hydration mismatch. Every storage
 * access is try/catch (private mode, blocked storage fall back to memory), and other
 * tabs are followed through the `storage` event.
 */

import { createContext, useContext, useMemo, useSyncExternalStore } from 'react';
import { products as allProducts } from '@/content/products';
import type { Product } from '@/content/types';
import { useHiddenProductSlugs, useRuntimeCustomProducts, useRuntimeProducts } from '@/components/runtime/useRuntime';
import { CART_QTY_CEILING, availabilityOf, isListable, maxOrderQty, priceOf, type Availability } from './cart-catalog';

export const CART_KEY = 'alok:cart:v1';

export interface CartLine { slug: string; qty: number }

/* ── store ─────────────────────────────────────────────────────────────── */

const EMPTY: CartLine[] = [];
let current: CartLine[] = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

function sanitize(input: unknown): CartLine[] {
  const arr = input && typeof input === 'object' ? (input as { lines?: unknown }).lines : null;
  if (!Array.isArray(arr)) return EMPTY;
  const seen = new Set<string>();
  const out: CartLine[] = [];
  for (const l of arr.slice(0, 100)) {
    if (!l || typeof l !== 'object') continue;
    const slug = (l as CartLine).slug;
    const qty = Math.floor(Number((l as CartLine).qty));
    if (typeof slug !== 'string' || !slug || slug.length > 120 || seen.has(slug)) continue;
    if (!Number.isFinite(qty) || qty < 1) continue;
    seen.add(slug);
    out.push({ slug, qty: Math.min(qty, CART_QTY_CEILING) });
  }
  return out.length ? out : EMPTY;
}

function readStorage(): CartLine[] {
  try {
    const stored = window.localStorage.getItem(CART_KEY);
    if (!stored) return EMPTY;
    const parsed = JSON.parse(stored) as { v?: number };
    return parsed && parsed.v === 1 ? sanitize(parsed) : EMPTY;
  } catch {
    return current; /* unreadable: keep what memory has */
  }
}

function writeStorage(lines: CartLine[]): void {
  try {
    if (lines.length === 0) window.localStorage.removeItem(CART_KEY);
    else window.localStorage.setItem(CART_KEY, JSON.stringify({ v: 1, lines }));
  } catch { /* storage blocked: the in-memory cart still works for this visit */ }
}

function emit(): void { listeners.forEach(l => l()); }

function ensureLoaded(): void {
  if (loaded || typeof window === 'undefined') return;
  loaded = true;
  current = readStorage();
  window.addEventListener('storage', e => {
    if (e.key !== CART_KEY && e.key !== null) return;
    current = readStorage();
    emit();
  });
}

function subscribe(cb: () => void): () => void {
  ensureLoaded();
  listeners.add(cb);
  return () => { listeners.delete(cb); };
}
const getSnapshot = (): CartLine[] => { ensureLoaded(); return current; };
const getServerSnapshot = (): CartLine[] => EMPTY;

function commit(next: CartLine[]): void {
  current = next.length ? next : EMPTY;
  writeStorage(current);
  emit();
}

/* ── context (drawer open state lives in the provider) ─────────────────── */

export interface CartUi { isOpen: boolean; open: () => void; close: () => void }

export const CartUiContext = createContext<CartUi>({ isOpen: false, open: () => {}, close: () => {} });

export interface CartApi extends CartUi {
  lines: CartLine[];
  /** Total units across all lines. */
  count: number;
  /** Adds qty to the line, clamped to stock. Reports the resulting line qty and whether it was clamped. */
  add: (product: Product, qty: number) => { qty: number; clamped: boolean; max: number | null };
  setQty: (slug: string, qty: number) => void;
  remove: (slug: string) => void;
  clear: () => void;
}

function clampQty(qty: number, max: number | null): number {
  const n = Math.max(1, Math.floor(Number.isFinite(qty) ? qty : 1));
  return Math.min(n, max !== null && max > 0 ? max : CART_QTY_CEILING, CART_QTY_CEILING);
}

const actions = {
  add(product: Product, qty: number) {
    const max = maxOrderQty(product);
    if (max === 0) return { qty: 0, clamped: true, max };
    const existing = current.find(l => l.slug === product.slug)?.qty ?? 0;
    const wanted = existing + Math.max(1, Math.floor(qty || 1));
    const next = clampQty(wanted, max);
    commit(existing
      ? current.map(l => (l.slug === product.slug ? { ...l, qty: next } : l))
      : [...current, { slug: product.slug, qty: next }]);
    return { qty: next, clamped: next < wanted, max };
  },
  setQty(slug: string, qty: number) {
    commit(current.map(l => (l.slug === slug ? { ...l, qty: clampQty(qty, null) } : l)));
  },
  remove(slug: string) { commit(current.filter(l => l.slug !== slug)); },
  clear() { commit(EMPTY); },
};

export function useCart(): CartApi {
  const lines = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const ui = useContext(CartUiContext);
  const count = useMemo(() => lines.reduce((n, l) => n + l.qty, 0), [lines]);
  return { lines, count, ...ui, ...actions };
}

/* ── resolved lines ────────────────────────────────────────────────────── */

export interface ResolvedLine {
  slug: string;
  qty: number;
  product: Product | null;
  /** Unknown, inactive, archived or hidden: cannot be sent. */
  unavailable: boolean;
  price: number | null;
  availability: Availability;
  max: number | null;
  /** qty exceeds known stock */
  overStock: boolean;
  /** admin marked it out of stock: blocks sending until removed */
  outOfStock: boolean;
}

/** Cart lines resolved against the live merged catalogue (runtime edits applied). */
export function useCartLines(): ResolvedLine[] {
  const { lines } = useCart();
  const merged = useRuntimeProducts(allProducts);
  const customs = useRuntimeCustomProducts();
  const hidden = useHiddenProductSlugs();
  return useMemo(() => {
    const bySlug = new Map([...merged, ...customs].map(p => [p.slug, p]));
    return lines.map((l): ResolvedLine => {
      const product = bySlug.get(l.slug) ?? null;
      const unavailable = !product || hidden.has(l.slug) || !isListable(product);
      const availability = product ? availabilityOf(product) : 'on-request';
      const max = product ? (availability === 'out-of-stock' ? 0 : maxOrderQty(product)) : null;
      return {
        slug: l.slug,
        qty: l.qty,
        product,
        unavailable,
        price: product ? priceOf(product) : null,
        availability,
        max,
        overStock: !unavailable && max !== null && max > 0 && l.qty > max,
        outOfStock: !unavailable && availability === 'out-of-stock',
      };
    });
  }, [lines, merged, customs, hidden]);
}
