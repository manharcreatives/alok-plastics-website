import type { Metadata, Viewport } from 'next';
import './globals.css';
import { site } from '@/content/site';
import { HOME_DESCRIPTION, HOME_TITLE, OG_IMAGE_PATH } from '@/lib/seo';
import SiteDocument from '@/components/layout/SiteDocument';

// ── Root metadata ─────────────────────────────────────────────────────────────

const DEFAULT_TITLE = HOME_TITLE;
const DEFAULT_DESCRIPTION = HOME_DESCRIPTION;

export const metadata: Metadata = {
  metadataBase: new URL(site.domain),
  title: {
    default: DEFAULT_TITLE,
    template: '%s | Alok Plastics, Chandigarh',
  },
  description: DEFAULT_DESCRIPTION,
  applicationName: site.name,
  // Canonical is set per page (an inherited '/' here would mis-canonicalise every page that forgets its own).
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    siteName: site.name,
    locale: 'en_IN',
    // title / description / url are inherited per page from each route's own metadata.
    images: [{ url: OG_IMAGE_PATH, width: 1200, height: 630, alt: `${site.name}: ${site.tagline.english}` }],
  },
  twitter: {
    card: 'summary_large_image',
    images: [OG_IMAGE_PATH],
  },
  // /favicon.ico (16/32/48) comes from the src/app/favicon.ico file convention. Every icon below is the
  // FULL Alok lockup (mark + wordmark) on a white rounded square, built from public/brand/alok-logo-primary.png.
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  manifest: '/site.webmanifest',
};

export const viewport: Viewport = {
  themeColor: '#F8F7F7', // --canvas (meta tags cannot read CSS variables)
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <SiteDocument>{children}</SiteDocument>;
}
