'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import PageHero from '@/components/page/PageHero';
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

  return (
    <>
      <PageHero
        crumbs={[
          { label: 'Products', href: '/products/' },
          ...(g ? [{ label: g.name, href: `/products/${g.slug}/` }] : []),
          { label: product.name },
        ]}
        label={g?.name ?? 'Product'}
        title={product.name}
        lead={product.summary}
        enter="rise"
        layout="center"
      />
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
