import type { Metadata } from 'next';
import Link from 'next/link';
import NotFoundFinder from '@/components/contact/NotFoundFinder';

export const metadata: Metadata = {
  title: 'Page not found',
  description: 'This page could not be found. Search the Alok Plastics parts catalogue or return to the home page.',
  robots: { index: false, follow: true },
};

const CSS = `
.nf-wrap { position: relative; overflow: hidden; background: var(--canvas); padding: calc(112px + var(--space-lg)) var(--grid-page-padding) var(--space-xl); }
.nf-bg { position: absolute; top: 0; right: 0; bottom: 0; width: 38%; background: var(--surface-alt); clip-path: polygon(28% 0, 100% 0, 100% 100%, 0 100%); opacity: 0.7; }
.nf-inner { position: relative; max-width: 720px; margin: 0 auto; }
.nf-404 { font-family: var(--font-archivo); font-variation-settings: "wdth" 125; font-weight: 800; font-size: clamp(5rem, 22vw, 11rem); line-height: 0.95; letter-spacing: -0.04em; color: var(--burgundy); margin: 0; }
.nf-links { display: flex; flex-wrap: wrap; gap: var(--space-sm); margin-top: var(--space-lg); }
.nf-link { display: inline-flex; align-items: center; justify-content: center; min-height: 44px; padding: 0 var(--space-md); border-radius: var(--radius-card); font-weight: 600; text-decoration: none; border: 1px solid var(--burgundy); color: var(--burgundy); background: var(--surface); }
.nf-link--primary { background: var(--burgundy); color: white; }
.nf-link:focus-visible { outline: 2px solid var(--burgundy); outline-offset: 2px; }
`;

export default function NotFound() {
  return (
    <section aria-labelledby="nf-h" className="nf-wrap">
      <style>{CSS}</style>
      <div className="nf-bg" aria-hidden="true" />
      <div className="nf-inner">
        <p aria-hidden="true" className="nf-404">404</p>
        <h1 id="nf-h" style={{ fontFamily: 'var(--font-archivo)', fontVariationSettings: '"wdth" 125', fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 650, letterSpacing: '-0.03em', lineHeight: 1.1, color: 'var(--ink)', margin: 'var(--space-sm) 0' }}>
          This part isn&rsquo;t in our catalogue.
        </h1>
        <p style={{ color: 'var(--body)', lineHeight: 1.65, maxWidth: '52ch', marginBottom: 'var(--space-lg)' }}>
          The page you were looking for does not exist or has moved. Search our parts below, or head back to a main page.
        </p>
        <NotFoundFinder />
        <nav aria-label="Helpful links" className="nf-links">
          <Link href="/" className="nf-link nf-link--primary">Home</Link>
          <Link href="/products/" className="nf-link">Products</Link>
          <Link href="/enquiry/" className="nf-link">Enquiry</Link>
        </nav>
      </div>
    </section>
  );
}
