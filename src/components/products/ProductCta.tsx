'use client';

import Link from 'next/link';
import { ArrowUpRight } from '@phosphor-icons/react/dist/ssr/ArrowUpRight';
import { Phone } from '@phosphor-icons/react/dist/ssr/Phone';
import { telHref } from '@/content/site';
import { useRuntimeContact } from '@/components/runtime/useRuntime';

export default function ProductCta({ slug }: { slug: string }) {
  const { phone } = useRuntimeContact();
  return (
    <div className="p-cta">
      {phone && (
        <a className="p-btn p-btn--ghost" href={telHref(phone)}>
          <Phone size={18} weight="light" aria-hidden="true" /> Call
        </a>
      )}
      <Link className="p-btn p-btn--primary" href={`/enquiry/?product=${slug}`}>
        Get a Quote <ArrowUpRight size={18} weight="light" aria-hidden="true" />
      </Link>
    </div>
  );
}
