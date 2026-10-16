'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon } from './ui';

const ITEMS: { key: string; label: string; tab: string; href: string; icon: string }[] = [
  { key: 'dashboard', label: 'Dashboard', tab: 'Dashboard', href: '/admin/', icon: 'grid' },
  { key: 'enquiries', label: 'Enquiries', tab: 'Enquiries', href: '/admin/enquiries/', icon: 'mail' },
  { key: 'orders', label: 'Orders', tab: 'Orders', href: '/admin/orders/', icon: 'cart' },
  { key: 'carts', label: 'Live carts', tab: 'Live carts', href: '/admin/carts/', icon: 'cart' },
  { key: 'products', label: 'Products', tab: 'Products', href: '/admin/products/', icon: 'box' },
  { key: 'applications', label: 'Applications', tab: 'Applicants', href: '/admin/applications/', icon: 'file' },
  { key: 'customers', label: 'Customers', tab: 'Customers', href: '/admin/customers/', icon: 'users' },
  { key: 'careers', label: 'Open roles', tab: 'Roles', href: '/admin/careers/', icon: 'briefcase' },
  { key: 'settings', label: 'Settings', tab: 'Settings', href: '/admin/settings/', icon: 'settings' },
  { key: 'audit', label: 'Activity log', tab: 'Activity', href: '/admin/audit/', icon: 'clock' },
];

export default function AdminNav({ variant, unseen, pending }: { variant: 'side' | 'tabs'; unseen: number; pending: number }) {
  const path = usePathname() || '';
  const current = (href: string) => (href === '/admin/' ? path === '/admin/' || path === '/admin' : path.startsWith(href.replace(/\/$/, '')));
  const badge = (key: string) => (key === 'enquiries' ? unseen : key === 'orders' ? pending : 0);
  if (variant === 'side') {
    return (
      <nav className="side-nav" aria-label="Admin sections">
        <ul>
          {ITEMS.map((it) => (
            <li key={it.key}>
              <Link href={it.href} aria-current={current(it.href) ? 'page' : undefined}>
                <Icon name={it.icon} /><span className="nav-label">{it.label}</span>
                {badge(it.key) > 0 ? <span className="count">{badge(it.key)}</span> : null}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    );
  }
  return (
    <nav className="tabbar" aria-label="Admin sections (mobile)">
      <ul>
        {ITEMS.map((it) => (
          <li key={it.key}>
            <Link href={it.href} aria-current={current(it.href) ? 'page' : undefined}>
              <span className="tab-ico"><Icon name={it.icon} />{badge(it.key) > 0 ? <span className="tab-dot">{badge(it.key)}</span> : null}</span>
              <span className="tab-label">{it.tab}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
