'use client';

/**
 * AnnouncementBanner — the strip above the header, driven by `settings.json`.
 *
 * Renders nothing at all unless the owner has switched it on and written text, so the
 * common case costs zero pixels and the site keeps the clean edge it has now. There is
 * no dismiss button on purpose: the panel is the switch, and a strip the visitor can
 * hide is a strip they will hide.
 *
 * The href is the panel's own value, already validated as https:// or a /path/ by
 * AlokContent::url. Anything that did not pass that check is null by the time it
 * reaches here, so this renders a plain <a> and lets React handle the URL.
 */

import { useRuntimeBanner } from './useRuntime';

const CSS = `
.ab { display: block; background: var(--burgundy); color: var(--surface); text-decoration: none; }
.ab__in { display: flex; align-items: center; justify-content: center; gap: var(--space-xs);
  min-height: 44px; max-width: calc(var(--grid-max) + 2 * var(--grid-page-padding));
  margin: 0 auto; padding: var(--space-xs) var(--grid-page-padding); }
.ab__text { margin: 0; font-family: var(--font-inter); font-size: var(--fs-label);
  font-weight: 600; letter-spacing: var(--tr-label); text-transform: uppercase;
  line-height: var(--lh-label); text-align: center; text-wrap: balance; }
a.ab:hover .ab__text, a.ab:focus-visible .ab__text { color: var(--rose-pale); }
.ab:focus-visible { outline: 2px solid var(--rose-pale); outline-offset: -2px; }
`;

export default function AnnouncementBanner() {
  const banner = useRuntimeBanner();
  if (!banner) return null;

  const inner = (
    <span className="ab__in">
      <p className="ab__text">{banner.text}</p>
    </span>
  );

  if (!banner.href) {
    return (
      <div className="ab" role="note">
        <style>{CSS}</style>
        {inner}
      </div>
    );
  }

  /* A /path/ href stays inside the site; an https:// one opens in a new tab. */
  const external = banner.href.startsWith('http');
  return (
    <a className="ab" href={banner.href} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
      <style>{CSS}</style>
      {inner}
    </a>
  );
}
