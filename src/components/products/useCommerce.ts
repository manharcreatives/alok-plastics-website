'use client';
import { useMemo } from 'react';
import type { Product } from '@/content/types';
import { useHiddenProductSlugs, useProductOverride, useRuntimeProduct } from '@/components/runtime/useRuntime';
import { commerceOf, type PdpCommerce } from './pdp-data';

/** Merged product + its commerce state, from the runtime bundle (build-time values until it arrives). */
export function useCommerce(base: Product): { product: Product; commerce: PdpCommerce } {
  const product = useRuntimeProduct(base);
  const o = useProductOverride(base.slug);
  const hiddenSet = useHiddenProductSlugs();
  const hidden = hiddenSet.has(base.slug);
  const commerce = useMemo(() => commerceOf(product, o, hidden), [product, o, hidden]);
  return { product, commerce };
}
