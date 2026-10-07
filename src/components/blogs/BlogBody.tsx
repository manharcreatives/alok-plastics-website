/**
 * BlogBody: renders a post's structured blocks. Inline markup in any text:
 *   [label](/internal/path/)  → next/link (or <a> for external)   **bold** → <strong>
 * h2 gets an id (slugified) for the table of contents.
 */
import Link from 'next/link';
import type { ReactNode } from 'react';
import { slugify, type BlogBlock } from '@/content/blogs';
import './blogs.css';

const INLINE = /\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*/g;

export function renderInline(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let k = 0;
  for (const m of text.matchAll(INLINE)) {
    const i = m.index ?? 0;
    if (i > last) out.push(text.slice(last, i));
    if (m[1]) {
      const href = m[2];
      out.push(
        href.startsWith('/')
          ? <Link key={k++} href={href}>{m[1]}</Link>
          : <a key={k++} href={href} rel="noopener noreferrer">{m[1]}</a>,
      );
    } else {
      out.push(<strong key={k++}>{m[3]}</strong>);
    }
    last = i + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

function Block({ b }: { b: BlogBlock }) {
  switch (b.t) {
    case 'h2': return <h2 id={slugify(b.text)}>{b.text}</h2>;
    case 'h3': return <h3>{b.text}</h3>;
    case 'p': return <p>{renderInline(b.text)}</p>;
    case 'ul': return <ul>{b.items.map((it, i) => <li key={i}>{renderInline(it)}</li>)}</ul>;
    case 'ol': return <ol>{b.items.map((it, i) => <li key={i}>{renderInline(it)}</li>)}</ol>;
    case 'callout':
      return (
        <aside className="bl-note" role="note">
          <p className="bl-note__t">{b.title}</p>
          <p>{renderInline(b.text)}</p>
        </aside>
      );
    case 'table':
      return (
        <div className="bl-table" role="region" aria-label={b.caption} tabIndex={0}>
          <table>
            <caption>{b.caption}</caption>
            <thead><tr>{b.head.map(h => <th key={h} scope="col">{h}</th>)}</tr></thead>
            <tbody>{b.rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j}>{c}</td>)}</tr>)}</tbody>
          </table>
        </div>
      );
  }
}

export default function BlogBody({ blocks }: { blocks: BlogBlock[] }) {
  return <div className="bl-prose">{blocks.map((b, i) => <Block key={i} b={b} />)}</div>;
}
