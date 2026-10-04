/**
 * SuccessNext — what to do after an enquiry is sent: call, email, or browse parts.
 * Phone / email render only when they exist in site.contact (§19). Never WhatsApp (round 2, ask 17).
 */
import Link from 'next/link';
import { Phone } from '@phosphor-icons/react/dist/ssr/Phone';
import { EnvelopeSimple } from '@phosphor-icons/react/dist/ssr/EnvelopeSimple';
import { ArrowUpRight } from '@phosphor-icons/react/dist/ssr/ArrowUpRight';
import { telHref } from '@/content/site';
import { useRuntimeContact } from '@/components/runtime/useRuntime';

const CSS = `
.sn { display: flex; flex-wrap: wrap; gap: var(--space-xs); }
.sn a { display: inline-flex; align-items: center; gap: var(--space-xs); min-height: 44px; padding: 0 var(--space-sm); border-radius: var(--radius-card);
  font-size: 0.9375rem; font-weight: 650; text-decoration: none; border: 1px solid var(--burgundy); color: var(--burgundy); background: var(--surface); }
.sn a:hover { background: var(--blush); }
.sn a:focus-visible { outline: 2px solid var(--burgundy); outline-offset: 2px; }
.sn--dark a { border-color: var(--rose-pale); color: var(--surface); background: transparent; }
.sn--dark a:hover { background: color-mix(in srgb, var(--surface) 12%, transparent); }
.sn--dark a:focus-visible { outline-color: var(--rose-pale); }
.sn a svg { transition: transform 200ms cubic-bezier(.16,1,.3,1); }
.sn a:hover svg { transform: translate3d(2px, -2px, 0); }
@media (prefers-reduced-motion: reduce) { .sn a svg { transition: none; } }
`;

export default function SuccessNext({ onLight }: { onLight: boolean }) {
  const { phone, email } = useRuntimeContact();
  return (
    <div className={onLight ? 'sn' : 'sn sn--dark'}>
      <style>{CSS}</style>
      {phone && <a href={telHref(phone)}><Phone size={18} weight="light" aria-hidden="true" /> Call us</a>}
      {email && <a href={`mailto:${email}`}><EnvelopeSimple size={18} weight="light" aria-hidden="true" /> Email us</a>}
      <Link href="/products/">Browse products <ArrowUpRight size={18} weight="light" aria-hidden="true" /></Link>
    </div>
  );
}
