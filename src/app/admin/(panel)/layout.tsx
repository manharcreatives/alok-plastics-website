import type { ReactNode } from 'react';
import Link from 'next/link';
import { requireAdmin } from '@/server/admin-auth';
import { logoutAction } from '../login/actions';

export const dynamic = 'force-dynamic';

export default async function PanelLayout({ children }: { children: ReactNode }) {
  const user = await requireAdmin();
  return (
    <>
      <header className="adm-top">
        <Link className="adm-brand" href="/admin/">Alok admin</Link>
        <Link href="/admin/">Dashboard</Link>
        <Link href="/admin/enquiries/">Enquiries</Link>
        <Link href="/admin/orders/">Orders</Link>
        <Link href="/admin/carts/">Carts</Link>
        <Link href="/admin/customers/">Customers</Link>
        <Link href="/admin/products/">Products</Link>
        <Link href="/admin/careers/">Careers</Link>
        <Link href="/admin/applications/">Applications</Link>
        <Link href="/admin/settings/">Settings</Link>
        <Link href="/admin/audit/">Log</Link>
        <span className="adm-sp" />
        <span className="adm-who">{user.name}</span>
        <form action={logoutAction}>
          <button className="adm-btn ghost" type="submit" style={{ color: 'inherit', borderColor: 'currentColor' }}>Sign out</button>
        </form>
      </header>
      <div className="adm-wrap">{children}</div>
    </>
  );
}
