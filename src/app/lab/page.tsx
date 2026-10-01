import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '_lab',
  robots: { index: false, follow: false },
};

export default function LabPage() {
  return (
    <div style={{ padding: 'var(--space-xl) var(--grid-page-padding)', maxWidth: 800 }}>
      <h1 style={{ fontFamily: 'var(--font-archivo, sans-serif)', fontSize: '2rem', fontWeight: 700, color: 'var(--ink)', marginBottom: '1.5rem' }}>
        Design System Lab
      </h1>
      <p style={{ color: 'var(--muted)', marginBottom: '2rem' }}>
        Development-only routes. Excluded from sitemap and robots.
      </p>
      <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', listStyle: 'none', padding: 0 }}>
        {[
          { href: '/lab/swatches', label: 'Swatches', desc: '24 colour tokens + 2 gradients with live WCAG contrast ratios' },
          { href: '/lab/type', label: 'Type', desc: 'Full type scale specimen including Devanagari tagline at all sizes' },
          { href: '/lab/directions', label: 'Directions', desc: '3 moodboard directions (A: Drawing Sheet · B: Polished Metal · C: Folded Ribbon)' },
          { href: '/lab/preloader', label: 'Preloader', desc: 'Replay, slow-mo, reduced-motion emulation, step through beats' },
          { href: '/lab/components', label: 'Components', desc: '§15.1 UI primitives — Button, Tag, Card, SpecTable, Callout, Divider, SectionHeader' },
        ].map(item => (
          <li key={item.href}>
            <a href={item.href} style={{
              display: 'block',
              padding: '1rem 1.25rem',
              border: '1px solid var(--grey-warm)',
              borderRadius: 2,
              textDecoration: 'none',
              color: 'var(--ink)',
              background: 'var(--surface)',
            }}>
              <span style={{ fontWeight: 600, color: 'var(--burgundy)' }}>{item.label}</span>
              {' — '}
              <span style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>{item.desc}</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
