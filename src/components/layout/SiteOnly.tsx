'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

/** Renders the public-site chrome (preloader, header, footer, WhatsApp button) everywhere except the /admin back office. */
export default function SiteOnly({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (pathname === '/admin' || pathname.startsWith('/admin/')) return null;
  return <>{children}</>;
}
