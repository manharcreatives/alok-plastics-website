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

const subscribe = () => () => {};
function read(): string {
  try {
    const slug = new URLSearchParams(window.location.search).get('product');
    const p = slug ? getProduct(slug) : undefined;
    return p && p.published ? p.name : '';
  } catch {
    return '';
  }
}

export default function EnquiryFormPrefilled() {
  const name = useSyncExternalStore(subscribe, read, () => '');
  return <FullEnquiryForm key={name || 'blank'} prefillProduct={name || undefined} />;
}
