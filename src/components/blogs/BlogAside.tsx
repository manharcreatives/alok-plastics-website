/**
 * BlogAside: the right-hand rail beside a guide on wide screens (under the article on narrower ones).
 * Shows facts about the guide, the catalogue parts it links to (pulled from the post's own product
 * links, so it never invents a part), and a next-step panel. Server-rendered, no client hooks.
 */
import Link from 'next/link';
import { formatBlogDate, type BlogBlock, type BlogPost } from '@/content/blogs';
import './blogs.css';

type Part = { href: string; label: string; slug: string };

const PRODUCT_LINK = /\[([^\]]+)\]\((\/products\/[^)\s]+)\)/g;

function blockStrings(b: BlogBlock): string[] {
  switch (b.t) {
    case 'ul':
    case 'ol':
      return b.items;
    case 'table':
      return b.rows.flat();
    default:
      return [b.text];
  }
}

/* product pages are /products/<group>/<slug>/ (three segments); group pages have only two */
function productParts(post: BlogPost): Part[] {
  const seen = new Map<string, Part>();
  for (const b of post.body) {
    for (const s of blockStrings(b)) {
      for (const m of s.matchAll(PRODUCT_LINK)) {
        const href = m[2];
        const seg = href.split('/').filter(Boolean);
        if (seg.length !== 3 || seen.has(href)) continue;
        const label = m[1].charAt(0).toUpperCase() + m[1].slice(1);
        seen.set(href, { href, label, slug: seg[2] });
      }
    }
  }
  return [...seen.values()].slice(0, 6);
}

export default function BlogAside({ post }: { post: BlogPost }) {
  const parts = productParts(post);
  return (
    <aside className="bl-aside" aria-label="About this guide">
      <section className="bl-aside__card" aria-labelledby="bl-facts-h">
        <h2 id="bl-facts-h" className="bl-aside__h">About this guide</h2>
        <dl className="bl-facts">
          <div><dt>Topic</dt><dd>{post.category}</dd></div>
          <div><dt>Read time</dt><dd>{post.readMinutes} min</dd></div>
          <div><dt>Published</dt><dd>{formatBlogDate(post.publishDate)}</dd></div>
          <div><dt>Written by</dt><dd>{post.author}</dd></div>
        </dl>
      </section>

      {parts.length > 0 && (
        <section className="bl-aside__card" aria-labelledby="bl-parts-h">
          <h2 id="bl-parts-h" className="bl-aside__h">Parts in this guide</h2>
          <ul className="bl-parts">
            {parts.map(p => (
              <li key={p.href}>
                <Link href={p.href}>
                  <img src={`/images/products/${p.slug}.webp`} alt="" width={48} height={48} loading="lazy" />
                  <span>{p.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="bl-aside__card bl-aside__card--tint" aria-labelledby="bl-aside-cta-h">
        <h2 id="bl-aside-cta-h" className="bl-aside__h">Need one of these parts?</h2>
        <p className="bl-aside__t">Send the part name, a photo and the quantity. We confirm availability and reply with a quote.</p>
        <div className="bl-cta__row bl-aside__row">
          <Link href="/enquiry/" className="bl-btn bl-btn--primary">Get a Quote</Link>
          <Link href="/contact/" className="bl-btn bl-btn--ghost">Contact us</Link>
        </div>
      </section>
    </aside>
  );
}
