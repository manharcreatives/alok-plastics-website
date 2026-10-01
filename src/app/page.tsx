// Alok Plastics — Home page
// S1: Hero · S2: ValuesRibbon · S3: ProofStrip · S4: ProductGroups
// S5: RequirementToRepeat · S6: IndustriesBento · S7: JourneyOrbit
// S8: PanIndiaMap · S10: TrustQuote · S11: EnquirySection
// S12 Footer + S13 WhatsAppFAB now live in layout.tsx (shared by every route)
// (S9 CultureTeaser cut from home — no team photos available, see docs/decisions.md)

import type { Metadata } from 'next';
import JsonLd from '@/components/seo/JsonLd';
import { HOME_DESCRIPTION, HOME_TITLE, localBusinessJsonLd, organizationJsonLd, websiteJsonLd } from '@/lib/seo';
import Hero from '@/components/hero/Hero';
import ValuesRibbon from '@/components/hero/ValuesRibbon';
import ProofStrip from '@/components/sections/ProofStrip';
import ProductGroups from '@/components/sections/ProductGroups';
import RequirementToRepeat from '@/components/sections/RequirementToRepeat';
import IndustriesBento from '@/components/sections/IndustriesBento';
import JourneyOrbit from '@/components/sections/JourneyOrbit';
import PanIndiaMap from '@/components/sections/PanIndiaMap';
import TrustQuote from '@/components/sections/TrustQuote';
import EnquirySection from '@/components/sections/EnquirySection';

export const metadata: Metadata = {
  title: { absolute: HOME_TITLE },
  description: HOME_DESCRIPTION,
  alternates: { canonical: '/' },
};

export default function HomePage() {
  return (
    <>
      <JsonLd data={[organizationJsonLd(), localBusinessJsonLd(), websiteJsonLd()]} />
      {/* S1 · Hero */}
      <Hero />
      {/* S2 · Values ribbon */}
      <ValuesRibbon />
      {/* S3 · Proof strip */}
      <ProofStrip />
      {/* S4 · Product groups bento */}
      <ProductGroups />
      {/* S5 · Requirement → Repeat chain */}
      <RequirementToRepeat />
      {/* S6 · Industries bento */}
      <IndustriesBento />
      {/* S7 · Journey orbit (emotional peak) */}
      <JourneyOrbit />
      {/* S8 · Pan India map */}
      <PanIndiaMap />
      {/* S10 · Trust quote (S9 cut — see decisions.md) */}
      <TrustQuote />
      {/* S11 · Enquiry */}
      <EnquirySection />
    </>
  );
}
