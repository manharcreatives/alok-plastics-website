import type { Metadata } from 'next';
import LegalPage from '@/components/page/LegalPage';

export const metadata: Metadata = {
  title: 'Terms of Use',
  description: 'Terms of use for the Alok Plastics website. The full terms are being finalised; contact us with any question.',
  alternates: { canonical: '/terms/' },
  robots: { index: false, follow: true } // noindex until legal text is published,
};

export default function Page() {
  return <LegalPage slug="terms" title="Terms of Use" label="Legal" sections={['Use of this website', 'Product information and quotations', 'Intellectual property', 'Limitation of liability', 'Governing law', 'Contact us']} />;
}
