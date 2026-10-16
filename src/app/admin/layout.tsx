import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import Script from 'next/script';

export const metadata: Metadata = {
  title: { default: 'Admin · Alok Plastics', template: '%s · Alok Plastics admin' },
  robots: { index: false, follow: false, nocache: true },
  icons: { icon: '/icon-192.png' },
};

export const viewport: Viewport = { themeColor: '#2E0A0F', colorScheme: 'light' };

/** The back office is its own document (separate from the public site) so its stylesheet never touches the site. */
export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en-IN">
      <head>
        <link rel="preload" href="/admin/assets/fonts/archivo-latin-wdth.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="stylesheet" href="/admin/assets/admin.css?v=2" />
        <link rel="stylesheet" href="/admin/assets/products.css?v=2" />
      </head>
      <body>
        <a className="skip" href="#main">Skip to content</a>
        {children}
        <Script src="/admin/assets/admin.js?v=2" strategy="afterInteractive" />
      </body>
    </html>
  );
}
