/**
 * Hero section — §11.5
 * Full-bleed, 100svh (capped at 1000px; grows if content needs it).
 * Type block left-aligned, bottom 14vh.
 * Ambient mode (default) = light tone, --ink text, colour logo in nav.
 * Video/poster dark mode = white text, bright logo in nav.
 *
 * Entrance animation (post-preloader): SplitText lines, 90ms stagger, expo.out, 900ms.
 */

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import HeroMedia from './HeroMedia';
import { site } from '@/content/site';
import { waGeneral } from '@/lib/whatsapp';

/* Layout constants shared with the fixed header: utility bar 32px,
 * floating nav 40 + 64 → content must clear 104px. */
const HERO_STYLES = `
.hero { position: relative; display: flex; flex-direction: column; overflow: hidden;
  /* 100svh (§11.5). Minus the 32px utility bar so the diagonal cut lands on the fold. */
  min-height: min(calc(100svh - 32px), 1000px); }
.hero__content { position: relative; z-index: 2; flex: 1; display: flex; flex-direction: column;
  justify-content: flex-end; width: 100%; margin: 0 auto;
  max-width: calc(var(--grid-max) + 2 * var(--grid-page-padding));
  padding: calc(var(--space-xl) + var(--space-lg)) var(--grid-page-padding) calc(4vw + var(--space-xl)); }
.hero__h1 { font-family: var(--font-archivo, sans-serif); font-variation-settings: "wdth" 125;
  font-weight: 650; line-height: 1.05; letter-spacing: -0.03em;
  font-size: clamp(1.875rem, 8.2vw, 2.75rem); text-wrap: balance;
  margin: 0 0 var(--space-md); overflow-wrap: break-word; }
.hero__line { display: inline; }
.hero__sub { font-size: 1.0625rem; line-height: 1.65; max-width: 55ch; margin: 0 0 var(--space-lg); text-wrap: pretty; }
.hero__tagline { margin-bottom: var(--space-lg); max-width: 100%; }
.hero__tagline-row { display: flex; align-items: center; gap: var(--space-sm); }
.hero__dev { font-family: var(--font-devanagari, sans-serif); font-size: clamp(0.9375rem, 1.8vw, 1.25rem);
  font-weight: 600; line-height: 1.5; margin: 0; }
.hero__rule { flex: 0 0 auto; width: 40px; height: 1px; transform: translateY(0.12em); /* optical: Devanagari body sits below line-box centre */
  font-size: clamp(0.9375rem, 1.8vw, 1.25rem); }
.hero__ctas { display: flex; align-items: center; flex-wrap: wrap; gap: var(--space-sm); }
.hero__btn { display: inline-flex; align-items: center; justify-content: center; gap: var(--space-xs);
  min-height: 48px; padding: 0 var(--space-md); border-radius: var(--radius-card);
  color: white; font-weight: 600; font-size: 1rem; line-height: 1; text-decoration: none;
  transition: background-color .2s, filter .2s; white-space: nowrap; }
.hero__btn--primary { background: var(--burgundy); }
.hero__btn--primary:hover, .hero__btn--primary:focus-visible { background: var(--burgundy-deep); }
.hero__btn--wa { background: var(--whatsapp); }
.hero__btn--wa:hover, .hero__btn--wa:focus-visible { filter: brightness(1.1); }
.hero__link { font-size: 0.9375rem; text-decoration: underline; text-underline-offset: 3px;
  padding: var(--space-xs) var(--space-xs); min-height: 48px; display: inline-flex; align-items: center; }
.hero__cue { position: absolute; right: var(--grid-page-padding); bottom: calc(4vw + var(--space-lg));
  display: flex; flex-direction: column; align-items: center; gap: 4px; z-index: 3;
  transition: opacity .4s; pointer-events: none; }
.hero__cue-dot { animation: hero-scroll-dot 1.5s ease-in-out infinite; }
@keyframes hero-scroll-dot { 0% { top: 0; opacity: 1; } 80% { top: 36px; opacity: 0; } 100% { top: 0; opacity: 0; } }
@media (prefers-reduced-motion: reduce) { .hero__cue-dot { animation: none; } }

@media (min-width: 768px) {
  /* Exactly two balanced lines: each headline half is its own nowrap block.
     Size is conservative against Archivo wdth 125 (~0.66em/char × 26 chars ≈ 17em). */
  .hero__h1 { font-size: clamp(2rem, 4.4vw, 4.5rem); }
  .hero__line { display: block; white-space: nowrap; }
}
@media (max-width: 479px) {
  .hero__rule--lead { display: none; }
  .hero__btn { flex: 1 1 auto; }
}
/* Scroll cue collides with the content on tablets/phones and short screens — drop it */
@media (max-width: 1023px), (max-height: 760px) { .hero__cue { display: none; } }
`;

export default function Hero() {
  const isDark = site.hero.media.tone === 'dark';
  const isAmbient = site.hero.media.mode === 'ambient' ||
    (site.hero.media.mode === 'auto' && !site.hero.media.video?.webm && !site.hero.media.video?.mp4);
  const onMedia = isDark && !isAmbient; /* white-on-media treatment */

  const textColor = onMedia ? 'white' : 'var(--ink)';
  const subColor = onMedia ? 'rgba(255,255,255,0.85)' : 'var(--body)';
  const mutedColor = onMedia ? 'rgba(255,255,255,0.65)' : 'var(--muted)';
  const hairColor = onMedia ? 'rgba(255,255,255,0.5)' : 'var(--grey-metal)';

  /* WhatsApp: waGeneral() returns null until site.contact.whatsapp is set →
   * fall back to the enquiry form so the button is never dead. */
  const waHref = waGeneral();

  const [line1, line2] = site.hero.headline;
  const [before, after] = line2.split('big machines');
  const hasAccent = after !== undefined;

  const [cueVisible, setCueVisible] = useState(true);
  useEffect(() => {
    const onScroll = () => setCueVisible(window.scrollY < 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const waIcon = (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  );

  return (
    <section className="hero" aria-label="Hero">
      <style>{HERO_STYLES}</style>

      {/* Media layer — sits behind all content */}
      <HeroMedia media={site.hero.media} />

      <div className="hero__content">
        {/* Eyebrow — §11.5 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-md)' }}>
          <span style={{ width: 24, height: 2, background: 'var(--burgundy)', display: 'inline-block', flexShrink: 0 }} aria-hidden="true" />
          <span style={{
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.16em',
            color: isAmbient ? 'var(--grey-metal)' : mutedColor,
            fontWeight: 600,
          }}>
            {site.hero.eyebrow}
          </span>
        </div>

        {/* H1 — Archivo Expanded; metal gradient on "big machines" (only gradient text on the page) */}
        <h1 className="hero__h1" style={{ color: textColor }}>
          <span className="hero__line">{line1}</span>{' '}
          <span className="hero__line">
            {hasAccent ? (
              <>
                {before}
                <span style={{
                  background: 'var(--metal-gradient)',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  color: 'transparent',
                }}>
                  big machines
                </span>
                {after}
              </>
            ) : line2}
          </span>
        </h1>

        <p className="hero__sub" style={{ color: subColor }}>{site.hero.sub}</p>

        {/* Tagline — hairlines centred on the Devanagari line */}
        <div className="hero__tagline">
          <div className="hero__tagline-row">
            <span
              className="hero__rule hero__rule--lead"
              style={{ background: `linear-gradient(to left, ${hairColor}, transparent)` }}
              aria-hidden="true"
            />
            <p lang="sa" className="hero__dev">
              <span style={{ color: 'var(--burgundy)' }}>भारते शिल्पितम्, </span>
              <span style={{ color: isAmbient ? 'var(--grey-metal)' : mutedColor }}>विश्वय निर्मितम्</span>
            </p>
            <span
              className="hero__rule"
              style={{ background: `linear-gradient(to right, ${hairColor}, transparent)` }}
              aria-hidden="true"
            />
          </div>
          <p lang="en" style={{ fontSize: '0.8125rem', color: mutedColor, marginTop: 2 }}>
            {site.tagline.english}
          </p>
        </div>

        {/* CTAs — two buttons + tertiary text link (§11.5) */}
        <div className="hero__ctas">
          <Link href="/enquiry" className="hero__btn hero__btn--primary">
            {site.hero.ctas.primary}
          </Link>

          {waHref ? (
            <a href={waHref} target="_blank" rel="noopener noreferrer" className="hero__btn hero__btn--wa">
              {waIcon}
              {site.hero.ctas.secondary}
            </a>
          ) : (
            /* No WhatsApp number configured yet → same slot, routes to the enquiry form */
            <Link href="/enquiry" className="hero__btn hero__btn--wa">
              {waIcon}
              {site.hero.ctas.secondary}
            </Link>
          )}

          <Link href="/products" className="hero__link" style={{ color: onMedia ? 'white' : 'var(--burgundy)' }}>
            {/* U+FE0E forces text presentation — no emoji box */}
            {site.hero.ctas.tertiary}&nbsp;{'↗︎'}
          </Link>
        </div>
      </div>

      {/* Scroll cue — bottom-right, clear of the CTAs; fades after first scroll */}
      <div className="hero__cue" style={{ opacity: cueVisible ? 1 : 0 }} aria-hidden="true">
        <span style={{
          fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.16em', fontWeight: 600,
          fontFamily: 'var(--font-mono, monospace)', color: onMedia ? 'white' : 'var(--burgundy)',
          writingMode: 'vertical-rl',
        }}>
          Scroll
        </span>
        <div style={{ width: 1, height: 40, background: onMedia ? 'white' : 'var(--burgundy)', opacity: 0.3, position: 'relative' }}>
          <div className="hero__cue-dot" style={{
            width: 4, height: 4, borderRadius: '50%', background: onMedia ? 'white' : 'var(--burgundy)',
            position: 'absolute', left: -1.5,
          }} />
        </div>
      </div>

      {/* Hero exit diagonal — §11.5 / §3 rule 1 */}
      <div
        style={{
          position: 'absolute', bottom: -2, left: 0, right: 0,
          height: 'calc(4vw + 8px)', background: 'var(--canvas)',
          clipPath: 'polygon(0 100%, 100% 0%, 100% 100%)', zIndex: 3,
        }}
        aria-hidden="true"
      />
      {/* 2px folded-sheet rule along the cut */}
      <div
        style={{
          position: 'absolute', bottom: 'calc(4vw - 2px)', left: 0, right: 0, height: 2,
          background: 'var(--grey-warm)', transformOrigin: 'left bottom', transform: 'rotate(-2deg)',
          zIndex: 4, opacity: 0.6,
        }}
        aria-hidden="true"
      />
    </section>
  );
}
