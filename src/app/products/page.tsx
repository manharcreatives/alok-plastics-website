/** /products — part finder in the hero stage + all four groups (§8.2). */
import type { Metadata } from 'next';
import PageHero from '@/components/page/PageHero';
import EnquiryBand from '@/components/page/EnquiryBand';
import { FinderProvider, FinderHeroBar, FinderResults } from '@/components/products/PartFinder';
import CatalogueFaq from '@/components/products/CatalogueFaq';
import GroupSection from '@/components/products/GroupSection';
import { CatalogueSheetArt } from '@/components/products/art';
import { productGroups, productsByGroup } from '@/content/products';

export const metadata: Metadata = {
  title: 'Plastic Spare Parts Catalogue | Water Cooler, Freezer & Counter Parts',
  description:
    'Browse moulded plastic & steel spare parts for water coolers, display counters and deep freezers: float valves, F-bushes, connecting bushes, gaskets, door locks, nylon & HDPE. Search by name or material and request a quote.',
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
        layout="top"
      >
        <FinderHeroBar />
      </PageHero>
      <FinderResults>
        {groups.map((g, i) => (
          <GroupSection key={g.id} group={g} tone={i % 2 === 0 ? 'canvas' : 'alt'} fold={i > 0} foldVariant={(['fold', 'diag', 'step', 'register'] as const)[i % 4]} />
        ))}
      </FinderResults>
      <CatalogueFaq />
      <EnquiryBand fold="diag" heading="Cannot find your part?" text="Describe the part and where it is used. We will identify it and reply with a quote." />
    </FinderProvider>
  );
}
