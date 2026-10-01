/** Sticky enquiry bar for the product detail page — Get a Quote (prefilled) + Call when a number exists. */
import Link from 'next/link';
import { ArrowUpRight } from '@phosphor-icons/react/dist/ssr/ArrowUpRight';
import { Phone } from '@phosphor-icons/react/dist/ssr/Phone';
import Tag from '@/components/ui/Tag';
import { site, telHref } from '@/content/site';
import type { MaterialName } from '@/components/ui/Tag';
import './products.css';

export default function StickyEnquiryBar({ name, slug, material }: { name: string; slug: string; material?: MaterialName }) {
  const phone = site.contact.phone;
  return (
    <aside className="p-bar" aria-label={`Enquire about ${name}`}>
      <div className="p-bar__in">
        <div className="p-bar__id">
          <span className="p-bar__name">{name}</span>
          {material && <Tag material={material} />}
        </div>
        <div className="p-bar__btns">
          {phone && (
            <a className="p-btn p-btn--ghost" href={telHref(phone)}>
              <Phone size={18} weight="light" aria-hidden="true" /> Call
            </a>
          )}
          <Link className="p-btn p-btn--primary" href={`/enquiry/?product=${slug}`}>
            Get a Quote <ArrowUpRight size={18} weight="light" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </aside>
  );
}
