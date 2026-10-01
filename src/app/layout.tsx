import Footer from '@/components/sections/Footer';
import WhatsAppFAB from '@/components/sections/WhatsAppFAB';
import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { site } from '@/content/site';
import { HOME_DESCRIPTION, HOME_TITLE, OG_IMAGE_PATH } from '@/lib/seo';
import Header from '@/components/layout/Header';
import LenisProvider from '@/components/layout/LenisProvider';
import Preloader from '@/components/preloader/Preloader';

// ── Fonts — self-hosted woff2 in src/fonts (no Google request at build OR runtime) ──
// §7.1: Archivo variable (wdth 62–125 + wght), Inter variable, Noto Sans Devanagari, JetBrains Mono

const archivo = localFont({
  src: [{ path: '../fonts/archivo-latin-wdth.woff2', style: 'normal', weight: '100 900' }],
  variable: '--font-archivo',
  display: 'swap',
  fallback: ['Arial Narrow', 'Arial', 'sans-serif'],
});

const inter = localFont({
  src: [{ path: '../fonts/inter-latin-wght.woff2', style: 'normal', weight: '100 900' }],
  variable: '--font-inter',
  display: 'swap',
  fallback: ['system-ui', 'Segoe UI', 'sans-serif'],
});

const notoDevanagari = localFont({
  src: [
    { path: '../fonts/noto-devanagari-500.woff2', style: 'normal', weight: '500' },
    { path: '../fonts/noto-devanagari-600.woff2', style: 'normal', weight: '600' },
    { path: '../fonts/noto-devanagari-700.woff2', style: 'normal', weight: '700' },
  ],
  variable: '--font-devanagari',
  display: 'swap',
  fallback: ['Noto Sans Devanagari', 'Nirmala UI', 'sans-serif'],
});

const jetbrainsMono = localFont({
  src: [
    { path: '../fonts/jetbrains-mono-400.woff2', style: 'normal', weight: '400' },
    { path: '../fonts/jetbrains-mono-500.woff2', style: 'normal', weight: '500' },
  ],
  variable: '--font-mono',
  display: 'swap',
  fallback: ['Courier New', 'monospace'],
});

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
    images: [{ url: OG_IMAGE_PATH, width: 1200, height: 630, alt: `${site.name} — ${site.tagline.english}` }],
  },
  twitter: {
    card: 'summary_large_image',
    images: [OG_IMAGE_PATH],
  },
  // /favicon.ico comes from the src/app/favicon.ico file convention.
  icons: {
    icon: [
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

// ── Root layout ───────────────────────────────────────────────────────────────

type Props = { children: React.ReactNode };

export default function RootLayout({ children }: Props) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={[
        archivo.variable,
        inter.variable,
        notoDevanagari.variable,
        jetbrainsMono.variable,
      ].join(' ')}
    >
      <head>
        {/* Inline script: sets html.is-preloading class before hydration
            so the preloader overlay shows from first paint (§10.4 — no flash) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var d=document.documentElement;if(!sessionStorage.getItem('alok:preloaded')&&!navigator.webdriver&&location.search.indexOf('nopreload')<0&&!window.matchMedia('(prefers-reduced-motion:reduce)').matches&&navigator.connection?.saveData!==true&&!['slow-2g','2g'].includes(navigator.connection?.effectiveType)){d.classList.add('is-preloading');setTimeout(function(){d.classList.remove('is-preloading')},6000);}}catch(e){}})()`,
          }}
        />
      </head>
      <body className="min-h-screen bg-canvas text-ink">
        {/* Skip link — first tab stop (§17, §8.3) */}
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        {/* Preloader — SSR markup is display:none unless html.is-preloading (set in <head>) */}
        <Preloader />
        <LenisProvider />
        <Header />
        <main id="main">
          {children}
        </main>
        <Footer />
        <WhatsAppFAB />
      </body>
    </html>
  );
}
