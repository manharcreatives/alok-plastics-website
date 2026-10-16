import Link from 'next/link';
import type { ReactNode } from 'react';

/** Presentational pieces for the admin screens. Class names match public/admin/assets/admin.css. */

const PATHS: Record<string, string> = {
  grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3.5 7 8.5 6 8.5-6"/>',
  box: '<path d="M12 3 3.5 7.5v9L12 21l8.5-4.5v-9L12 3Z"/><path d="m3.5 7.5 8.5 4.5 8.5-4.5M12 12v9"/>',
  briefcase: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 13h18"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  logout: '<path d="M9 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4M16 8l4 4-4 4M20 12H9"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  download: '<path d="M12 4v11m0 0 4-4m-4 4-4-4M5 20h14"/>',
  phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z"/>',
  chat: '<path d="M4 20l1.3-4A8 8 0 1 1 8 18.7L4 20Z"/>',
  back: '<path d="M19 12H5m6-6-6 6 6 6"/>',
  arrow: '<path d="M5 12h14m-6-6 6 6-6 6"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
  edit: '<path d="M4 20h4L19 9l-4-4L4 16v4Z"/>',
  eye: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
  alert: '<path d="M12 4 2.5 20h19L12 4ZM12 10v4m0 3v.01"/>',
  inbox: '<path d="M3 13l3-8h12l3 8v6H3v-6Z"/><path d="M3 13h5l1 3h6l1-3h5"/>',
  cart: '<circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path d="M3 4h2.5l2.2 11h10.6l2-8H6.5"/>',
  file: '<path d="M6 3h8l5 5v13H6V3Z"/><path d="M14 3v5h5M9 13h7M9 17h7"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M18 14.5a6 6 0 0 1 3.5 5.5"/>',
  filter: '<path d="M4 5h16l-6 8v6l-4-2v-4L4 5Z"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z"/>',
};

export function Icon({ name, className }: { name: string; className?: string }) {
  return (
    <svg
      className={className ? `ico ${className}` : 'ico'}
      viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.75"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false"
      dangerouslySetInnerHTML={{ __html: PATHS[name] ?? '' }}
    />
  );
}

export type Crumb = [label: string, href: string | null];

export function PageHead({ title, crumbs, lead, actions, extra }: { title: string; crumbs?: Crumb[]; lead?: ReactNode; actions?: ReactNode; extra?: ReactNode }) {
  return (
    <header className="page-head">
      <div className="page-head-main">
        {crumbs && crumbs.length > 0 ? (
          <nav className="crumbs" aria-label="Breadcrumb">
            <ol>
              {crumbs.map(([label, href], i) => {
                const last = i === crumbs.length - 1;
                return <li key={i}>{!last && href ? <Link href={href}>{label}</Link> : <span aria-current={last ? 'page' : undefined}>{label}</span>}</li>;
              })}
            </ol>
          </nav>
        ) : null}
        <h1 className="page-title">{title}{extra}</h1>
        {lead ? <p className="lead">{lead}</p> : null}
      </div>
      {actions ? <div className="page-actions">{actions}</div> : null}
    </header>
  );
}

/** ok = green note, err = red alert, warn = amber. Messages arrive through ?ok= / ?err= after an action. */
export function Flash({ ok, err, warn }: { ok?: string; err?: string; warn?: string }) {
  const [kind, msg] = err ? ['err', err] : warn ? ['warn', warn] : ok ? ['ok', ok] : ['', ''];
  if (!kind) return null;
  return (
    <p className={`flash flash-${kind}`} role={kind === 'err' ? 'alert' : 'status'}>
      <Icon name={kind === 'ok' ? 'check' : 'alert'} />
      <span>{msg}</span>
    </p>
  );
}

export function Badge({ s, label }: { s: string; label?: string }) {
  return <span className={`badge badge-${s}`}>{label ?? s}</span>;
}

export function Pager({ page, pages, href }: { page: number; pages: number; href: (p: number) => string }) {
  if (pages <= 1) return null;
  return (
    <nav className="pager" aria-label="Pages">
      {page > 1 ? <Link className="btn btn-secondary" href={href(page - 1)} rel="prev"><Icon name="back" />Previous</Link> : <span />}
      <span className="meta">Page {page} of {pages}</span>
      {page < pages ? <Link className="btn btn-secondary" href={href(page + 1)} rel="next">Next<Icon name="arrow" /></Link> : <span />}
    </nav>
  );
}

export function EmptyState({ icon, title, children }: { icon: string; title: string; children?: ReactNode }) {
  return (
    <div className="card empty-state">
      <span className="empty-ico"><Icon name={icon} /></span>
      <p className="empty-title">{title}</p>
      {children}
    </div>
  );
}

export function Notes({ notes }: { notes: { at: number; by: string; text: string }[] }) {
  if (notes.length === 0) return <p className="empty">No notes yet.</p>;
  return (
    <ul className="notes">
      {notes.map((n, i) => (
        <li key={i}>
          <p className="note-meta">{n.by} · {new Date(n.at * 1000).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
          <p className="note-text">{n.text}</p>
        </li>
      ))}
    </ul>
  );
}

export const ORDER_TONES: Record<string, string> = { pending: 'tone-warn', reviewing: 'tone-brand', quoted: 'tone-info', confirmed: 'tone-info', paid: 'tone-ok', dispatched: 'tone-info', invoiced: 'tone-brand', closed: 'tone-ok', cancelled: 'tone-muted' };
export const APPLICATION_TONES: Record<string, string> = { new: 'tone-brand', reviewing: 'tone-info', shortlisted: 'tone-warn', hired: 'tone-ok', rejected: 'tone-muted' };

export function ToneBadge({ tone, children }: { tone: string; children: ReactNode }) {
  return <span className={`badge ${tone}`}>{children}</span>;
}

/** Timeline of internal notes, newest first. */
export function NoteTimeline({ notes, fmt }: { notes: { at: number; by: string; text: string }[]; fmt: (ts: number) => string }) {
  if (notes.length === 0) return null;
  return (
    <ol className="timeline">
      {[...notes].reverse().map((n, i) => (
        <li key={i}><span className="tl-meta">{fmt(n.at)} · <span className="tl-who">{n.by}</span></span><span className="tl-text" style={{ whiteSpace: 'pre-wrap' }}>{n.text}</span></li>
      ))}
    </ol>
  );
}
