'use client';

/**
 * BlogFilterGrid: category chips + card grid. Without JS every post shows (the list is
 * rendered in full on the server); the chips only hide / show cards. Chips are toggle
 * buttons (aria-pressed); the count line is a polite live region.
 */
import { useState } from 'react';
import type { BlogPost } from '@/content/blogs';
import BlogCard from './BlogCard';
import './blogs.css';

export default function BlogFilterGrid({ posts }: { posts: BlogPost[] }) {
  const cats = [...new Set(posts.map(p => p.category))];
  const [active, setActive] = useState<string>('All');
  const shown = active === 'All' ? posts : posts.filter(p => p.category === active);

  return (
    <>
      <div className="bl-filter">
        <ul className="bl-chips" aria-label="Filter guides by category">
          {['All', ...cats].map(c => (
            <li key={c}>
              <button type="button" className="bl-chip" aria-pressed={active === c} onClick={() => setActive(c)}>{c}</button>
            </li>
          ))}
        </ul>
        <p className="bl-count" role="status" aria-live="polite">{shown.length} {shown.length === 1 ? 'guide' : 'guides'}</p>
      </div>
      <ul className={shown.length === 4 ? 'bl-grid bl-grid--quad' : 'bl-grid'}>
        {shown.map(p => <li key={p.slug}><BlogCard post={p} /></li>)}
      </ul>
    </>
  );
}
