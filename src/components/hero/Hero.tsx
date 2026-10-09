/**
 * Hero section — §11.5
 * One screen (min-height 100svh). The glass pill floats on top at top:16px; the diagonal exit
 * lives inside the hero so nothing from the next section peeks in.
 *
 * Composition: the copy block is anchored bottom-left (eyebrow, headline, sub, tagline, CTAs),
 * all on ONE left edge, with the upper part of the frame left open for the photo / footage. A thin
 * spec rail (hairline + EST. 1998 / CHANDIGARH + three machine index labels) closes the block
 * above the exit diagonal. No scroll cue.
 *
 * Legibility: no per-glyph shadow stack. HeroMedia's scrim is a soft bottom-left gradient built
 * from --ink, graded so the full footage loop and the placeholder art stay AA under the copy.
 * Ambient mode (light tone) = --ink text; photo/video (dark tone) = Soft White text.
 *
 * Entrance: headline lines rise from a mask (expo.out), sub / tagline / CTAs follow with short
 * fades, the rail draws left to right. Starts when the preloader hands over (alok:hero-go /
 * is-preloading dropped) or immediately when there is no preloader. The hidden start state is only
 * armed by the <head> script (html.hero-arm): no JS or reduced motion = static, fully visible hero.
 *
 * Exactly two buttons: primary enquiry + Browse products. WhatsApp lives only in the floating
 * button (WhatsAppFAB).
 */

'use client';

import { useEffect, useRef, type CSSProperties } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { ArrowUpRight } from '@phosphor-icons/react/dist/csr/ArrowUpRight';
import HeroMedia from './HeroMedia';
import { site } from '@/content/site';

/* Layout constants shared with the fixed header: floating pill = 16px + 64px → content must clear
 * 96px. The exit diagonal is (4vw + 8px) tall, so the rail sits 4vw + a gap above the bottom. */
const HERO_STYLES = `
.hero { position: relative; display: flex; flex-direction: column; overflow: hidden;
  min-height: 100svh; }
.hero__content { position: relative; z-index: 2; flex: 1; display: flex; flex-direction: column;
  justify-content: flex-end; width: 100%; margin: 0 auto;
  max-width: calc(var(--grid-max) + 2 * var(--grid-page-padding));
  /* bottom clearance: the 2deg fold rule climbs 3.5vw over the width on top of its 4vw offset, so the
     rail stays above 7.5vw; the 96px floor also clears the 56px WhatsApp FAB (16px + 56px) */
  padding: calc(96px + var(--space-sm)) var(--grid-page-padding) max(calc(7.5vw + var(--space-md)), 96px); }
.hero__body { display: flex; flex-direction: column; align-items: flex-start; max-width: 100%; }

.hero__eyebrow { margin: 0 0 var(--space-sm); font-family: var(--font-archivo, sans-serif);
  font-size: var(--fs-label); line-height: var(--lh-label); text-transform: uppercase;
  letter-spacing: var(--tr-label); font-weight: 600; }
.hero__h1 { font-family: var(--font-archivo, sans-serif); font-variation-settings: "wdth" 125;
  font-weight: 650; line-height: 1.02; letter-spacing: -0.035em;
  font-size: clamp(1.75rem, min(7.6vw, 5.6svh), 3.5rem); text-wrap: balance;
  margin: 0 0 var(--space-md); overflow-wrap: break-word; }
/* Each headline line is its own mask: the inner span rises from below the clip edge. The padding
   gives descenders (g, p) room inside the mask without moving the baseline. */
.hero__line { display: block; overflow: hidden; padding-bottom: 0.14em; margin-bottom: -0.14em; }
.hero__mi { display: block; }
/* text-safe crop of the metal gradient on the light canvas; over media the ramp runs pale -> mid
   rose (both ends >= 4.5:1 on the scrim) */
.hero__accent { background: var(--metal-gradient-text); -webkit-background-clip: text; background-clip: text;
  -webkit-text-fill-color: transparent; color: transparent; }
.hero[data-tone='dark'] .hero__accent { background-image: linear-gradient(96deg, var(--rose-pale) 0%,
  color-mix(in srgb, var(--rose-pale) 60%, var(--burgundy-bright)) 100%); }
/* the only shadow in the hero: a faint, wide lift on the headline. The scrim does the real work. */
.hero[data-tone='dark'] .hero__h1 { text-shadow: 0 2px 24px color-mix(in srgb, var(--ink) 28%, transparent); }
.hero[data-tone='dark'] .hero__accent { text-shadow: none; }

.hero__sub { font-family: var(--font-inter), system-ui, sans-serif; font-weight: 450; font-size: clamp(1rem, 1.4vw, 1.25rem);
  line-height: 1.68; letter-spacing: -0.005em; max-width: 52ch; margin: 0 0 var(--space-md); text-wrap: pretty; }

/* Tagline lockup: left-aligned on the same edge as everything else, no rules. Devanagari over English. */
.hero__tagline { margin: 0 0 var(--space-md); }
.hero__dev { margin: 0; white-space: nowrap;
  font-family: var(--font-devanagari, sans-serif); font-size: clamp(1.0625rem, 1.8vw, 1.25rem);
  font-weight: 600; line-height: 1.5; }
.hero__en { margin: 2px 0 0; font-size: 0.75rem; letter-spacing: 0.01em; }

.hero__ctas { display: flex; align-items: center; flex-wrap: wrap; gap: var(--space-sm); width: 100%; }
.hero__btn { display: inline-flex; align-items: center; justify-content: center; gap: var(--space-xs);
  min-height: 48px; padding: 0 var(--space-md); border-radius: var(--radius-card);
  font-weight: 600; font-size: 0.9375rem; letter-spacing: 0.005em; line-height: 1; text-decoration: none;
  transition: background-color 200ms cubic-bezier(.16,1,.3,1), color 200ms cubic-bezier(.16,1,.3,1), border-color 200ms cubic-bezier(.16,1,.3,1); white-space: nowrap; }
.hero__btn:focus-visible { outline: 2px solid var(--burgundy); outline-offset: 3px; }
.hero[data-tone='dark'] .hero__btn:focus-visible { outline-color: var(--canvas); }
.hero__btn svg { transition: transform 200ms cubic-bezier(.16,1,.3,1); }
.hero__btn:hover svg, .hero__btn:focus-visible svg { transform: translate3d(2px, -2px, 0); }
.hero__btn--primary { background: var(--burgundy); color: var(--surface); border: 1px solid var(--burgundy); }
.hero__btn--primary:hover, .hero__btn--primary:focus-visible { background: var(--burgundy-deep); border-color: var(--burgundy-deep); }
.hero[data-tone='dark'] .hero__btn--primary { background: var(--burgundy-bright); border-color: var(--burgundy-bright); }
.hero[data-tone='dark'] .hero__btn--primary:hover, .hero[data-tone='dark'] .hero__btn--primary:focus-visible { background: var(--burgundy); border-color: var(--rose-pale); }
.hero__btn--secondary { background: transparent; color: var(--burgundy); border: 1px solid color-mix(in srgb, var(--burgundy) 45%, transparent); }
.hero__btn--secondary:hover, .hero__btn--secondary:focus-visible { background: var(--blush); border-color: var(--burgundy); }
.hero__btn--secondary-dark { background: transparent; color: var(--canvas); border: 1px solid color-mix(in srgb, var(--canvas) 55%, transparent); }
.hero__btn--secondary-dark:hover, .hero__btn--secondary-dark:focus-visible { background: color-mix(in srgb, var(--canvas) 12%, transparent); border-color: var(--canvas); }

/* Spec rail — hairline with a short accent tab, EST. / CHANDIGARH on the left, machine index on the
   right. Reads like the title block of a drawing sheet. */
.hero__rail { position: relative; width: 100%; margin-top: var(--space-md); padding-top: var(--space-sm);
  display: flex; flex-wrap: wrap; align-items: baseline; justify-content: space-between; gap: var(--space-xs) var(--space-md);
  font-family: var(--font-mono, monospace); font-size: var(--fs-label); line-height: var(--lh-label);
  text-transform: uppercase; letter-spacing: 0.14em; font-weight: 500; }
.hero__rail-line { position: absolute; top: 0; left: 0; right: 0; height: 1px; transform-origin: left center;
  background: var(--rail-line); }
.hero__rail-line::before { content: ''; position: absolute; left: 0; top: -1px; width: 48px; height: 3px;
  background: var(--rail-tab); }
.hero__rail-facts { display: flex; gap: var(--space-sm); margin: 0; padding: 0; list-style: none; }
.hero__rail-facts li:first-child { color: var(--rail-strong); }
.hero__rail-index { display: flex; flex-wrap: wrap; gap: var(--space-xs) var(--space-md); margin: 0; padding: 0; list-style: none; }
.hero__rail-n { margin-right: var(--space-xs); opacity: 0.7; }

/* Entrance start state — armed by the <head> script (html.hero-arm, never set without JS or under
   reduced motion). The timeline un-hides everything; without the class the content is just visible. */
html.hero-arm .hero__mi { transform: translate3d(0, 110%, 0); }
html.hero-arm .hero__rail-line { transform: scaleX(0); }
html.hero-arm .hero__eyebrow,
html.hero-arm .hero__sub,
html.hero-arm .hero__tagline,
html.hero-arm .hero__rail-item,
html.hero-arm .hero__btn { opacity: 0; }

/* ambient light sweep: a single 1200ms pass after the entrance, not a loop */
.hero--in .hero-ambient__sweep { animation: hero-sweep 1200ms cubic-bezier(.87,0,.13,1) 900ms 1 both; }
@media (prefers-reduced-motion: reduce) {
  .hero__btn svg { transition: none; }
  .hero--in .hero-ambient__sweep { animation: none; }
}

@media (min-width: 768px) {
  .hero__line { white-space: nowrap; }
  .hero__h1 { font-size: clamp(2.5rem, min(6.4vw, 9svh), 4.5rem); }
  .hero__sub { font-size: 1.125rem; }
}
@media (min-width: 1024px) {
  .hero__h1 { font-size: clamp(3rem, min(5.4vw, 9.6svh), 5rem); margin-bottom: var(--space-md); }
  .hero__sub { font-size: 1.25rem; }
}
@media (max-width: 479px) {
  .hero__ctas { flex-direction: column; align-items: stretch; }
  .hero__btn { width: 100%; }
  .hero__rail-index { width: 100%; justify-content: space-between; gap: var(--space-xs); }
  .hero__rail-index li { flex: 1 1 0; min-width: 0; }
  .hero__rail-n { display: block; margin: 0 0 2px; }
}
`;

export default function Hero() {
  const isDark = site.hero.media.tone === 'dark';
  const isAmbient = site.hero.media.mode === 'ambient' ||
    (site.hero.media.mode === 'auto' && !site.hero.media.video?.webm && !site.hero.media.video?.mp4);
  const onMedia = isDark && !isAmbient; /* Soft White copy on the scrimmed photo / footage */

  /* on media the copy is the brand's Soft White (--canvas), stepped down by opacity for
     hierarchy (never below 88% so the small labels hold AA on the scrim), never pure white */
  const textColor = onMedia ? 'var(--canvas)' : 'var(--ink)';
  const subColor = onMedia ? 'color-mix(in srgb, var(--canvas) 92%, transparent)' : 'var(--body)';
  const mutedColor = onMedia ? 'color-mix(in srgb, var(--canvas) 88%, transparent)' : 'var(--grey-metal-text)';
  const railVars = {
    '--rail-line': onMedia ? 'color-mix(in srgb, var(--canvas) 32%, transparent)' : 'var(--grey-warm)',
    '--rail-tab': onMedia ? 'var(--rose-pale)' : 'var(--burgundy)',
    '--rail-strong': onMedia ? 'var(--canvas)' : 'var(--ink)',
  } as CSSProperties;

  const accent = site.hero.headlineAccent;

  const rootRef = useRef<HTMLElement>(null);

  /* ── Entrance timeline ──────────────────────────────────────────────── */
  useEffect(() => {
    const root = rootRef.current;
    const html = document.documentElement;
    if (!root) return;

    const armed = html.classList.contains('hero-arm');
    const disarm = () => html.classList.remove('hero-arm');
    let started = false;
    let tl: gsap.core.Timeline | null = null;

    const go = () => {
      if (started) return;
      started = true;
      root.classList.add('hero--in');
      if (!armed || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        disarm();
        return;
      }
      const q = (sel: string) => root.querySelectorAll<HTMLElement>(sel);
      /* Hand the hidden start state from CSS over to GSAP in the same task (the fromTo calls below
         render their 'from' values immediately), so there is no frame in which neither applies and
         the CSS transform can't be merged into GSAP's yPercent. */
      disarm();
      tl = gsap.timeline({
        defaults: { ease: 'expo.out' },
        onComplete: () => {
          gsap.set(q('.hero__mi, .hero__eyebrow, .hero__sub, .hero__tagline, .hero__rail-line, .hero__rail-item, .hero__btn'), { clearProps: 'opacity,transform' });
        },
      });
      tl.fromTo(q('.hero__eyebrow'), { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.7 }, 0.1)
        .fromTo(q('.hero__mi'), { yPercent: 110 }, { yPercent: 0, duration: 1, stagger: 0.09 }, 0.15)
        .fromTo(q('.hero__sub'), { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.8 }, 0.55)
        .fromTo(q('.hero__tagline'), { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.8 }, 0.65)
        .fromTo(q('.hero__btn'), { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.7, stagger: 0.1 }, 0.75)
        .fromTo(q('.hero__rail-line'), { scaleX: 0 }, { scaleX: 1, duration: 1, ease: 'power3.inOut' }, 0.85)
        .fromTo(q('.hero__rail-item'), { opacity: 0 }, { opacity: 1, duration: 0.6, stagger: 0.06, ease: 'power1.out' }, 1.1);
    };

    let mo: MutationObserver | null = null;
    let raf = 0;
    let failsafe: ReturnType<typeof setTimeout> | undefined;
    if (html.classList.contains('is-preloading')) {
      window.addEventListener('alok:hero-go', go, { once: true });
      mo = new MutationObserver(() => { if (!html.classList.contains('is-preloading')) go(); });
      mo.observe(html, { attributes: true, attributeFilter: ['class'] });
      failsafe = setTimeout(go, 6500);
    } else {
      raf = requestAnimationFrame(go);
    }

    return () => {
      window.removeEventListener('alok:hero-go', go);
      mo?.disconnect();
      cancelAnimationFrame(raf);
      clearTimeout(failsafe);
      tl?.kill();
      /* the class is left for the next mount (StrictMode re-run) — the <head> script clears it after 7s */
    };
  }, []);

  return (
    <section ref={rootRef} className="hero" aria-label="Hero" data-tone={onMedia ? 'dark' : 'light'} style={railVars}>
      <style>{HERO_STYLES}</style>

      {/* Media layer — sits behind all content */}
      <HeroMedia media={site.hero.media} />

      <div className="hero__content">
        <div className="hero__body">
          <p className="hero__eyebrow" style={{ color: mutedColor }}>{site.hero.eyebrow}</p>

          {/* H1 — Archivo Expanded; metal gradient on the accent phrase (only gradient text on the page) */}
          <h1 className="hero__h1" style={{ color: textColor }}>
            {site.hero.headline.map((line, i) => {
              const at = accent ? line.indexOf(accent) : -1;
              return (
                <span key={i} className="hero__line">
                  <span className="hero__mi">
                    {at >= 0 && accent ? (
                      <>
                        {line.slice(0, at)}
                        <span className="hero__accent">{accent}</span>
                        {line.slice(at + accent.length)}
                      </>
                    ) : line}
                  </span>
                </span>
              );
            })}
          </h1>

          <p className="hero__sub" style={{ color: subColor }}>{site.hero.sub}</p>

          {/* Tagline — left-aligned lockup, Devanagari over English; no rules */}
          <div className="hero__tagline">
            <p lang="sa" className="hero__dev">
              {/* brand accent on canvas is --burgundy; over the scrim it is --rose-pale,
                  the token the ramp reserves for text on burgundy */}
              <span style={{ color: onMedia ? 'var(--rose-pale)' : 'var(--burgundy)' }}>भारते शिल्पितम्, </span>
              <span style={{ color: mutedColor }}>विश्वय निर्मितम्</span>
            </p>
            <p lang="en" className="hero__en" style={{ color: onMedia ? mutedColor : 'var(--body)' }}>
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
              {site.hero.ctas.tertiary}
            </Link>
          </div>

          {/* Spec rail — drawing-sheet title block: facts left, machine index right */}
          <div className="hero__rail" style={{ color: mutedColor }}>
            <span className="hero__rail-line" aria-hidden="true" />
            <ul className="hero__rail-facts" aria-label="Alok Plastics at a glance">
              {site.hero.rail.facts.map((f) => <li key={f} className="hero__rail-item">{f}</li>)}
            </ul>
            <ol className="hero__rail-index" aria-label="Machines we supply parts for">
              {site.hero.rail.index.map((m, i) => (
                <li key={m} className="hero__rail-item">
                  <span className="hero__rail-n" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                  {m}
                </li>
              ))}
            </ol>
          </div>
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
