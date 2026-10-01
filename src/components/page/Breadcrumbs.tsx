/**
 * Breadcrumbs: visible trail + BreadcrumbList JSON-LD (§8.3).
 * items: the trail AFTER Home, last item is the current page (no href needed).
 */
import Link from 'next/link';
import JsonLd from '@/components/seo/JsonLd';
import { breadcrumbJsonLd } from '@/lib/seo';

export interface Crumb { label: string; href?: string }

const CSS = `
.bc { margin: 0; }
.bc ol { list-style: none; padding: 0; margin: 0; display: flex; flex-wrap: wrap; align-items: center; gap: var(--space-xs); font-size: 0.8125rem; color: var(--muted); }
.bc li { display: flex; align-items: center; gap: var(--space-xs); }
.bc a { color: var(--burgundy); text-decoration: none; display: inline-flex; align-items: center; min-height: 24px; border-bottom: 1px solid transparent; }
.bc a:hover { border-bottom-color: currentColor; }
.bc a:focus-visible { outline: 2px solid var(--burgundy); outline-offset: 2px; }
.bc__sep { width: 14px; height: 1px; background: var(--grey-metal); transform: rotate(-44deg); display: inline-block; }
.bc [aria-current] { color: var(--ink); font-weight: 600; }
`;

export default function Breadcrumbs({ items }: { items: Crumb[] }) {
  const trail: Crumb[] = [{ label: 'Home', href: '/' }, ...items];
  return (
    <nav aria-label="Breadcrumb" className="bc">
      <style>{CSS}</style>
      <ol>
        {trail.map((c, i) => {
          const last = i === trail.length - 1;
          return (
            <li key={c.label + i}>
              {last || !c.href ? (
                <span aria-current={last ? 'page' : undefined}>{c.label}</span>
              ) : (
                <Link href={c.href}>{c.label}</Link>
              )}
              {!last && <span aria-hidden="true" className="bc__sep" />}
            </li>
          );
        })}
      </ol>
      <JsonLd data={breadcrumbJsonLd(items)} />
    </nav>
  );
}
