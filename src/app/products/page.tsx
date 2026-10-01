/** /products — part finder + all four groups (§8.2). */
import type { Metadata } from 'next';
import PageHero from '@/components/page/PageHero';
import EnquiryBand from '@/components/page/EnquiryBand';
import PartFinder from '@/components/products/PartFinder';
import FaqSection from '@/components/sections/FaqSection';
import GroupSection from '@/components/products/GroupSection';
import { productGroups, productsByGroup } from '@/content/products';

export const metadata: Metadata = {
  title: 'Spare Parts Catalogue',
  description:
    'Browse spare parts for water coolers, display counters and deep freezers, grouped by what the part does. Search by name or material and request a quote.',
  alternates: { canonical: '/products/' },
};

export default function ProductsPage() {
  return (
    <>
      <PageHero
        crumbs={[{ label: 'Products' }]}
        label="Products"
        title="Find the part you need"
        lead="Spare parts for water coolers, display counters and deep freezers, grouped by what the part does inside the machine."
      />
      <PartFinder>
        {productGroups.filter(g => productsByGroup(g.id).length > 0).map(g => (
          <GroupSection key={g.id} group={g} />
        ))}
      </PartFinder>
      <FaqSection />
      <EnquiryBand heading="Cannot find your part?" text="Describe it or send a photo — we will identify it and reply with a quote." />
    </>
  );
}
