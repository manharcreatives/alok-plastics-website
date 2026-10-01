/**
 * S13 · WhatsAppFAB — §13
 * Floating WhatsApp button (fixed, bottom-right, above the safe-area inset).
 * Hides while #enquiry or the site footer is in the viewport (IntersectionObserver)
 * so it never covers the enquiry form or footer text.
 * Renders nothing if site.contact.whatsapp is null.
 * Pulse animation is gated by @media (prefers-reduced-motion: no-preference).
 */

'use client';

import { useState, useEffect } from 'react';
import { waGeneral } from '@/lib/whatsapp';
import { trackWhatsAppClick } from '@/lib/analytics';

/* Elements that the FAB must never overlap */
const AVOID_IDS = ['enquiry', 'site-footer'];

const FAB_CSS = `
.wa-fab {
  position: fixed;
  bottom: calc(var(--space-sm) + env(safe-area-inset-bottom, 0px));
  right: calc(var(--space-sm) + env(safe-area-inset-right, 0px));
  width: 56px; height: 56px;
  border-radius: var(--radius-card);
  background: var(--whatsapp);
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 4px 16px color-mix(in srgb, var(--burgundy-night) 30%, transparent);
  z-index: 200;
  text-decoration: none;
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.wa-fab:focus-visible { outline: 2px solid var(--burgundy); outline-offset: 3px; }
.wa-fab[data-hidden="true"] { opacity: 0; pointer-events: none; transform: scale(0.85); }
@media (prefers-reduced-motion: no-preference) {
  .wa-fab[data-hidden="false"] { animation: fab-pulse 2.4s ease-in-out infinite; }
}
@keyframes fab-pulse {
  0%, 100% { box-shadow: 0 4px 16px color-mix(in srgb, var(--burgundy-night) 30%, transparent), 0 0 0 0 color-mix(in srgb, var(--whatsapp) 50%, transparent); }
  50%      { box-shadow: 0 4px 16px color-mix(in srgb, var(--burgundy-night) 30%, transparent), 0 0 0 10px color-mix(in srgb, var(--whatsapp) 0%, transparent); }
}
@media (prefers-reduced-motion: reduce) { .wa-fab { transition: none; } }
`;

export default function WhatsAppFAB() {
  const [hidden, setHidden] = useState(false);
  const waHref = waGeneral();

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
        <svg width="28" height="28" viewBox="0 0 24 24" fill="white" aria-hidden="true">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
          <path d="M12 0C5.373 0 0 5.373 0 12c0 2.115.549 4.1 1.509 5.824L0 24l6.337-1.487A11.953 11.953 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 0 1-5.026-1.376l-.361-.214-3.761.882.936-3.643-.235-.374A9.818 9.818 0 1 1 12 21.818z" />
        </svg>
      </a>
    </>
  );
}
