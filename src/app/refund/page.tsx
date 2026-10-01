import type { Metadata } from 'next';
import LegalPage from '@/components/page/LegalPage';

export const metadata: Metadata = {
  title: 'Returns & Refunds',
  description: 'Returns and refund policy of Alok Plastics, Chandigarh. The full policy is being finalised; contact us with any question about an order.',
  alternates: { canonical: '/refund/' },
  robots: { index: false, follow: true } // noindex until legal text is published,
};

export default function Page() {
  return <LegalPage slug="refund" title="Returns & Refunds" label="Legal" sections={['Returns', 'Refunds', 'Damaged or incorrect items', 'How to raise a request', 'Contact us']} />;
}
