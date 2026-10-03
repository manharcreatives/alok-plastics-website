'use client';
/**
 * Applies the owner's SEO edits (products.json) to the live document after hydration:
 * document.title, meta description, og:/twitter: title + description, and the Product
 * JSON-LD block (name / description / image).
 *
 * LIMIT: this is a static export. Crawlers and link-preview bots that do not execute
 * JavaScript keep seeing the build-time tags; only JS-running agents (Googlebot renders
 * JS, browsers, most share-sheets that open the page) see the edited ones. Build-time
 * SEO is unchanged. Nothing here ever blanks a tag: only non-empty values are written.
 */
import { useEffect } from 'react';
import type { Product } from '@/content/types';
import { useHiddenProductSlugs, useProductOverride } from '@/components/runtime/useRuntime';
import { productOffer } from '@/lib/seo';
import { commerceOf } from './pdp-data';

function setMeta(attr: 'name' | 'property', key: string, value: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', value);
}

export default function ProductSeoRuntime({ product }: { product: Product }) {
  const o = useProductOverride(product.slug);

  const hiddenSet = useHiddenProductSlugs();
  const hidden = hiddenSet.has(product.slug);

  useEffect(() => {
    if (!o) return;
    const c = commerceOf(product, o, hidden);
    const { seoTitle, seoDescription } = o;
    if (seoTitle) {
      document.title = seoTitle;
      setMeta('property', 'og:title', seoTitle);
      setMeta('name', 'twitter:title', seoTitle);
    }
    if (seoDescription) {
      setMeta('name', 'description', seoDescription);
      setMeta('property', 'og:description', seoDescription);
      setMeta('name', 'twitter:description', seoDescription);
    }

    const desc = seoDescription ?? o.summary ?? o.description;
    for (const script of document.querySelectorAll<HTMLScriptElement>('script[type="application/ld+json"]')) {
      try {
        const data = JSON.parse(script.textContent ?? '');
        if (!data || data['@type'] !== 'Product') continue;
        if (o.name) data.name = o.name;
        if (desc) data.description = desc;
        if (o.sku) data.sku = o.sku;
        if (o.images.length > 0) data.image = o.images.map(i => new URL(i.url, location.origin).href);
        if (c.price !== null) {
          data.offers = productOffer({
            price: c.price,
            url: typeof data.url === 'string' ? data.url : location.href,
            availability: c.availability,
            discontinued: c.unavailable,
          });
        }
        script.textContent = JSON.stringify(data).replace(/</g, '\u003c');
      } catch {
        /* leave a block we cannot parse exactly as it was */
      }
    }
  }, [o, product, hidden]);

  return null;
}
