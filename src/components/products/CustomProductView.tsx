'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import PageHero from '@/components/page/PageHero';
import Breadcrumbs from '@/components/page/Breadcrumbs';
import EnquiryBand from '@/components/page/EnquiryBand';
import Pictogram from '@/components/brand/Pictogram';
import ProductGallery from '@/components/products/ProductGallery';
import StickyEnquiryBar from '@/components/products/StickyEnquiryBar';
import RelatedProducts from '@/components/products/RelatedProducts';
import ProductBuyBox from '@/components/products/ProductBuyBox';
import ProductSpecs from '@/components/products/ProductSpecs';
import { MACHINE_LABELS, getGroup, knownMachines } from '@/content/products';
import { useRuntimeCustomProducts } from '@/components/runtime/useRuntime';
import { fetchRuntimeData } from '@/lib/runtime-data';
import './products.css';

/* Admin products with an uploaded photo: the photo fills the hero as a slightly darkened background, and the
   title, breadcrumb and summary sit on a translucent canvas panel so they stay readable on top of it. */
const HERO_CSS = `
.cp-hero { position: relative; isolation: isolate; display: flex; align-items: flex-end; min-height: min(72svh, 640px);
  background-color: var(--ink); background-size: cover; background-position: center; background-repeat: no-repeat; }
.cp-hero__shade { position: absolute; inset: 0; z-index: 0; background: color-mix(in srgb, var(--ink) 58%, transparent); }
.cp-hero__inner { position: relative; z-index: 1; width: 100%; padding-top: 128px; padding-bottom: var(--space-xl); }
.cp-hero__panel { max-width: 40rem; padding: var(--space-md); border-radius: var(--radius-card);
  background: color-mix(in srgb, var(--canvas) 88%, transparent); }
.cp-hero__label { font-size: var(--fs-label); text-transform: uppercase; letter-spacing: var(--tr-label); color: var(--grey-metal-text);
  font-weight: 600; font-family: var(--font-archivo), sans-serif; line-height: var(--lh-label); margin: var(--space-md) 0 var(--space-xs); }
.cp-hero__h1 { font-family: var(--font-archivo), sans-serif; font-variation-settings: "wdth" 125; font-weight: 650;
  font-size: clamp(2rem, 7.4vw, 2.75rem); line-height: 1.04; letter-spacing: -0.03em; color: var(--ink); margin: 0; text-wrap: balance; overflow-wrap: break-word; }
.cp-hero__lead { font-size: 1.0625rem; line-height: 1.65; color: var(--body); margin: var(--space-sm) 0 0; text-wrap: pretty; }
@media (min-width: 768px) { .cp-hero__h1 { font-size: var(--fs-display); } .cp-hero__panel { padding: var(--space-lg); } }
`;

export default function CustomProductView() {
  const slug = useSearchParams().get('s') ?? '';
  const customs = useRuntimeCustomProducts();
  const [settled, setSettled] = useState(false);

  useEffect(() => {
    let live = true;
    fetchRuntimeData().then(() => { if (live) setSettled(true); });
    return () => { live = false; };
  }, []);

  const product = customs.find(p => p.slug === slug);

  if (!product) {
    return (
      <section className="p-section p-section--surface" style={{ paddingTop: '30vh' }}>
        <div className="pw" style={{ maxWidth: '46rem' }}>
          {settled ? (
            <>
              <h1 className="p-h2">We could not find that product.</h1>
              <p className="p-lead">It may have been removed. Browse the catalogue or tell us what you need.</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-sm)', marginTop: 'var(--space-md)' }}>
                <Link href="/products/" className="btn btn--primary" style={{ minHeight: 48, padding: '0 var(--space-md)' }}>View catalogue</Link>
                <Link href="/enquiry/" className="btn btn--secondary" style={{ minHeight: 48, padding: '0 var(--space-md)' }}>Send an enquiry</Link>
              </div>
            </>
          ) : (
            <p role="status" style={{ color: 'var(--muted)' }}>Loading product…</p>
          )}
        </div>
      </section>
    );
  }

  const g = product.group ? getGroup(product.group) : undefined;
  const machines = knownMachines(product);

  const crumbs = [
    { label: 'Products', href: '/products/' },
    ...(g ? [{ label: g.name, href: `/products/${g.slug}/` }] : []),
    { label: product.name },
  ];
  const heroPhoto = product.images[0]?.src;

  return (
    <>
      {heroPhoto ? (
        <section className="cp-hero" aria-labelledby="cp-title" style={{ backgroundImage: `url("${heroPhoto}")` }}>
          <style>{HERO_CSS}</style>
          <div className="cp-hero__shade" aria-hidden="true" />
          <div className="pw cp-hero__inner">
            <div className="cp-hero__panel">
              <Breadcrumbs items={crumbs} />
              <p className="cp-hero__label">{g?.name ?? 'Product'}</p>
              <h1 id="cp-title" className="cp-hero__h1">{product.name}</h1>
              {product.summary && <p className="cp-hero__lead">{product.summary}</p>}
            </div>
          </div>
        </section>
      ) : (
        <PageHero
          crumbs={crumbs}
          label={g?.name ?? 'Product'}
          title={product.name}
          lead={product.summary}
          enter="rise"
          layout="center"
        />
      )}
      <div>
        <section aria-labelledby="spec-h" className="p-section p-section--surface">
          <div className="pw">
            <div className="p-detail">
              <div className="p-detail__sheet"><ProductGallery product={product} /></div>
              <div className="p-info">
                <ProductBuyBox product={product} />
                <ProductSpecs product={product} groupName={g?.name ?? 'Spare parts'} />
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
              </div>
            </div>
          </div>
        </section>
        <RelatedProducts product={product} />
        <StickyEnquiryBar product={product} />
      </div>
      <EnquiryBand fold="register" heading={`Need ${product.name}?`} text="Share the quantity and use, and we will reply with a quote." />
    </>
  );
}
