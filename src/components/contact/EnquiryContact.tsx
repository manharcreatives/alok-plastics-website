'use client';

import { MapPin } from '@phosphor-icons/react/dist/ssr/MapPin';
import { Phone } from '@phosphor-icons/react/dist/ssr/Phone';
import { EnvelopeSimple } from '@phosphor-icons/react/dist/ssr/EnvelopeSimple';
import { site, formatAddressLines, mapsHref, telHref, MAPS_ARIA_LABEL } from '@/content/site';
import { useRuntimeContact } from '@/components/runtime/useRuntime';

/** "Send it to <email>" fragment inside the drawing/photo tip. */
export function EnquiryEmailTip() {
  const { email } = useRuntimeContact();
  if (!email) return null;
  return <> or send it to <a href={`mailto:${email}`} style={{ color: 'var(--burgundy)', fontWeight: 600 }}>{email}</a></>;
}

/** Contact rows beside the enquiry form; values follow the admin panel. */
export function EnquiryContactRows() {
  const c = useRuntimeContact();
  const [addrLine1, addrLine2] = formatAddressLines(c);
  return (
    <div className="eq-contact">
      <a className="row" href={mapsHref(c)} target="_blank" rel="noopener noreferrer" aria-label={MAPS_ARIA_LABEL}>
        <MapPin size={22} weight="light" aria-hidden="true" />
        <span><b>{site.name}</b>{addrLine1},<br />{addrLine2}</span>
      </a>
      {c.phone && (
        <a className="row" href={telHref(c.phone)}>
          <Phone size={22} weight="light" aria-hidden="true" />
          <span><b>Phone</b>{c.phone}</span>
        </a>
      )}
      {c.email && (
        <a className="row" href={`mailto:${c.email}`}>
          <EnvelopeSimple size={22} weight="light" aria-hidden="true" />
          <span><b>Email</b>{c.email}</span>
        </a>
      )}
    </div>
  );
}
