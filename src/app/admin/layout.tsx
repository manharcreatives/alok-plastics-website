import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Alok Plastics admin',
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return (
    <div className="adm">
      <link rel="stylesheet" href="/admin-ui.css" precedence="default" />
      {children}
    </div>
  );
}
