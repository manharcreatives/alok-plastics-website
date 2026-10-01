/**
 * Breadcrumbs — visible trail + BreadcrumbList JSON-LD (§8.3).
 * items: the trail AFTER Home, last item is the current page (no href needed).
 */
import Link from 'next/link';
import JsonLd from '@/components/seo/JsonLd';
import { breadcrumbJsonLd } from '@/lib/seo';

export interface Crumb { label: string; href?: string }

export default function Breadcrumbs({ items }: { items: Crumb[] }) {
  const trail: Crumb[] = [{ label: 'Home', href: '/' }, ...items];
  return (
    <nav aria-label="Breadcrumb" style={{ marginBottom: 'var(--space-md)' }}>
      <ol style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, fontSize: '0.8125rem', color: 'var(--muted)' }}>
        {trail.map((c, i) => {
          const last = i === trail.length - 1;
          return (
            <li key={c.label + i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {last || !c.href ? (
                <span aria-current={last ? 'page' : undefined} style={{ color: 'var(--ink)' }}>{c.label}</span>
              ) : (
                <Link href={c.href} style={{ color: 'var(--burgundy)', textDecoration: 'none' }}>{c.label}</Link>
              )}
              {!last && <span aria-hidden="true" style={{ color: 'var(--silver)' }}>/</span>}
            </li>
          );
        })}
      </ol>
      <JsonLd data={breadcrumbJsonLd(items)} />
    </nav>
  );
}
