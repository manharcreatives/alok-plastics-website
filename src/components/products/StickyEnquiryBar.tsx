/** Sticky enquiry bar for product detail — Enquire (prefilled) + WhatsApp (prefilled). */
import Link from 'next/link';
import './products.css';

export default function StickyEnquiryBar({ name, slug, waHref }: { name: string; slug: string; waHref: string | null }) {
  return (
    <aside className="p-bar" aria-label={`Enquire about ${name}`}>
      <div className="p-bar__in">
        <span className="p-bar__name">{name}</span>
        <div className="p-bar__btns">
          <Link className="p-btn p-btn--primary" href={`/enquiry/?product=${slug}`}>Enquire</Link>
          {waHref && (
            <a className="p-btn p-btn--wa" href={waHref} target="_blank" rel="noopener noreferrer">WhatsApp</a>
          )}
        </div>
      </div>
    </aside>
  );
}
