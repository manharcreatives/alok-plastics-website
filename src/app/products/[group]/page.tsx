/** /products/[group]/ — group intro, part grid, sibling-group nav (§8.2). */
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import PageHero from '@/components/page/PageHero';
import EnquiryBand from '@/components/page/EnquiryBand';
import { PartGrid } from '@/components/products/PartCard';
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

  return (
    <>
      <PageHero
        crumbs={[{ label: 'Products', href: '/products/' }, { label: g.name }]}
        label={`Group ${g.id}`}
        title={g.name}
        lead={`${g.tagline} ${g.description}`}
      />
      <section aria-labelledby="parts-h" className="p-section">
        <div className="pw">
          <div className="p-head">
            <h2 id="parts-h" className="p-h2">{items.length} {items.length === 1 ? 'part' : 'parts'} in this group</h2>
          </div>
          <PartGrid items={items} level={3} />
        </div>
      </section>
      <section aria-labelledby="sib-h" className="p-section" style={{ background: 'var(--canvas)' }}>
        <div className="pw">
          <h2 id="sib-h" className="p-h2" style={{ marginBottom: 'var(--space-md)' }}>Other part groups</h2>
          <ul className="p-gnav">
            {productGroups.map(o => (
              <li key={o.id}>
                <Link href={`/products/${o.slug}/`} aria-current={o.id === g.id ? 'page' : undefined}>
                  <small>{o.id}</small>
                  <strong>{o.name}</strong>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <EnquiryBand heading={`Need ${g.name.toLowerCase()} parts?`} text="Share the part name, quantity and use — we reply with a quote." />
    </>
  );
}
