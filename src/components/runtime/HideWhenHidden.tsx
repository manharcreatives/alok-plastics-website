'use client';

import type { ReactNode } from 'react';
import { useHiddenProductSlugs } from './useRuntime';

/** Renders its children unless the owner has hidden this product slug in the panel. */
export default function HideWhenHidden({ slug, children }: { slug: string; children: ReactNode }) {
  return useHiddenProductSlugs().has(slug) ? null : <>{children}</>;
}
