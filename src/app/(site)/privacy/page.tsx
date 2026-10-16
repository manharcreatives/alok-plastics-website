import type { Metadata } from 'next';
import LegalPage from '@/components/page/LegalPage';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy policy of Alok Plastics, Chandigarh: what we collect when you enquire, why, and your choices. Draft pending company approval.',
  alternates: { canonical: '/privacy/' },
  robots: { index: false, follow: true }, // noindex until the approved text is published
};

export default function Page() {
  return <LegalPage slug="privacy" />;
}
