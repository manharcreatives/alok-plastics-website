import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Lab',
  robots: { index: false, follow: false },
};

const LAB_LINKS = [
  { href: '/lab/swatches', label: 'Swatches' },
  { href: '/lab/type', label: 'Type' },
  { href: '/lab/directions', label: 'Directions' },
  { href: '/lab/preloader', label: 'Preloader' },
  { href: '/lab/components', label: 'Components' },
];

/**
 * The design lab is a dev-only surface. Unless NEXT_PUBLIC_SHOW_LAB=1 is set at build time,
 * every /lab/* route resolves to notFound() so nothing is shipped to production.
 * Pages are also noindex (metadata above) and excluded from the sitemap.
 */
export default function LabLayout({ children }: { children: React.ReactNode }) {
  if (process.env.NEXT_PUBLIC_SHOW_LAB !== '1') notFound();
  return (
    <div>
      <nav style={{
        position: 'sticky',
        top: 80,
        zIndex: 20,
        display: 'flex',
        gap: '1.5rem',
        padding: '0.75rem var(--grid-page-padding)',
        background: 'var(--mist)',
        borderBottom: '1px solid var(--grey-warm)',
        fontSize: '0.75rem',
        textTransform: 'uppercase',
        letterSpacing: '0.16em',
        overflowX: 'auto',
      }}>
        <a href="/lab" style={{ color: 'var(--burgundy)', fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap' }}>
          LAB ↗
        </a>
        {LAB_LINKS.map(link => (
          <a
            key={link.href}
            href={link.href}
            style={{ color: 'var(--grey-metal)', textDecoration: 'none', whiteSpace: 'nowrap' }}
          >
            {link.label}
          </a>
        ))}
        <Link href="/" style={{ color: 'var(--grey-metal)', textDecoration: 'none', marginLeft: 'auto', whiteSpace: 'nowrap' }}>
          ← Home
        </Link>
      </nav>
      {children}
    </div>
  );
}
