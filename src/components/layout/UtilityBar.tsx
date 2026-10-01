/**
 * UtilityBar — §9.2 / §4.1 (igus pattern)
 * 32px, --mist background. Scrolls away with the page.
 * Content: verified claims only — no invented data (§19).
 */

import { site } from '@/content/site';

export default function UtilityBar() {
  const whatsapp = site.contact.whatsapp;

  return (
    <div
      className="utility-bar"
      style={{
        height: 32,
        background: 'var(--mist)',
        borderBottom: '1px solid var(--grey-cloud)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '0.75rem',
        color: 'var(--muted)',
        letterSpacing: '0.06em',
        overflow: 'hidden',
        position: 'relative',
        zIndex: 49,
        whiteSpace: 'nowrap',
        userSelect: 'none',
      }}
      aria-label="Company information"
    >
      <div style={{
        maxWidth: 'var(--grid-max)',
        width: '100%',
        padding: '0 var(--grid-page-padding)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--space-sm)',
      }}>
        <span>Since 1998</span>
        <span aria-hidden="true" style={{ color: 'var(--grey-cloud)', fontSize: '0.5rem' }}>◆</span>
        <span>Pan-Bharat dispatch</span>
        <span className="utility-bar__extra">
        {whatsapp && (
          <>
            <span aria-hidden="true" style={{ color: 'var(--grey-cloud)', fontSize: '0.5rem' }}>◆</span>
            <a
              href={`https://wa.me/${whatsapp.replace(/\D/g, '')}`}
              style={{ color: 'var(--whatsapp)', textDecoration: 'none', fontWeight: 600 }}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`WhatsApp us at ${whatsapp}`}
            >
              WhatsApp: {whatsapp}
            </a>
          </>
        )}
        {!whatsapp && (
          <>
            <span aria-hidden="true" style={{ color: 'var(--grey-cloud)', fontSize: '0.5rem' }}>◆</span>
            <span>Moulded plastic &amp; steel parts, Chandigarh</span>
          </>
        )}
        </span>
      </div>
    </div>
  );
}
