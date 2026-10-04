/**
 * /cart: client-side cart and order request. No accounts, no payment, nothing is stored
 * on a server. noindex (a personal, empty-for-crawlers page) and left out of the sitemap.
 */
import type { Metadata } from 'next';
import CartPageClient from '@/components/cart/CartPageClient';

export const metadata: Metadata = {
  title: 'Your cart',
  description: 'Review the parts in your cart and send an order request to Alok Plastics on WhatsApp.',
  alternates: { canonical: '/cart/' },
  robots: { index: false, follow: false },
};

export default function CartPage() {
  return <CartPageClient />;
}
