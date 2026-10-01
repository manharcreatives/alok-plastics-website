/**
 * Analytics event helpers — §14 spec.
 * All events push to window.dataLayer (GTM-compatible).
 * Scripts only load when site.analytics.ga4Id is set (privacy-safe).
 * This module is safe to import server-side (events are no-ops if window is unavailable).
 */

import { site } from '@/content/site';

/* GA4 ID is configured in site.ts — null until client provides it */
export const analyticsEnabled = !!site.analytics.ga4Id;

type DataLayerEvent = {
  event: string;
  [key: string]: unknown;
};

function push(payload: DataLayerEvent): void {
  if (typeof window === 'undefined') return;
  if (!analyticsEnabled) return;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).dataLayer = (window as any).dataLayer ?? [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).dataLayer.push(payload);
}

/* ── Event definitions (§14 spec) ──────────────────────────────── */

/** User submitted an enquiry form (success) */
export function trackEnquirySubmit(opts: {
  source: 'home-enquiry' | 'enquiry-page' | 'product-page' | 'footer';
  buyerType?: string;
  productCount?: number;
}): void {
  push({
    event: 'enquiry_submit',
    enquiry_source: opts.source,
    buyer_type: opts.buyerType ?? 'unknown',
    product_count: opts.productCount ?? 1,
  });
}

/** User clicked a WhatsApp link/button */
export function trackWhatsAppClick(opts: {
  source: 'hero' | 'fab' | 'product' | 'footer' | 'enquiry-section' | 'nav';
  productSlug?: string;
}): void {
  push({
    event: 'whatsapp_click',
    whatsapp_source: opts.source,
    product_slug: opts.productSlug ?? null,
  });
}

/** User clicked a phone link */
export function trackPhoneClick(source: string): void {
  push({
    event: 'phone_click',
    phone_source: source,
  });
}

/** User clicked "Get a Quote" / "Enquire Now" CTA */
export function trackQuoteCtaClick(opts: {
  source: string;
  productSlug?: string;
}): void {
  push({
    event: 'quote_cta_click',
    cta_source: opts.source,
    product_slug: opts.productSlug ?? null,
  });
}

/** Catalogue PDF download (future use) */
export function trackCatalogueDownload(): void {
  push({ event: 'catalogue_download' });
}
