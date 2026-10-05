/** /products/[group]/ — group blueprint hero, part grid, other groups (§8.2). */
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowUpRight } from '@phosphor-icons/react/dist/ssr/ArrowUpRight';
import PageHero from '@/components/page/PageHero';
import EnquiryBand from '@/components/page/EnquiryBand';
import FoldEdge, { FOLD_SECTION_CSS } from '@/components/sections/FoldEdge';
import GroupRange from '@/components/products/GroupRange';
import { GroupBlueprintArt } from '@/components/products/art';
import { describe } from '@/lib/seo';
import { getGroupBySlug, productGroups, productsByGroup } from '@/content/products';
import '@/components/products/products.css';

export const dynamicParams = false;

export function generateStaticParams() {
  return productGroups.map(g => ({ group: g.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ group: string }> }): Promise<Metadata> {
  const { group: slug } = await params;
  const g = getGroupBySlug(slug);
  if (!g) return {};
  return {
    title: g.name,
    description: describe(g.description, 'Request a quote from Alok Plastics.'),
    alternates: { canonical: `/products/${g.slug}/` },
  };
}

export default async function GroupPage({ params }: { params: Promise<{ group: string }> }) {
  const { group: slug } = await params;
  const g = getGroupBySlug(slug);
  if (!g) notFound();
  const items = productsByGroup(g.id);
  const custom = g.id === '05';
  const others = productGroups.filter(o => o.id !== g.id);

  return (
    <>
      <PageHero
        crumbs={[{ label: 'Products', href: '/products/' }, { label: g.name }]}
        label="Part group"
        title={g.name}
        lead={`${g.tagline} ${g.description}`}
        art={<GroupBlueprintArt group={g} />}
        enter="draw"
        layout="center"
      />

      <GroupRange group={{ id: g.id, name: g.name }} items={items} />

      {others.length > 0 && (
        <section aria-labelledby="sib-h" className="p-section p-section--canvas fold-sec fold-sec--step">
          <style>{FOLD_SECTION_CSS}</style>
          <FoldEdge variant="step" />
          <div className="pw">
            <p className="p-eyebrow">Keep looking</p>
            <h2 id="sib-h" className="p-h2">Other part groups</h2>
            <ul className="pg-others">
              {others.map(o => (
                <li key={o.id}>
                  <Link href={`/products/${o.slug}/`}>
                    <span>
                      <strong>{o.name}</strong>
                      <small>{o.tagline}</small>
                    </span>
                    <ArrowUpRight size={32} weight="light" aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
      <EnquiryBand variant="lock" fold="diag" heading={custom ? 'Have a part in mind?' : `Looking for ${g.name.toLowerCase()}?`} text="Share the part name, quantity and use, and we will reply with a quote." />
    </>
  );
}
