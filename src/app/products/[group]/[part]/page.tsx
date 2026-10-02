/** /products/[group]/[part]/ — product detail (§8.2). No prices; unknown fields omitted. */
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowUpRight } from '@phosphor-icons/react/dist/ssr/ArrowUpRight';
import { Phone } from '@phosphor-icons/react/dist/ssr/Phone';
import PageHero from '@/components/page/PageHero';
import EnquiryBand from '@/components/page/EnquiryBand';
import FoldEdge, { FOLD_SECTION_CSS } from '@/components/sections/FoldEdge';
import Pictogram from '@/components/brand/Pictogram';
import ProductGallery from '@/components/products/ProductGallery';
import StickyEnquiryBar from '@/components/products/StickyEnquiryBar';
import { PartGrid } from '@/components/products/PartCard';
import { PartSheetArt } from '@/components/products/art';
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
import { site, telHref } from '@/content/site';
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
  const related = productsByGroup(g.id).filter(x => x.slug !== p.slug).slice(0, 4);
  const phone = site.contact.phone;

  const cells: { label: string; value: string; wide?: boolean }[] = [{ label: 'Group', value: g.name, wide: true }];
  if (p.material) cells.push({ label: 'Material', value: MATERIAL_LABELS[p.material] });
  if (p.sku) cells.push({ label: 'Drg no.', value: p.sku });
  if (p.hsn) cells.push({ label: 'HSN', value: p.hsn });
  if (p.moq) cells.push({ label: 'MOQ', value: p.moq });
  if (p.packing) cells.push({ label: 'Packing', value: p.packing });

  return (
    <>
      <PageHero
        crumbs={[
          { label: 'Products', href: '/products/' },
          { label: g.name, href: `/products/${g.slug}/` },
          { label: p.name },
        ]}
        label={g.name}
        title={p.name}
        lead={p.summary}
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
                <div className="tb">
                  <div className="tb__head">
                    <h2 id="spec-h" className="tb__name">{p.name}</h2>
                    {p.material && <Tag material={p.material} />}
                  </div>
                  <dl className="tb__grid">
                    {cells.map(c => (
                      <div key={c.label} className={`tb__cell${c.wide || cells.length === 1 ? ' tb__cell--wide' : ''}`}>
                        <dt>{c.label}</dt>
                        <dd>{c.value}</dd>
                      </div>
                    ))}
                  </dl>
                  <div className="tb__foot" aria-hidden="true"><span>Not to scale</span><span>Alok Plastics</span></div>
                </div>

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

                <div className="p-cta">
                  <Link className="p-btn p-btn--primary" href={`/enquiry/?product=${p.slug}`}>
                    Get a Quote <ArrowUpRight size={18} weight="light" aria-hidden="true" />
                  </Link>
                  {phone && (
                    <a className="p-btn p-btn--ghost" href={telHref(phone)}>
                      <Phone size={18} weight="light" aria-hidden="true" /> Call
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {related.length > 0 && (
          <section aria-labelledby="rel-h" className="p-section p-section--canvas fold-sec fold-sec--diag">
            <style>{FOLD_SECTION_CSS}</style>
            <FoldEdge variant="diag" />
            <div className="pw">
              <p className="p-eyebrow">Same group</p>
              <h2 id="rel-h" className="p-h2" style={{ marginBottom: 'var(--space-lg)' }}>Related parts</h2>
              <PartGrid items={related} level={3} />
            </div>
          </section>
        )}

        <StickyEnquiryBar name={p.name} slug={p.slug} material={p.material} />
      </div>

      <EnquiryBand fold="register" heading={`Need ${p.name}?`} text="Share the quantity and use, and we will reply with a quote." />
      <JsonLd data={productJsonLd(p, g)} />
    </>
  );
}
