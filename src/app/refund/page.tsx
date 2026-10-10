import type { Metadata } from 'next';
import LegalPage from '@/components/page/LegalPage';

export const metadata: Metadata = {
  title: 'Returns & Refunds',
  description: 'Returns, damage-in-transit claims and refunds for Alok Plastics orders. Draft pending company approval.',
  alternates: { canonical: '/refund/' },
  robots: { index: false, follow: true }, // noindex until the approved text is published
};

export default function Page() {
  return <LegalPage slug="refund" />;
}
