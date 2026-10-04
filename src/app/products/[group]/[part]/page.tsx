/** /products/[group]/[part]/ — product detail (§8.2). No prices; unknown fields omitted. */
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import PageHero from '@/components/page/PageHero';
import EnquiryBand from '@/components/page/EnquiryBand';
import Pictogram from '@/components/brand/Pictogram';
import ProductGallery from '@/components/products/ProductGallery';
import StickyEnquiryBar from '@/components/products/StickyEnquiryBar';
import RelatedProducts from '@/components/products/RelatedProducts';
import ProductBuyBox from '@/components/products/ProductBuyBox';
import { PartSheetArt } from '@/components/products/art';
import ProductSpecs from '@/components/products/ProductSpecs';
import ProductSeoRuntime from '@/components/products/ProductSeoRuntime';
import ProductText from '@/components/runtime/ProductText';
import {
  MACHINE_LABELS,
  getGroup,
  getGroupBySlug,
  knownMachines,
  productPath,
  productsByGroup,
  publishedProducts,
} from '@/content/products';
import JsonLd from '@/components/seo/JsonLd';
import { describe, partTitle, productJsonLd } from '@/lib/seo';
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


  return (
    <>
      <PageHero
        crumbs={[
          { label: 'Products', href: '/products/' },
          { label: g.name, href: `/products/${g.slug}/` },
          { label: p.name },
        ]}
        label={g.name}
        title={<ProductText slug={p.slug} field="name" fallback={p.name} />}
        lead={p.summary ? <ProductText slug={p.slug} field="summary" fallback={p.summary} /> : undefined}
        art={<PartSheetArt product={p} group={g} />}
        enter="rise"
        layout="mirror"
      />

      <div>
        <section aria-labelledby="spec-h" className="p-section p-section--surface">
          <div className="pw">
            <div className="p-detail">
              <div className="p-detail__sheet"><ProductGallery product={p} /></div>
              <div className="p-info">
                <ProductBuyBox product={p} />
                <ProductSpecs product={p} groupName={g.name} />

                {machines.length > 0 && (
                  <section aria-labelledby="fit-h">
                    <h2 id="fit-h" className="p-h3">Fits these machines</h2>
                    <ul className="p-fit">
                      {machines.map(m => (
                        <li key={m}><Pictogram name={m} size={32} aria-hidden="true" /> {MACHINE_LABELS[m]}</li>
                      ))}
                    </ul>
                  </section>
                )}

                <section aria-labelledby="var-h">
                  <h2 id="var-h" className="p-h3">Sizes and variants</h2>
                  {variants.length > 0 ? (
                    <ul className="p-vars">
                      {variants.map(v => (
                        <li key={v.label}><strong>{v.label}</strong>{v.note && <small>{v.note}</small>}</li>
                      ))}
                    </ul>
                  ) : (
                    <div className="p-ask">
                      <p><strong>Ask us for size and availability.</strong></p>
                      <p>Tell us what you need and we will confirm the options.</p>
                    </div>
                  )}
                </section>

              </div>
            </div>
          </div>
        </section>

        <RelatedProducts product={p} />

        <StickyEnquiryBar product={p} />
      </div>

      <EnquiryBand fold="register" heading={`Need ${p.name}?`} text="Share the quantity and use, and we will reply with a quote." />
      <JsonLd data={productJsonLd(p, g)} />
      <ProductSeoRuntime product={p} />
    </>
  );
}
