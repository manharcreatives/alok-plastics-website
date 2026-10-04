'use client';

import { useProductOverride } from './useRuntime';

type Field = 'name' | 'summary' | 'description';

/**
 * One product text field: the build-time string in the HTML, the owner's edit after
 * hydration. Plain text node only — never HTML.
 */
export default function ProductText({ slug, field, fallback }: { slug: string; field: Field; fallback?: string }) {
  const o = useProductOverride(slug);
  return <>{o?.[field] ?? fallback ?? ''}</>;
}
