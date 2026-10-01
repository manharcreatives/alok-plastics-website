/**
 * PageHero — inner-page header band: breadcrumbs, numbered micro-label, H1, lead.
 * The header is a fixed glass pill, so top padding clears utility bar + pill.
 */
import type { ReactNode } from 'react';
import Breadcrumbs, { type Crumb } from './Breadcrumbs';

interface Props {
  crumbs: Crumb[];
  label: string;
  title: ReactNode;
  lead?: ReactNode;
  children?: ReactNode;   // optional actions row
}

export default function PageHero({ crumbs, label, title, lead, children }: Props) {
  return (
    <section style={{ background: 'var(--canvas)', borderBottom: '1px solid var(--grey-cloud)', padding: 'calc(112px + var(--space-lg)) var(--grid-page-padding) var(--space-xl)', position: 'relative', overflow: 'hidden' }}>
      <div aria-hidden="true" style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: '34%', background: 'var(--surface-alt)', clipPath: 'polygon(28% 0, 100% 0, 100% 100%, 0 100%)', opacity: 0.7 }} />
      <div style={{ position: 'relative', maxWidth: 'calc(var(--grid-max) + 2 * var(--grid-page-padding))', margin: '0 auto' }}>
        <Breadcrumbs items={crumbs} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <span aria-hidden="true" style={{ width: 24, height: 2, background: 'var(--burgundy)', display: 'inline-block' }} />
          <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.16em', color: 'var(--muted)', fontWeight: 600 }}>{label}</span>
        </div>
        <h1 style={{ fontFamily: 'var(--font-archivo)', fontVariationSettings: '"wdth" 125', fontSize: 'clamp(1.75rem, 4vw, 3rem)', fontWeight: 650, lineHeight: 1.1, letterSpacing: '-0.03em', color: 'var(--ink)', textWrap: 'balance', maxWidth: '22ch', marginBottom: lead ? 'var(--space-sm)' : 0 }}>{title}</h1>
        {lead && <p style={{ fontSize: '1.0625rem', color: 'var(--body)', lineHeight: 1.65, maxWidth: '60ch' }}>{lead}</p>}
        {children && <div style={{ marginTop: 'var(--space-md)', display: 'flex', flexWrap: 'wrap', gap: 'var(--space-sm)' }}>{children}</div>}
      </div>
    </section>
  );
}
