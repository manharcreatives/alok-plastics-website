/** /products — part finder in the hero stage + all four groups (§8.2). */
import type { Metadata } from 'next';
import PageHero from '@/components/page/PageHero';
import EnquiryBand from '@/components/page/EnquiryBand';
import { FinderProvider, FinderHeroBar, FinderResults } from '@/components/products/PartFinder';
import FaqSection from '@/components/sections/FaqSection';
import GroupSection from '@/components/products/GroupSection';
import { CatalogueSheetArt } from '@/components/products/art';
import { productGroups, productsByGroup } from '@/content/products';

export const metadata: Metadata = {
  title: 'Spare Parts Catalogue',
  description:
    'Browse spare parts for water coolers, display counters and deep freezers, grouped by what the part does. Search by name or material and request a quote.',
  alternates: { canonical: '/products/' },
};

export default function ProductsPage() {
  const groups = productGroups.filter(g => productsByGroup(g.id).length > 0);
  return (
    <FinderProvider>
      <PageHero
        crumbs={[{ label: 'Products' }]}
        label="Spare parts catalogue"
        title="Find the part you need"
        lead="Spare parts for water coolers, display counters and deep freezers, grouped by what the part does inside the machine."
        art={<CatalogueSheetArt />}
        enter="wipe"
      >
        <FinderHeroBar />
      </PageHero>
      <FinderResults>
        {groups.map((g, i) => (
          <GroupSection key={g.id} group={g} tone={i % 2 === 0 ? 'canvas' : 'alt'} fold={i > 0} />
        ))}
      </FinderResults>
      <FaqSection />
      <EnquiryBand heading="Cannot find your part?" text="Describe the part and where it is used — we will identify it and reply with a quote." />
    </FinderProvider>
  );
}
