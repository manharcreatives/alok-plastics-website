'use client';

import { MapPin } from '@phosphor-icons/react/dist/ssr/MapPin';
import { Phone } from '@phosphor-icons/react/dist/ssr/Phone';
import { EnvelopeSimple } from '@phosphor-icons/react/dist/ssr/EnvelopeSimple';
import { ArrowUpRight } from '@phosphor-icons/react/dist/ssr/ArrowUpRight';
import { site, formatAddressLines, mapsHref, telHref, MAPS_ARIA_LABEL } from '@/content/site';
import { useRuntimeContact, useRuntimeHours } from '@/components/runtime/useRuntime';

/** Contact details card. Rows render only when set; values follow the admin panel. */
export function ContactSheet() {
  const c = useRuntimeContact();
  const [line1, line2] = formatAddressLines(c);

  return (
    <div className="cp-sheet">
      <a className="ct-addr" href={mapsHref(c)} target="_blank" rel="noopener noreferrer" aria-label={MAPS_ARIA_LABEL}>
        <span className="ct-addr__pin" aria-hidden="true"><MapPin size={24} weight="light" /></span>
        <address className="ct-addr__t">
          {site.name}
          <span>{line1}<br />{line2}</span>
        </address>
        <ArrowUpRight className="ct-addr__go" size={24} weight="light" aria-hidden="true" />
      </a>
      {c.phone && (
        <div className="ct-row">
          <Phone size={24} weight="light" aria-hidden="true" />
          <div><span className="ct-label">Phone</span><a className="ct-link" href={telHref(c.phone)}>{c.phone}</a></div>
        </div>
      )}
      {c.email && (
        <div className="ct-row">
          <EnvelopeSimple size={24} weight="light" aria-hidden="true" />
          <div><span className="ct-label">Email</span><a className="ct-link" href={`mailto:${c.email}`}>{c.email}</a></div>
        </div>
      )}
      {c.gstin && (
        <div className="ct-row">
          <span aria-hidden="true" style={{ width: 24 }} />
          <div><span className="ct-label">GSTIN</span><span className="ct-val">{c.gstin}</span></div>
        </div>
      )}
    </div>
  );
}

/** Visiting-hours row: the panel's schedule, or the build-time "to be confirmed" wording. */
export function VisitingHours() {
  const hours = useRuntimeHours();
  if (!hours || (hours.rows.length === 0 && !hours.note)) {
    return <dd>Please send an enquiry first and we will reply.</dd>;
  }
  return (
    <dd>
      {hours.rows.map(r => <span key={r.label} style={{ display: 'block' }}>{r.label}: {r.value}</span>)}
      {hours.note && <span style={{ display: 'block' }}>{hours.note}</span>}
    </dd>
  );
}
