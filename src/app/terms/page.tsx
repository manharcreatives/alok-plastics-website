import type { Metadata } from 'next';
import LegalPage from '@/components/page/LegalPage';

export const metadata: Metadata = {
  title: 'Terms of Use',
  description: 'Terms of use for the Alok Plastics website: products, prices, enquiries, payment, dispatch and liability. Draft pending company approval.',
  alternates: { canonical: '/terms/' },
  robots: { index: false, follow: true }, // noindex until the approved text is published
};

export default function Page() {
  return <LegalPage slug="terms" />;
}
