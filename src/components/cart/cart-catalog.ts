/**
 * The cart's view of a product. Availability, stock cap, price formatting and
 * listability come from the shared catalogue module so the cart never disagrees with
 * the catalogue. Nothing is invented: no price => null ("Price on request").
 */
import type { Product } from '@/content/types';

export { availabilityOf, formatPrice, isListable, maxOrderQty } from '@/lib/catalog-search';
export type { Availability } from '@/lib/catalog-search';

/** Absolute ceiling when the owner has not set a stock number. */
export const CART_QTY_CEILING = 9999;

/** The admin-set price, or null (never 0, never the printed-catalogue price). */
export function priceOf(p: Product): number | null {
  return typeof p.price === 'number' && Number.isFinite(p.price) && p.price >= 0 ? p.price : null;
}
