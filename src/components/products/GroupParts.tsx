'use client';
/**
 * Part grid for /products/[group]/ with a sort + availability control.
 * The default state renders the server-supplied list unchanged (so the static HTML and the first
 * client render match, and crawlers see every part); sorting/filtering uses the client catalogue.
 */
import { useId, useMemo, useState } from 'react';
import type { Product } from '@/content/types';
import { useCatalogProducts } from '@/components/runtime/useRuntime';
import { DEFAULT_QUERY, searchCatalog, type Availability, type SortKey } from '@/lib/catalog-search';
import { PartGrid } from './PartCard';
import './products.css';

const SORTS: { id: SortKey; label: string }[] = [
  { id: 'featured', label: 'Featured' },
  { id: 'newest', label: 'Newest' },
  { id: 'price-asc', label: 'Price: low to high' },
  { id: 'price-desc', label: 'Price: high to low' },
  { id: 'name', label: 'Name: A to Z' },
];
const AVAILS: { id: Availability | 'all'; label: string }[] = [
  { id: 'all', label: 'Any availability' },
  { id: 'in-stock', label: 'In stock' },
  { id: 'on-request', label: 'Availability on request' },
  { id: 'out-of-stock', label: 'Out of stock' },
];

export default function GroupParts({ groupId, items }: { groupId: string; items: Product[] }) {
  const uid = useId();
  const all = useCatalogProducts();
  const [sort, setSort] = useState<SortKey>('featured');
  const [avail, setAvail] = useState<Availability | 'all'>('all');
  const pristine = sort === 'featured' && avail === 'all';

  const shown = useMemo(() => {
    if (pristine) return items;
    return searchCatalog(all, {
      ...DEFAULT_QUERY,
      groups: [groupId],
      availability: avail === 'all' ? [] : [avail],
      sort,
      page: 1,
      pageSize: 1000,
    }).items;
  }, [pristine, items, all, groupId, avail, sort]);

  return (
    <>
      <div className="pg-tools">
        <label className="ct__sort" htmlFor={`${uid}-a`}>
          <span className="ct__sort-l">Availability</span>
          <select id={`${uid}-a`} className="pr__select" value={avail} onChange={e => setAvail(e.target.value as Availability | 'all')}>
            {AVAILS.map(a => <option key={a.id} value={a.id}>{a.label}</option>)}
          </select>
        </label>
        <label className="ct__sort" htmlFor={`${uid}-s`}>
          <span className="ct__sort-l">Sort by</span>
          <select id={`${uid}-s`} className="pr__select" value={sort} onChange={e => setSort(e.target.value as SortKey)}>
            {SORTS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </label>
      </div>
      <p className="p-fine" role="status" aria-live="polite">{shown.length === 0 ? 'No parts match' : `${shown.length} ${shown.length === 1 ? 'part' : 'parts'}`}</p>
      <PartGrid items={shown} level={3} />
    </>
  );
}
