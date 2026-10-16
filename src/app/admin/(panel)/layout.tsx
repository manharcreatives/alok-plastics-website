import type { ReactNode } from 'react';
import Link from 'next/link';
import { requireAdmin } from '@/server/admin-auth';
import { query } from '@/server/db';
import AdminNav from '@/components/admin/AdminNav';
import { Icon } from '@/components/admin/ui';
import { logoutAction } from '../login/actions';

export const dynamic = 'force-dynamic';

export default async function PanelLayout({ children }: { children: ReactNode }) {
  const user = await requireAdmin();
  const [c] = await query<{ unseen: string; pending: string }>(
    `select (select count(*) from enquiries where archived = 0 and seen = 0) as unseen,
            (select count(*) from docs where collection = 'orders' and data->>'status' = 'pending') as pending`,
  );
  const unseen = Number(c?.unseen ?? 0);
  const pending = Number(c?.pending ?? 0);
  return (
    <div className="shell">
      <aside className="side">
        <div className="side-top">
          <Link className="side-brand" href="/admin/" aria-label="Alok Plastics admin, dashboard">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/alok-logo-white.svg" alt="Alok Plastics" width={140} height={51} />
          </Link>
          <span className="side-tag">Admin</span>
        </div>
        <AdminNav variant="side" unseen={unseen} pending={pending} />
        <div className="side-user">
          <span className="avatar" aria-hidden="true">{user.name.slice(0, 1).toUpperCase()}</span>
          <span className="side-user-meta"><span className="side-user-name">{user.name}</span><span className="side-user-role">Signed in</span></span>
          <form action={logoutAction}><button className="icon-btn" type="submit" title="Sign out" aria-label="Sign out"><Icon name="logout" /></button></form>
        </div>
      </aside>

      <div className="stage">
        <header className="mobile-top">
          <Link className="side-brand" href="/admin/" aria-label="Alok Plastics admin, dashboard">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/alok-logo-white.svg" alt="Alok Plastics" width={104} height={38} />
          </Link>
          <form action={logoutAction}><button className="mobile-signout" type="submit"><Icon name="logout" /><span>Sign out</span></button></form>
        </header>
        <main id="main" tabIndex={-1} className="main">{children}</main>
        <footer className="foot">Alok Plastics admin · private area · times in Asia/Kolkata</footer>
      </div>

      <AdminNav variant="tabs" unseen={unseen} pending={pending} />
    </div>
  );
}
