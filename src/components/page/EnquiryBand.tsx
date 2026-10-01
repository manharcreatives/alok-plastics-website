/**
 * EnquiryBand — closing CTA band used at the end of every inner page (§8.3).
 * Light (mist) so it never touches the burgundy footer as a second burgundy block.
 */
import Link from 'next/link';
import { waGeneral } from '@/lib/whatsapp';

interface Props { heading?: string; text?: string; waHref?: string | null }

export default function EnquiryBand({
  heading = 'Need a part? Tell us what you need.',
  text = 'Share the part name, quantity and use — we reply with a quote.',
  waHref,
}: Props) {
  const wa = waHref === undefined ? waGeneral() : waHref;
  const btn = { display: 'inline-flex', alignItems: 'center', gap: 8, padding: '0.75rem 1.5rem', borderRadius: 'var(--radius-card)', fontWeight: 600, fontSize: '0.9375rem', textDecoration: 'none' } as const;
  return (
    <section aria-labelledby="enquiry-band-h" style={{ background: 'var(--surface-alt)', borderTop: '1px solid var(--grey-cloud)', padding: 'var(--space-xl) var(--grid-page-padding)' }}>
      <div style={{ maxWidth: 'calc(var(--grid-max) + 2 * var(--grid-page-padding))', margin: '0 auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-md)' }}>
        <div style={{ maxWidth: '56ch' }}>
          <h2 id="enquiry-band-h" style={{ fontFamily: 'var(--font-archivo)', fontVariationSettings: '"wdth" 125', fontSize: 'clamp(1.375rem, 2.6vw, 2rem)', fontWeight: 650, letterSpacing: '-0.02em', color: 'var(--ink)', marginBottom: 'var(--space-xs)' }}>{heading}</h2>
          <p style={{ color: 'var(--body)', lineHeight: 1.6 }}>{text}</p>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-sm)' }}>
          <Link href="/enquiry/" style={{ ...btn, background: 'var(--burgundy)', color: 'white' }}>Get a Quote</Link>
          <a href={wa ?? '/enquiry/'} style={{ ...btn, background: 'var(--whatsapp)', color: 'white' }}>WhatsApp Us</a>
        </div>
      </div>
    </section>
  );
}
