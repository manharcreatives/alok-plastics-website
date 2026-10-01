/**
 * Shared building blocks for the company pages (/about, /industries, /career).
 * Tokens only; spacing from the --space-* scale.
 */
import type { ReactNode } from 'react';

export const ARROW_NE = '↗︎';

export const WRAP_STYLE = {
  maxWidth: 'calc(var(--grid-max) + 2 * var(--grid-page-padding))',
  margin: '0 auto',
} as const;

export const SECTION_CSS = `
.cp-section { padding: var(--section-y) var(--grid-page-padding); }
.cp-grid { display: grid; grid-template-columns: minmax(0, 1fr); gap: var(--space-md); list-style: none; margin: 0; padding: 0; }
.cp-card { background: var(--surface); border: 1px solid var(--grey-warm); border-radius: var(--radius-card); padding: var(--space-md); min-width: 0; }
.cp-card h3 { font-family: var(--font-archivo); font-variation-settings: "wdth" 125; font-size: 1.0625rem; font-weight: 650; letter-spacing: -0.01em; color: var(--ink); margin: 0 0 var(--space-xs); }
.cp-card p { font-size: 0.9375rem; line-height: 1.6; color: var(--body); margin: 0; }
.cp-link { display: inline-flex; align-items: center; gap: var(--space-xs); min-height: 44px; color: var(--burgundy); font-weight: 600; text-decoration: none; border-bottom: 1px solid transparent; }
.cp-link:hover { color: var(--burgundy-bright); border-bottom-color: currentColor; }
.cp-link:focus-visible, .cp-card a:focus-visible { outline: 2px solid var(--burgundy); outline-offset: 2px; }
.cp-btn { display: inline-flex; align-items: center; justify-content: center; gap: var(--space-xs); min-height: 48px; padding: 0 var(--space-md); border-radius: var(--radius-card); font-weight: 600; font-size: 0.9375rem; text-decoration: none; background: var(--burgundy); color: var(--surface); border: 1px solid var(--burgundy); }
.cp-btn:hover { background: var(--burgundy-deep); border-color: var(--burgundy-deep); }
.cp-btn--ghost { background: transparent; color: var(--burgundy); }
.cp-btn--ghost:hover { background: var(--surface-alt); color: var(--burgundy-deep); }
.cp-btn:focus-visible { outline: 2px solid var(--burgundy); outline-offset: 2px; }
@media (min-width: 768px) { .cp-grid--2 { grid-template-columns: repeat(2, minmax(0, 1fr)); } .cp-grid--3 { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (min-width: 1024px) { .cp-grid--3 { grid-template-columns: repeat(3, minmax(0, 1fr)); } .cp-grid--4 { grid-template-columns: repeat(4, minmax(0, 1fr)); } }
@media (min-width: 768px) and (max-width: 1023px) { .cp-grid--4 { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
`;

export function SectionHead({ id, label, title, lead }: { id: string; label: string; title: ReactNode; lead?: ReactNode }) {
  return (
    <header style={{ marginBottom: 'var(--space-lg)', maxWidth: '64ch' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)', marginBottom: 'var(--space-sm)' }}>
        <span aria-hidden="true" style={{ width: 24, height: 2, background: 'var(--burgundy)', display: 'inline-block' }} />
        <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.16em', color: 'var(--muted)', fontWeight: 600 }}>{label}</span>
      </div>
      <h2 id={id} style={{ fontFamily: 'var(--font-archivo)', fontVariationSettings: '"wdth" 125', fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', fontWeight: 650, lineHeight: 1.15, letterSpacing: '-0.025em', color: 'var(--ink)', textWrap: 'balance' }}>{title}</h2>
      {lead && <p style={{ marginTop: 'var(--space-sm)', color: 'var(--body)', lineHeight: 1.65, fontSize: '1.0625rem' }}>{lead}</p>}
    </header>
  );
}
