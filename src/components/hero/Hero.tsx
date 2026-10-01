/**
 * Hero section — §11.5
 * Exactly one screen (100svh). The glass pill floats on top at top:16px; the
 * diagonal exit lives inside the hero so nothing from the next section peeks in.
 * Type block left-aligned, low-left.
 * Ambient mode (default) = light tone, --ink text, colour logo in nav.
 * Video/poster dark mode = white text, bright logo in nav.
 *
 * Exactly two buttons: Enquire Now + Browse Products. WhatsApp lives only in the
 * floating button (WhatsAppFAB).
 */

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight } from '@phosphor-icons/react/dist/csr/ArrowUpRight';
import HeroMedia from './HeroMedia';
import { site } from '@/content/site';

/* Layout constants shared with the fixed header: floating pill = 16px + 64px →
 * content must clear 96px. */
const HERO_STYLES = `
.hero { position: relative; display: flex; flex-direction: column; overflow: hidden;
  min-height: 100svh; }
.hero__content { position: relative; z-index: 2; flex: 1; display: flex; flex-direction: column;
  justify-content: flex-end; width: 100%; margin: 0 auto;
  max-width: calc(var(--grid-max) + 2 * var(--grid-page-padding));
  padding: 96px var(--grid-page-padding) calc(4vw + var(--space-lg)); }
.hero__h1 { font-family: var(--font-archivo, sans-serif); font-variation-settings: "wdth" 125;
  font-weight: 650; line-height: 1.05; letter-spacing: -0.03em;
  font-size: clamp(1.875rem, 8.2vw, 2.75rem); text-wrap: balance;
  margin: 0 0 var(--space-md); overflow-wrap: break-word; }
.hero__line { display: inline; }
.hero__sub { font-size: 1.0625rem; line-height: 1.65; max-width: 55ch; margin: 0 0 var(--space-md); text-wrap: pretty; }

/* Tagline lockup: [hairline][ Devanagari ][hairline] with the English line centred
   beneath the Devanagari block only (one grid keeps both on the same axis). */
.hero__tagline { display: grid; width: fit-content; max-width: 100%; margin: 0 0 var(--space-lg);
  grid-template-columns: minmax(12px, 40px) auto minmax(12px, 40px); column-gap: var(--space-sm);
  align-items: center; }
.hero__dev { grid-column: 2; grid-row: 1; margin: 0; white-space: nowrap; text-align: center;
  font-family: var(--font-devanagari, sans-serif); font-size: clamp(1.0625rem, 1.8vw, 1.25rem);
  font-weight: 600; line-height: 1.5; }
.hero__rule { height: 1px; align-self: center; transform: translateY(0.14em); /* optical: Devanagari body sits below line-box centre */ }
.hero__rule--lead { grid-column: 1; grid-row: 1; }
.hero__rule--trail { grid-column: 3; grid-row: 1; }
.hero__en { grid-column: 2; grid-row: 2; margin: 2px 0 0; text-align: center; white-space: nowrap;
  font-size: 0.75rem; letter-spacing: 0.01em; }

.hero__ctas { display: flex; align-items: center; flex-wrap: wrap; gap: var(--space-sm); }
.hero__btn { display: inline-flex; align-items: center; justify-content: center; gap: var(--space-xs);
  min-height: 48px; padding: 0 var(--space-md); border-radius: var(--radius-card);
  font-weight: 600; font-size: 1rem; line-height: 1; text-decoration: none;
  transition: background-color .2s, color .2s, border-color .2s; white-space: nowrap; }
.hero__btn:focus-visible { outline: 2px solid var(--burgundy); outline-offset: 3px; }
.hero__btn svg { transition: transform .2s cubic-bezier(.16,1,.3,1); }
.hero__btn:hover svg, .hero__btn:focus-visible svg { transform: translate3d(2px, -2px, 0); }
.hero__btn--primary { background: var(--burgundy); color: var(--surface); border: 1px solid var(--burgundy); }
.hero__btn--primary:hover, .hero__btn--primary:focus-visible { background: var(--burgundy-deep); border-color: var(--burgundy-deep); }
.hero__btn--secondary { background: var(--surface); color: var(--burgundy); border: 1px solid var(--burgundy); }
.hero__btn--secondary:hover, .hero__btn--secondary:focus-visible { background: var(--blush); }
.hero__btn--secondary-dark { background: transparent; color: var(--surface); border: 1px solid var(--surface); }
.hero__btn--secondary-dark:hover, .hero__btn--secondary-dark:focus-visible { background: color-mix(in srgb, var(--surface) 16%, transparent); }

.hero__cue { position: absolute; right: var(--grid-page-padding); bottom: calc(4vw + var(--space-lg));
  display: flex; flex-direction: column; align-items: center; gap: 4px; z-index: 3;
  transition: opacity .4s; pointer-events: none; }
.hero__cue-dot { animation: hero-scroll-dot 1.5s ease-in-out infinite; }
@keyframes hero-scroll-dot { 0% { top: 0; opacity: 1; } 80% { top: 36px; opacity: 0; } 100% { top: 0; opacity: 0; } }
@media (prefers-reduced-motion: reduce) { .hero__cue-dot { animation: none; } .hero__btn svg { transition: none; } }

@media (min-width: 768px) {
  /* Exactly two balanced lines: each headline half is its own nowrap block.
     Size is conservative against Archivo wdth 125 (~0.66em/char × 26 chars ≈ 17em). */
  .hero__h1 { font-size: clamp(2rem, 4.4vw, 4.5rem); }
  .hero__line { display: block; white-space: nowrap; }
  .hero__content { padding-bottom: calc(4vw + var(--space-xl)); }
}
@media (max-width: 479px) {
  .hero__btn { flex: 1 1 auto; padding: 0 var(--space-sm); }
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

  const [line1, line2] = site.hero.headline;
  const [before, after] = line2.split('big machines');
  const hasAccent = after !== undefined;

  const [cueVisible, setCueVisible] = useState(true);
  useEffect(() => {
    const onScroll = () => setCueVisible(window.scrollY < 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <section className="hero" aria-label="Hero">
      <style>{HERO_STYLES}</style>

      {/* Media layer — sits behind all content */}
      <HeroMedia media={site.hero.media} />

      <div className="hero__content">
        {/* Eyebrow — §11.5 (no numbering) */}
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

        {/* Tagline — hairlines flank the Devanagari; English centred beneath it */}
        <div className="hero__tagline">
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
            className="hero__rule hero__rule--trail"
            style={{ background: `linear-gradient(to right, ${hairColor}, transparent)` }}
            aria-hidden="true"
          />
          <p lang="en" className="hero__en" style={{ color: isAmbient ? 'var(--body)' : mutedColor }}>
            {site.tagline.english}
          </p>
        </div>

        {/* CTAs — exactly two buttons. WhatsApp lives only in the floating button. */}
        <div className="hero__ctas">
          <Link href="/enquiry" className="hero__btn hero__btn--primary">
            {site.hero.ctas.primary}
            <ArrowUpRight weight="light" size={20} aria-hidden="true" />
          </Link>
          <Link href="/products" className={`hero__btn ${onMedia ? 'hero__btn--secondary-dark' : 'hero__btn--secondary'}`}>
            Browse Products
            <ArrowUpRight weight="light" size={20} aria-hidden="true" />
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
