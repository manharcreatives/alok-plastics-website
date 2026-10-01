import type { Metadata } from 'next';
import LegalPage from '@/components/page/LegalPage';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy policy of Alok Plastics, Chandigarh. The full policy is being finalised; contact us with any question about your information.',
  alternates: { canonical: '/privacy/' },
  robots: { index: false, follow: true } // noindex until legal text is published,
};

export default function Page() {
  return <LegalPage slug="privacy" title="Privacy Policy" label="Legal" sections={['Information we collect', 'How we use information', 'Sharing of information', 'Data retention and security', 'Your choices', 'Contact us']} />;
}
