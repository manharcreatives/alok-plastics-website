/** BlogToc: table of contents from the post's h2 headings. Sticky rail on desktop, collapsible on small screens. */
import './blogs.css';

type Item = { id: string; text: string };

export default function BlogToc({ items, variant }: { items: Item[]; variant: 'rail' | 'inline' }) {
  if (items.length < 2) return null;
  const list = (
    <ol>
      {items.map(i => <li key={i.id}><a href={`#${i.id}`}>{i.text}</a></li>)}
    </ol>
  );
  if (variant === 'inline') {
    return (
      <details className="bl-toc bl-toc--inline">
        <summary>In this article</summary>
        <nav aria-label="In this article">{list}</nav>
      </details>
    );
  }
  return (
    <nav className="bl-toc bl-toc--rail" aria-label="In this article">
      <p className="bl-toc__h">In this article</p>
      {list}
    </nav>
  );
}
