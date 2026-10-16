import Link from 'next/link';
import type { ReactNode } from 'react';

/** Small presentational pieces shared by the admin screens (server components, no client JS). */

export function Flash({ ok, err }: { ok?: string; err?: string }) {
  if (err) return <div className="adm-err" role="alert">{err}</div>;
  if (ok) return <div className="adm-ok" role="status">{ok}</div>;
  return null;
}

export function Badge({ s, label }: { s: string; label?: string }) {
  return <span className="adm-badge" data-s={s}>{label ?? s}</span>;
}

export function Pager({ page, pages, href }: { page: number; pages: number; href: (p: number) => string }) {
  if (pages <= 1) return null;
  return (
    <div className="adm-pager">
      {page > 1 ? <Link href={href(page - 1)}>Previous</Link> : null}
      <span>Page {page} of {pages}</span>
      {page < pages ? <Link href={href(page + 1)}>Next</Link> : null}
    </div>
  );
}

export function Card({ title, children, id }: { title?: string; children: ReactNode; id?: string }) {
  return (
    <section className="adm-card" id={id}>
      {title ? <h2>{title}</h2> : null}
      {children}
    </section>
  );
}

export function Notes({ notes }: { notes: { at: number; by: string; text: string }[] }) {
  if (notes.length === 0) return <p className="adm-empty" style={{ padding: 0 }}>No notes yet.</p>;
  return (
    <>
      {notes.map((n, i) => (
        <div className="adm-note" key={i}>
          <small>{n.by} &middot; {new Date(n.at * 1000).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</small>
          {n.text}
        </div>
      ))}
    </>
  );
}

export function DeleteBox({ label, action, children }: { label: string; action: () => Promise<void>; children?: ReactNode }) {
  return (
    <details style={{ marginTop: 14 }}>
      <summary>{label}&hellip;</summary>
      <form action={action}>
        {children ?? <p>This cannot be undone.</p>}
        <button className="adm-btn danger" type="submit">Yes, delete it</button>
      </form>
    </details>
  );
}
