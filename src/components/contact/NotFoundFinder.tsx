/**
 * NotFoundFinder — part finder for the 404 page. Fuse.js over published products;
 * links go to /products/<group>/<slug>/. Works under static export (client-only).
 */
'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import Fuse from 'fuse.js';
import { publishedProducts, getGroup } from '@/content/products';

const items = publishedProducts
  .map(p => {
    const g = p.group ? getGroup(p.group) : undefined;
    return g ? { slug: p.slug, name: p.name, material: p.material, groupSlug: g.slug, groupName: g.name } : null;
  })
  .filter((x): x is NonNullable<typeof x> => x !== null);

const CSS = `
.nf-input { width: 100%; min-height: 48px; padding: 0 var(--space-sm); background: var(--surface); color: var(--ink); border: 1px solid var(--grey-metal); border-radius: var(--radius-card); font: inherit; font-size: 1rem; }
.nf-input:focus-visible { outline: 2px solid var(--burgundy); outline-offset: 2px; }
.nf-res { list-style: none; padding: 0; margin: var(--space-sm) 0 0; border: 1px solid var(--grey-cloud); border-radius: var(--radius-card); background: var(--surface); }
.nf-res li + li { border-top: 1px solid var(--grey-cloud); }
.nf-res a { display: flex; justify-content: space-between; gap: var(--space-sm); align-items: center; min-height: 44px; padding: var(--space-xs) var(--space-sm); color: var(--ink); text-decoration: none; }
.nf-res a:hover { background: var(--blush); }
.nf-res a:focus-visible { outline: 2px solid var(--burgundy); outline-offset: -2px; }
`;

export default function NotFoundFinder() {
  const [q, setQ] = useState('');
  const fuse = useMemo(() => new Fuse(items, { keys: ['name', 'groupName', 'material'], threshold: 0.4 }), []);
  const term = q.trim();
  const results = term ? fuse.search(term).slice(0, 6).map(r => r.item) : [];

  return (
    <form role="search" aria-label="Find a part" onSubmit={e => e.preventDefault()}>
      <style>{CSS}</style>
      <label htmlFor="nf-q" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--ink)', marginBottom: 'var(--space-xs)' }}>
        Search for a part
      </label>
      <input id="nf-q" type="search" className="nf-input" value={q} onChange={e => setQ(e.target.value)}
        placeholder="e.g. float valve" autoComplete="off" aria-describedby="nf-status" />
      <p id="nf-status" role="status" aria-live="polite" style={{ marginTop: 'var(--space-xs)', fontSize: '0.875rem', color: 'var(--muted)', minHeight: '1.5em' }}>
        {term ? (results.length ? `${results.length} matching part${results.length > 1 ? 's' : ''}` : 'No matching part found. Try another name, or send us an enquiry.') : ''}
      </p>
      {results.length > 0 && (
        <ul className="nf-res">
          {results.map(r => (
            <li key={r.slug}>
              <Link href={`/products/${r.groupSlug}/${r.slug}/`}>
                <span style={{ fontWeight: 600 }}>{r.name}</span>
                <span style={{ fontSize: '0.8125rem', color: 'var(--muted)' }}>{r.groupName}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </form>
  );
}
