/**
 * Commerce fields for the product page, read defensively. The owner sets price, stock,
 * availability, status and keywords in the admin panel (runtime products.json); none of
 * them exist at build time. Nothing here invents a value: no price means "Price on request",
 * no availability means "On request" (never "In stock").
 */
import type { Product } from '@/content/types';

export type PdpAvailability = 'in-stock' | 'out-of-stock' | 'on-request';

export interface PdpCommerce {
  price: number | null;
  availability: PdpAvailability;
  stock: number | null;
  /** true when the product is inactive, archived or hidden */
  unavailable: boolean;
  keywords: string[];
  brand: string | null;
}

type Loose = {
  price?: unknown;
  availability?: unknown;
  stock?: unknown;
  status?: unknown;
  keywords?: unknown;
  brand?: unknown;
};

function num(v: unknown): number | null {
  if (typeof v === 'number' && Number.isFinite(v) && v >= 0) return v;
  if (v && typeof v === 'object' && 'amount' in v) return num((v as { amount: unknown }).amount);
  return null;
}

/** `merged` is the override-merged product; `override` the raw runtime entry (either may carry the fields). */
export function commerceOf(merged: Product, override?: unknown, hidden = false): PdpCommerce {
  const a = (merged ?? {}) as Loose;
  const b = (override ?? {}) as Loose;
  const price = num(b.price) ?? num(a.price);
  const stockRaw = b.stock ?? a.stock;
  const stock = typeof stockRaw === 'number' && Number.isInteger(stockRaw) && stockRaw >= 0 ? stockRaw : null;
  const av = b.availability ?? a.availability;
  let availability: PdpAvailability = 'on-request';
  const zero = stock !== null && stock <= 0;
  if (zero) availability = 'out-of-stock';
  else if (av === 'in-stock' || av === 'out-of-stock' || av === 'on-request') availability = av;
  else if (stock !== null) availability = stock > 0 ? 'in-stock' : 'out-of-stock';
  const status = b.status ?? a.status;
  const kw = b.keywords ?? a.keywords;
  const brand = b.brand ?? a.brand;
  return {
    price,
    availability,
    stock,
    unavailable: hidden || status === 'inactive' || status === 'archived',
    keywords: Array.isArray(kw) ? kw.filter((k): k is string => typeof k === 'string' && k.trim() !== '') : [],
    brand: typeof brand === 'string' && brand.trim() ? brand.trim() : null,
  };
}

export function formatInr(n: number): string {
  return `₹${new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(n)}`;
}

/** Purchasable = listed, not out of stock, and a stock figure (when known) above zero. */
export function canAddToCart(c: PdpCommerce): boolean {
  return !c.unavailable && c.availability !== 'out-of-stock' && !(c.stock !== null && c.stock === 0);
}
