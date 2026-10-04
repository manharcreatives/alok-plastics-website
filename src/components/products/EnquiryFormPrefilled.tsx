'use client';
/**
 * EnquiryFormPrefilled — drop-in replacement for <FullEnquiryForm /> on /enquiry/.
 * Reads ?product=<slug> from location.search after hydration (static export has no
 * request-time query) and remounts the form with that part pre-selected.
 * Usage in src/app/enquiry/page.tsx: replace <FullEnquiryForm /> with <EnquiryFormPrefilled />.
 */
import { useSyncExternalStore } from 'react';
import FullEnquiryForm from '@/components/forms/FullEnquiryForm';
import { getProduct } from '@/content/products';
import { useProductOverride } from '@/components/runtime/useRuntime';

const subscribe = () => () => {};
function read(): string {
  try {
    const slug = new URLSearchParams(window.location.search).get('product');
    const p = slug ? getProduct(slug) : undefined;
    return p && p.published ? p.slug : '';
  } catch {
    return '';
  }
}

export default function EnquiryFormPrefilled() {
  const slug = useSyncExternalStore(subscribe, read, () => '');
  const o = useProductOverride(slug);
  const name = slug ? (o?.name ?? getProduct(slug)?.name ?? '') : '';
  return <FullEnquiryForm key={name || 'blank'} prefillProduct={name || undefined} />;
}
