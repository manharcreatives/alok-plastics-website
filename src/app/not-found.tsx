import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight } from '@phosphor-icons/react/dist/ssr/ArrowUpRight';
import NotFoundFinder from '@/components/contact/NotFoundFinder';
import PageHero from '@/components/page/PageHero';
import NotFoundArt from '@/components/page/art/NotFoundArt';

export const metadata: Metadata = {
  title: 'Page not found',
  description: 'This page could not be found. Search the Alok Plastics parts catalogue or return to the home page.',
  robots: { index: false, follow: true },
};

const CSS = `
.nf-tools { width: min(100%, 34rem); display: flex; flex-direction: column; gap: var(--space-md); }
.nf-links { display: flex; flex-wrap: wrap; gap: var(--space-sm); }
.nf-link { display: inline-flex; align-items: center; justify-content: center; gap: var(--space-xs); min-height: 48px; padding: 0 var(--space-md); border-radius: var(--radius-card); font-weight: 600; text-decoration: none; border: 1px solid var(--burgundy); color: var(--burgundy); background: var(--surface); transition: background-color 200ms; }
.nf-link:hover { background: var(--blush); }
.nf-link--primary { background: var(--burgundy); color: var(--surface); }
.nf-link--primary:hover { background: var(--burgundy-deep); }
.nf-link:focus-visible { outline: 2px solid var(--burgundy); outline-offset: 2px; }
.nf-link svg { transition: transform 200ms cubic-bezier(.16,1,.3,1); }
.nf-link:hover svg { transform: translate3d(2px, -2px, 0); }
@media (prefers-reduced-motion: reduce) { .nf-link svg { transition: none; } }
`;

export default function NotFound() {
  return (
    <>
      <style>{CSS}</style>
      <PageHero
        crumbs={[{ label: 'Page not found' }]}
        label="Error 404"
        title="This part isn’t in our catalogue."
        lead="The page you were looking for does not exist or has moved. Search our parts below, or head back to a main page."
        art={<NotFoundArt />}
        enter="wipe"
      >
        <div className="nf-tools">
          <NotFoundFinder />
          <nav aria-label="Helpful links" className="nf-links">
            <Link href="/" className="nf-link nf-link--primary">Home <ArrowUpRight size={18} weight="light" aria-hidden="true" /></Link>
            <Link href="/products/" className="nf-link">Products</Link>
            <Link href="/enquiry/" className="nf-link">Get a Quote</Link>
          </nav>
        </div>
      </PageHero>
    </>
  );
}
