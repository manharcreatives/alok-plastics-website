/**
 * Shared building blocks for the company pages (/about, /career).
 * Tokens only; spacing from the --space-* scale. No numbered labels (round 2, ask 9).
 */
import type { ReactNode } from 'react';

export const WRAP_STYLE = {
  maxWidth: 'calc(var(--grid-max) + 2 * var(--grid-page-padding))',
  margin: '0 auto',
} as const;

export const SECTION_CSS = `
.cp-section { padding: var(--section-y) var(--grid-page-padding); position: relative; }
.cp-link { display: inline-flex; align-items: center; gap: var(--space-xs); min-height: 44px; color: var(--burgundy); font-weight: 600; text-decoration: none; border-bottom: 1px solid transparent; }
.cp-link:hover { color: var(--burgundy-bright); border-bottom-color: currentColor; }
.cp-link:focus-visible { outline: 2px solid var(--burgundy); outline-offset: 2px; }
.cp-link svg { transition: transform 200ms cubic-bezier(.16,1,.3,1); }
.cp-link:hover svg { transform: translate3d(2px, -2px, 0); }
.cp-btn { display: inline-flex; align-items: center; justify-content: center; gap: var(--space-xs); min-height: 48px; padding: 0 var(--space-md); border-radius: var(--radius-card); font-weight: 600; font-size: 0.9375rem; text-decoration: none; background: var(--burgundy); color: var(--surface); border: 1px solid var(--burgundy); transition: background-color 200ms, color 200ms; }
.cp-btn:hover { background: var(--burgundy-deep); border-color: var(--burgundy-deep); }
.cp-btn--ghost { background: transparent; color: var(--burgundy); }
.cp-btn--ghost:hover { background: var(--blush); color: var(--burgundy-deep); }
.cp-btn:focus-visible { outline: 2px solid var(--burgundy); outline-offset: 2px; }
.cp-btn svg { transition: transform 200ms cubic-bezier(.16,1,.3,1); }
.cp-btn:hover svg { transform: translate3d(2px, -2px, 0); }
.cp-eyebrow { display: flex; align-items: center; gap: var(--space-xs); margin-bottom: var(--space-sm); font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.16em; color: var(--grey-metal-text); font-weight: 600; line-height: 1; }
.cp-eyebrow i { width: 24px; height: 2px; background: var(--burgundy); display: inline-block; flex: none; }
.cp-eyebrow--dark { color: var(--rose-pale); }
.cp-eyebrow--dark i { background: var(--rose-pale); }
.cp-h2 { font-family: var(--font-archivo); font-variation-settings: "wdth" 125; font-size: clamp(1.75rem, 3.6vw, 3rem); font-weight: 650; line-height: 1.08; letter-spacing: -0.03em; color: var(--ink); text-wrap: balance; margin: 0; }
.cp-lead { margin: var(--space-sm) 0 0; color: var(--body); line-height: 1.65; font-size: 1.0625rem; max-width: 56ch; }
.cp-sheet { position: relative; background: var(--surface); border: 1px solid var(--grey-metal); }
.cp-sheet::before, .cp-sheet::after { content: ''; position: absolute; width: 10px; height: 10px; border: 1px solid var(--grey-metal); }
.cp-sheet::before { top: -7px; left: -7px; border-right: 0; border-bottom: 0; }
.cp-sheet::after { bottom: -7px; right: -7px; border-left: 0; border-top: 0; }
@media (prefers-reduced-motion: reduce) { .cp-link svg, .cp-btn svg { transition: none; } }
`;

/** Micro label + rule (no numbering). */
export function Eyebrow({ children, dark }: { children: ReactNode; dark?: boolean }) {
  return <p className={`cp-eyebrow${dark ? ' cp-eyebrow--dark' : ''}`}><i aria-hidden="true" />{children}</p>;
}

export function SectionHead({ id, label, title, lead }: { id: string; label: string; title: ReactNode; lead?: ReactNode }) {
  return (
    <header style={{ marginBottom: 'var(--space-xl)', maxWidth: '40rem' }}>
      <Eyebrow>{label}</Eyebrow>
      <h2 id={id} className="cp-h2">{title}</h2>
      {lead && <p className="cp-lead">{lead}</p>}
    </header>
  );
}
