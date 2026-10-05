import type { Metadata } from 'next';
import { Suspense } from 'react';
import CustomProductView from '@/components/products/CustomProductView';

export const metadata: Metadata = {
  title: { absolute: 'Product | Alok Plastics' },
  description: 'Spare part details from Alok Plastics.',
  alternates: { canonical: '/products/' },
  robots: { index: false, follow: true },
};

export default function ItemPage() {
  return (
    <Suspense fallback={<p role="status" style={{ padding: '30vh var(--space-lg) var(--space-xl)', color: 'var(--muted)' }}>Loading product…</p>}>
      <CustomProductView />
    </Suspense>
  );
}
