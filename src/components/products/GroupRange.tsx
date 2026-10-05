'use client';

import Link from 'next/link';
import { ArrowUpRight } from '@phosphor-icons/react/dist/csr/ArrowUpRight';
import type { Product } from '@/content/types';
import { useGroupProducts } from '@/components/runtime/useRuntime';
import GroupParts from './GroupParts';
import './products.css';

interface Props {
  group: { id: string; name: string };
  items: Product[];
}

export default function GroupRange({ group, items }: Props) {
  const list = useGroupProducts(group.id, items);
  const custom = group.id === '05';

  if (list.length > 0) {
    return (
      <section aria-labelledby="parts-h" className="p-section p-section--surface">
        <div className="pw">
          <div className="pg-bar">
            <div>
              <p className="p-eyebrow">The range</p>
              <h2 id="parts-h" className="p-h2">Parts in {group.name}</h2>
            </div>
            <span className="pg-meta">{list.length} {list.length === 1 ? 'part' : 'parts'}</span>
          </div>
          <GroupParts groupId={group.id} items={list} />
        </div>
      </section>
    );
  }

  return (
    <section aria-labelledby="empty-h" className="p-section p-section--surface">
      <div className="pw" style={{ maxWidth: '46rem' }}>
        <p className="p-eyebrow">{custom ? 'Made to order' : 'Range'}</p>
        <h2 id="empty-h" className="p-h2">{custom ? 'Send us the part. We will develop it.' : `${group.name} are quoted on request.`}</h2>
        <p className="p-lead">
          {custom
            ? 'Share a sample, drawing or photo, along with the quantity you need. We will confirm what is possible and reply with a quote.'
            : 'This range is being added to the online catalogue. Tell us the part, the equipment it belongs to and the quantity, and we will confirm availability and reply with a quote.'}
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-sm)', marginTop: 'var(--space-md)' }}>
          <Link href="/enquiry/" className="btn btn--primary" style={{ minHeight: 48, padding: '0 var(--space-md)' }}>
            {custom ? 'Get Custom Quote' : 'Ask for a quote'} <ArrowUpRight size={18} weight="light" aria-hidden="true" />
          </Link>
          <Link href="/products/" className="btn btn--secondary" style={{ minHeight: 48, padding: '0 var(--space-md)' }}>View catalogue</Link>
        </div>
      </div>
    </section>
  );
}
