/**
 * Highlight: marks the first occurrence of ONE keyword inside a plain-text string.
 * Density rule: one highlighted keyword per visible section, never two sections in a row.
 * Decorative only: the sentence reads the same without it. Static, no innerHTML, SSR safe.
 * Never use inside H1, links, buttons, labels, gradient-text parents or legal pages.
 */

import type { ReactNode } from 'react';

interface HighlightProps {
  /** Candidate keywords; the longest one found in `children` is highlighted. */
  keywords: readonly string[];
  /** Plain text. Anything else is returned untouched. */
  children: ReactNode;
  /** Burgundy panels need the light variant. */
  onDark?: boolean;
}

export default function Highlight({ keywords, children, onDark = false }: HighlightProps) {
  if (typeof children !== 'string') return <>{children}</>;
  const lower = children.toLowerCase();
  const hit = [...keywords]
    .filter(k => k.trim() !== '')
    .sort((a, b) => b.length - a.length)
    .map(k => ({ k, i: lower.indexOf(k.toLowerCase()) }))
    .find(m => m.i !== -1);
  if (!hit) return <>{children}</>;
  const end = hit.i + hit.k.length;
  return (
    <>
      {children.slice(0, hit.i)}
      <mark className={onDark ? 'kw kw--on-dark' : 'kw'}>{children.slice(hit.i, end)}</mark>
      {children.slice(end)}
    </>
  );
}
