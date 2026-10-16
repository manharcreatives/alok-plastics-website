/**
 * /cart: client-side cart and order request. No accounts, no payment, nothing is stored
 * on a server. noindex (a personal, empty-for-crawlers page) and left out of the sitemap.
 */
import type { Metadata } from 'next';
import PageHero from '@/components/page/PageHero';
import CartPageClient from '@/components/cart/CartPageClient';

export const metadata: Metadata = {
  title: 'Your cart',
  description: 'Review the parts in your cart and send an order request to Alok Plastics on WhatsApp.',
  alternates: { canonical: '/cart/' },
  robots: { index: false, follow: false },
};

/* The compact hero already clears the glass nav, so the cart body does not need its own tall top padding. */
const CSS = `.ph--compact + .cp { padding-top: var(--section-y); }
.ph--compact + .cp .cp__h1 { font-size: clamp(1.25rem, 2vw, 1.625rem); letter-spacing: 0; }`;

export default function CartPage() {
  return (
    <>
      <style>{CSS}</style>
      {/* The cart body carries the page's h1 ("Your cart"), so the hero title is a styled paragraph here. */}
      <PageHero
        crumbs={[{ label: 'Cart' }]}
        label="Cart and order request"
        title="Review your parts, then send the order request."
        titleAs="p"
        size="md"
        lead="Check the quantities below. Nothing is paid on this site: your request goes to the Alok Plastics team, who confirm availability, price and delivery."
        photo={{ src: '/images/heroes/cart.webp', position: '70% center' }}
        enter="rise"
        layout="base"
        compact
      />
      <CartPageClient />
    </>
  );
}
