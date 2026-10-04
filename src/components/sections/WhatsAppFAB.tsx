/**
 * S13 · WhatsAppFAB — §13
 * Floating WhatsApp button — the ONLY WhatsApp control on the site. Fixed, bottom-right
 * on every viewport, 56px circle, 16px from the edges (products' sticky bar reserves 72px
 * on its right so the two never overlap).
 * Hides while #enquiry or the site footer is in the viewport (IntersectionObserver)
 * so it never covers the enquiry form or footer text.
 * Renders nothing if site.contact.whatsapp is null.
 * Attention ring (plays twice, then stops) is gated by @media (prefers-reduced-motion: no-preference).
 */

'use client';

import { useState, useEffect } from 'react';
import { WhatsappLogo } from '@phosphor-icons/react/dist/csr/WhatsappLogo';
import { waLink } from '@/lib/whatsapp';
import { useRuntimeContact } from '@/components/runtime/useRuntime';
import { trackWhatsAppClick } from '@/lib/analytics';

/* Elements that the FAB must never overlap */
const AVOID_IDS = ['enquiry', 'site-footer'];

const FAB_CSS = `
.wa-fab {
  position: fixed;
  bottom: calc(var(--space-sm) + env(safe-area-inset-bottom, 0px));
  right: calc(var(--space-sm) + env(safe-area-inset-right, 0px));
  width: 56px; height: 56px;
  border-radius: 50%; /* FAB: one of the three allowed circles (§3 row 8) */
  background: var(--whatsapp);
  color: var(--surface);
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 4px 16px color-mix(in srgb, var(--burgundy-night) 30%, transparent);
  z-index: 200;
  text-decoration: none;
  transition: opacity 400ms cubic-bezier(.16,1,.3,1), transform 400ms cubic-bezier(.16,1,.3,1);
}
.wa-fab:focus-visible { outline: 2px solid var(--burgundy); outline-offset: 3px; }
.wa-fab[data-hidden="true"] { opacity: 0; pointer-events: none; transform: scale(0.85); }
/* Attention ring: a transform/opacity ring that plays twice, then stops (no box-shadow, no loop) */
.wa-fab::after { content: ''; position: absolute; inset: 0; border-radius: 50%; border: 2px solid var(--whatsapp);
  opacity: 0; pointer-events: none; }
@media (prefers-reduced-motion: no-preference) {
  .wa-fab[data-hidden="false"]::after { animation: fab-ring 1200ms cubic-bezier(.16,1,.3,1) 1200ms 2 both; }
}
@keyframes fab-ring {
  0%   { transform: scale(1); opacity: .7; }
  100% { transform: scale(1.7); opacity: 0; }
}
@media (prefers-reduced-motion: reduce) { .wa-fab { transition: none; } }
`;

export default function WhatsAppFAB() {
  const [hidden, setHidden] = useState(false);
  /* The panel's WhatsApp number, overlaid on the build-time one (null until it arrives). */
  const { whatsapp } = useRuntimeContact();
  const waHref = waLink(
    'Hello Alok Plastics! I would like to enquire about spare parts.',
    whatsapp,
  );

  useEffect(() => {
    if (!waHref || typeof IntersectionObserver === 'undefined') return;
    const inView = new Set<string>();
    const io = new IntersectionObserver(
      entries => {
        for (const e of entries) {
          if (e.isIntersecting) inView.add(e.target.id);
          else inView.delete(e.target.id);
        }
        setHidden(inView.size > 0);
      },
      { threshold: 0.05 },
    );
    AVOID_IDS.forEach(id => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, [waHref]);

  /* Don't render without a WhatsApp number */
  if (!waHref) return null;

  return (
    <>
      <style>{FAB_CSS}</style>
      <a
        href={waHref}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with Alok Plastics on WhatsApp"
        className="wa-fab"
        data-hidden={hidden ? 'true' : 'false'}
        tabIndex={hidden ? -1 : 0}
        aria-hidden={hidden ? true : undefined}
        onClick={() => trackWhatsAppClick({ source: 'fab' })}
      >
        <WhatsappLogo weight="fill" size={30} aria-hidden="true" />
      </a>
    </>
  );
}
