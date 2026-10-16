'use client';

/**
 * AnnouncementBanner — a news-style scrolling ticker just below the header, driven by `settings.json`.
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
.ab { position: fixed; z-index: 49; top: 88px; left: 50%; translate: -50% 0;
  width: min(1360px, calc(100% - 32px)); height: 34px; overflow: hidden; display: flex; align-items: center;
  background: var(--burgundy); color: var(--surface); text-decoration: none; border-radius: 2px;
  box-shadow: 0 4px 16px rgba(30, 17, 21, 0.12);
  transition: transform 400ms cubic-bezier(.16, 1, .3, 1); }
/* When the navbar slides away on scroll, the strip goes with it. */
body:has(.glass-nav--hidden) .ab { transform: translate3d(0, calc(-100% - 100px), 0); }
@media (max-width: 639px) { .ab { top: 80px; width: calc(100% - 16px); } }
/* The strip hangs over the top of the page, so page heroes keep their text clear of it. */
body:has(.ab) .hero__content { padding-top: calc(96px + var(--space-sm) + 42px); }
body:has(.ab) .ph__body { padding-top: 150px; }
.ab__track { display: flex; width: max-content; animation: ab-scroll var(--ab-dur, 30s) linear infinite; will-change: transform; }
.ab:hover .ab__track, .ab:focus-visible .ab__track { animation-play-state: paused; }
.ab__group { display: flex; flex-shrink: 0; align-items: center; }
.ab__text { margin: 0; padding: 0 var(--space-md); white-space: nowrap; font-family: var(--font-inter); font-size: var(--fs-label);
  font-weight: 600; letter-spacing: var(--tr-label); text-transform: uppercase; line-height: 34px; }
.ab__text::after { content: '◆'; margin-left: var(--space-md); font-size: 0.6em; opacity: .7; vertical-align: middle; }
a.ab:hover .ab__text, a.ab:focus-visible .ab__text { color: var(--rose-pale); }
.ab:focus-visible { outline: 2px solid var(--rose-pale); outline-offset: -2px; }
@keyframes ab-scroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }
@media (prefers-reduced-motion: reduce) {
  .ab__track { animation: none; width: 100%; }
  .ab__group[aria-hidden='true'] { display: none; }
  .ab__text { overflow: hidden; text-overflow: ellipsis; }
  .ab__text::after { content: none; }
}
`;

export default function AnnouncementBanner() {
  const banner = useRuntimeBanner();
  if (!banner) return null;

  /* A news-style ticker: the message repeats so the loop is seamless; the second group is hidden from assistive tech. */
  const reps = Math.max(2, Math.ceil(90 / Math.max(10, banner.text.length)));
  const group = (hidden: boolean) => (
    <span className="ab__group" aria-hidden={hidden || undefined}>
      {Array.from({ length: reps }, (_, i) => <p className="ab__text" key={i}>{banner.text}</p>)}
    </span>
  );
  const dur = Math.max(18, Math.round(banner.text.length * reps * 0.28));
  const inner = (
    <span className="ab__track" style={{ ['--ab-dur' as string]: `${dur}s` }}>
      {group(false)}
      {group(true)}
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
