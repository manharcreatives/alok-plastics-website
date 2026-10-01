/** /products/[group]/[part]/ — product detail (§8.2). No prices; unknown fields omitted. */
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import PageHero from '@/components/page/PageHero';
import EnquiryBand from '@/components/page/EnquiryBand';
import ProductGallery from '@/components/products/ProductGallery';
import StickyEnquiryBar from '@/components/products/StickyEnquiryBar';
import { PartGrid } from '@/components/products/PartCard';
import Tag from '@/components/ui/Tag';
import {
  MACHINE_LABELS,
  MATERIAL_LABELS,
  getGroup,
  getGroupBySlug,
  knownMachines,
  productPath,
  productsByGroup,
  publishedProducts,
} from '@/content/products';
import JsonLd from '@/components/seo/JsonLd';
import { describe, partTitle, productJsonLd } from '@/lib/seo';
import { waProduct } from '@/lib/whatsapp';
import '@/components/products/products.css';

export const dynamicParams = false;

export function generateStaticParams() {
  return publishedProducts.flatMap(p => {
    const g = p.group ? getGroup(p.group) : undefined;
    return g ? [{ group: g.slug, part: p.slug }] : [];
  });
}

function resolve(groupSlug: string, partSlug: string) {
  const g = getGroupBySlug(groupSlug);
  const p = g ? productsByGroup(g.id).find(x => x.slug === partSlug) : undefined;
  return g && p ? { g, p } : null;
}

export async function generateMetadata({ params }: { params: Promise<{ group: string; part: string }> }): Promise<Metadata> {
  const { group, part } = await params;
  const r = resolve(group, part);
  if (!r) return {};
  const { g, p } = r;
  return {
    title: { absolute: partTitle(p, g) },
    description: describe(p.summary ?? `${p.name} spare part, part of ${g.name}.`, 'Request a quote from Alok Plastics.'),
    alternates: { canonical: productPath(p) },
  };
}

export default async function PartPage({ params }: { params: Promise<{ group: string; part: string }> }) {
  const { group, part } = await params;
  const r = resolve(group, part);
  if (!r) notFound();
  const { g, p } = r;

  const machines = knownMachines(p);
  const variants = p.variants ?? [];
  const related = productsByGroup(g.id).filter(x => x.slug !== p.slug).slice(0, 4);
  const wa = waProduct({ productName: p.name });

  const rows: { label: string; value: string }[] = [{ label: 'Category', value: g.name }];
  if (p.material) rows.push({ label: 'Material', value: MATERIAL_LABELS[p.material] });
  if (machines.length) rows.push({ label: 'Fits', value: machines.map(m => MACHINE_LABELS[m]).join(', ') });
  if (p.sku) rows.push({ label: 'SKU', value: p.sku });
  if (p.hsn) rows.push({ label: 'HSN', value: p.hsn });
  if (p.moq) rows.push({ label: 'MOQ', value: p.moq });
  if (p.packing) rows.push({ label: 'Packing', value: p.packing });

  return (
    <>
      <PageHero
        crumbs={[
          { label: 'Products', href: '/products/' },
          { label: g.name, href: `/products/${g.slug}/` },
          { label: p.name },
        ]}
        label={`Part · ${g.name}`}
        title={p.name}
        lead={p.summary}
      />

      <div>
        <div className="pw">
          <div className="p-detail">
            <ProductGallery product={p} />
            <div className="p-info">
              {(p.material || machines.length > 0) && (
                <div className="p-card__tags">
                  {p.material && <Tag material={p.material} />}
                  {machines.map(m => <Tag key={m} variant="muted">{MACHINE_LABELS[m]}</Tag>)}
                </div>
              )}

              <section aria-labelledby="spec-h">
                <h2 id="spec-h" className="p-h3">Specifications</h2>
                <table className="p-spec">
                  <caption>{p.name}</caption>
                  <tbody>
                    {rows.map(r2 => (
                      <tr key={r2.label}><th scope="row">{r2.label}</th><td>{r2.value}</td></tr>
                    ))}
                  </tbody>
                </table>
              </section>

              <section aria-labelledby="var-h">
                <h2 id="var-h" className="p-h3">Sizes and variants</h2>
                {variants.length > 0 ? (
                  <ul className="p-list">
                    {variants.map(v => (
                      <li key={v.label}><strong>{v.label}</strong>{v.note && <small>{v.note}</small>}</li>
                    ))}
                  </ul>
                ) : (
                  <div className="p-empty">
                    <p><strong>Ask us for size &amp; availability.</strong></p>
                    <p>Tell us what you need and we will confirm the options.</p>
                    <div className="p-btns">
                      <Link className="p-btn p-btn--primary" href={`/enquiry/?product=${p.slug}`}>Enquire about {p.name}</Link>
                    </div>
                  </div>
                )}
              </section>
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <section aria-labelledby="rel-h" className="p-section" style={{ background: 'var(--canvas)' }}>
            <div className="pw">
              <h2 id="rel-h" className="p-h2" style={{ marginBottom: 'var(--space-md)' }}>Related parts in {g.name}</h2>
              <PartGrid items={related} level={3} />
            </div>
          </section>
        )}

        <StickyEnquiryBar name={p.name} slug={p.slug} waHref={wa} />
      </div>

      <EnquiryBand heading={`Need ${p.name}?`} text="Share the quantity and use — we reply with a quote." waHref={wa} />
      <JsonLd data={productJsonLd(p, g)} />
    </>
  );
}
