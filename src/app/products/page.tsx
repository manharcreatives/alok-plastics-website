/** /products — part finder in the hero stage + all four groups (§8.2). */
import type { Metadata } from 'next';
import Highlight from '@/components/ui/Highlight';
import PageHero from '@/components/page/PageHero';
import EnquiryBand from '@/components/page/EnquiryBand';
import { FinderProvider, FinderHeroBar, FinderResults } from '@/components/products/PartFinder';
import CatalogueFaq from '@/components/products/CatalogueFaq';
import GroupSection from '@/components/products/GroupSection';
import { CatalogueSheetArt } from '@/components/products/art';
import { productGroups, productsByGroup } from '@/content/products';

export const metadata: Metadata = {
  title: { absolute: 'Spare Parts Catalogue | Coolers, Freezers | Alok Plastics' },
  description:
    'Browse spare parts for water coolers, display counters, deep freezers and commercial kitchens: valves, bushes, hinges, burners. Search and request a quote.',
  alternates: { canonical: '/products/' },
};

export default function ProductsPage() {
  const groups = productGroups.filter(g => productsByGroup(g.id).length > 0);
  return (
    <FinderProvider>
      <PageHero
        crumbs={[{ label: 'Products' }]}
        label="Spare parts catalogue"
        title="Water cooler, counter and freezer spare parts. Find the one that fits."
        size="md"
        lead={<Highlight keywords={['spare parts']}>Moulded plastic and steel spare parts for water coolers, display counters and deep freezers, grouped by what the part does inside the machine. Search by name or material.</Highlight>}
        art={<CatalogueSheetArt />}
        photo={{ src: '/images/heroes/products.webp', position: '70% center' }}
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
