// Alok Plastics — Home page
// Flow: Hero · AboutIntro (teaser) · ProductGroups · NeedPartBlock (two ways to start) ·
// RequirementToRepeat (how we work) · IndustriesBento · TrustQuote (why choose us) · PanIndiaMap ·
// CeoQuote · StatsBand (the numbers) · BlogsSection · EnquirySection · ClosingNote.
// Footer + WhatsApp FAB live in layout.tsx (shared by every route).
// (JourneyOrbit lives on /about only. CultureTeaser cut from home, see docs/decisions.md)

import type { Metadata } from 'next';
import JsonLd from '@/components/seo/JsonLd';
import { HOME_DESCRIPTION, HOME_TITLE, localBusinessJsonLd, organizationJsonLd, websiteJsonLd } from '@/lib/seo';
import Hero from '@/components/hero/Hero';
import AboutIntro from '@/components/sections/AboutIntro';
import ProductGroups from '@/components/sections/ProductGroups';
import NeedPartBlock from '@/components/sections/NeedPartBlock';
import RequirementToRepeat from '@/components/sections/RequirementToRepeat';
import IndustriesBento from '@/components/sections/IndustriesBento';
import PanIndiaMap from '@/components/sections/PanIndiaMap';
import TrustQuote from '@/components/sections/TrustQuote';
import CeoQuote from '@/components/sections/CeoQuote';
import StatsBand from '@/components/sections/StatsBand';
import BlogsSection from '@/components/sections/BlogsSection';
import EnquirySection from '@/components/sections/EnquirySection';
import ClosingNote from '@/components/sections/ClosingNote';

export const metadata: Metadata = {
  title: { absolute: HOME_TITLE },
  description: HOME_DESCRIPTION,
  alternates: { canonical: '/' },
};

export default function HomePage() {
  return (
    <>
      <JsonLd data={[organizationJsonLd(), localBusinessJsonLd(), websiteJsonLd()]} />
      <Hero />
      {/* About: short teaser, full story on /about/ */}
      <AboutIntro />
      {/* Product categories */}
      <ProductGroups />
      {/* Two ways to start: catalogue or custom */}
      <NeedPartBlock />
      {/* How we work */}
      <RequirementToRepeat />
      {/* Industries we serve */}
      <IndustriesBento />
      {/* Why choose us */}
      <TrustQuote />
      {/* Pan Bharat map */}
      <PanIndiaMap />
      {/* CEO quote */}
      <CeoQuote />
      {/* The numbers */}
      <StatsBand />
      {/* Blogs */}
      <BlogsSection />
      {/* Enquiry */}
      <EnquirySection />
      {/* Closing note */}
      <ClosingNote />
    </>
  );
}
