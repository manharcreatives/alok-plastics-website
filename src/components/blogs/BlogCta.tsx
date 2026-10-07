'use client';

/**
 * BlogCta: closing action panel on a post. Enquiry form, WhatsApp and phone, all from the
 * runtime contact (panel values over site.contact), nothing hardcoded. WhatsApp / phone render
 * only when a number exists.
 */
import Link from 'next/link';
import { ArrowUpRight } from '@phosphor-icons/react/dist/csr/ArrowUpRight';
import { Phone } from '@phosphor-icons/react/dist/csr/Phone';
import { WhatsappLogo } from '@phosphor-icons/react/dist/csr/WhatsappLogo';
import { telHref } from '@/content/site';
import { waLink } from '@/lib/whatsapp';
import { trackPhoneClick, trackQuoteCtaClick, trackWhatsAppClick } from '@/lib/analytics';
import { useRuntimeContact } from '@/components/runtime/useRuntime';
import './blogs.css';

type Props = { slug: string; title: string; heading?: string; text?: string };

export default function BlogCta({
  slug,
  title,
  heading = 'Need this part? Tell us what you need.',
  text = 'Send the part name, a photo or sample, the size and the quantity. We confirm availability and reply with a quote.',
}: Props) {
  const { phone, whatsapp } = useRuntimeContact();
  const wa = waLink(`Hello Alok Plastics! I read your guide "${title}" and would like to enquire about spare parts.`, whatsapp);
  return (
    <section aria-labelledby="bl-cta-h" className="bl-cta">
      <div className="bl-pw">
        <div className="bl-cta__box">
          <div>
            <p className="bl-eyebrow">Next step</p>
            <h2 id="bl-cta-h" className="bl-cta__h">{heading}</h2>
            <p className="bl-cta__p">{text}</p>
          </div>
          <div className="bl-cta__row">
            <Link href="/enquiry/" className="bl-btn bl-btn--primary" onClick={() => trackQuoteCtaClick({ source: `blog-${slug}` })}>
              Get a Quote <ArrowUpRight size={18} weight="light" aria-hidden="true" />
            </Link>
            {wa && (
              <a className="bl-btn bl-btn--wa" href={wa} target="_blank" rel="noopener noreferrer"
                onClick={() => trackWhatsAppClick({ source: 'product', productSlug: `blog-${slug}` })}>
                <WhatsappLogo size={18} weight="light" aria-hidden="true" /> WhatsApp us
              </a>
            )}
            {phone && (
              <a className="bl-btn bl-btn--ghost" href={telHref(phone)} onClick={() => trackPhoneClick(`blog-${slug}`)}>
                <Phone size={18} weight="light" aria-hidden="true" /> Call now
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
