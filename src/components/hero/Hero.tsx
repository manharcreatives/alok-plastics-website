/**
 * Hero section — §11.5
 * Exactly one screen (100svh). The glass pill floats on top at top:16px; the
 * diagonal exit lives inside the hero so nothing from the next section peeks in.
 * Type block left-aligned, vertically centred between the nav and the exit diagonal; the headline
 * runs on three lines from 768px up so it always ends before the 75deg plate edge / schematic.
 * Ambient mode (default) = light tone, --ink text, colour logo in nav.
 * Video/poster dark mode = white text, bright logo in nav.
 *
 * Entrance (Round 2): mask-rise headline 900ms expo.out, hairlines draw 700ms power3.inOut,
 * CTAs lock in on back.out(1.4). It starts when the preloader hands over (alok:hero-go /
 * is-preloading dropped) or immediately when there is no preloader. The hidden start state is only
 * armed by the <head> script (html.hero-arm): no JS or reduced motion = static, fully visible hero.
 *
 * Exactly two buttons: Enquire Now + Browse Products. WhatsApp lives only in the
 * floating button (WhatsAppFAB).
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { ArrowUpRight } from '@phosphor-icons/react/dist/csr/ArrowUpRight';
import HeroMedia from './HeroMedia';
import { site } from '@/content/site';

/* Layout constants shared with the fixed header: floating pill = 16px + 64px →
 * content must clear 96px. */
const HERO_STYLES = `
.hero { position: relative; display: flex; flex-direction: column; overflow: hidden;
  min-height: 100svh; }
.hero__content { position: relative; z-index: 2; flex: 1; display: flex; flex-direction: column;
  justify-content: center; width: 100%; margin: 0 auto;
  max-width: calc(var(--grid-max) + 2 * var(--grid-page-padding));
  padding: calc(88px + 2vh) var(--grid-page-padding) calc(4vw + var(--space-lg)); }
.hero__h1 { font-family: var(--font-archivo, sans-serif); font-variation-settings: "wdth" 125;
  font-weight: 650; line-height: 1.05; letter-spacing: -0.03em;
  font-size: clamp(1.875rem, 8.6vw, 2.75rem); text-wrap: balance;
  margin: 0 0 var(--space-md); overflow-wrap: break-word; }
/* Each headline line is its own mask: the inner span rises from below the clip edge. The padding
   gives descenders (g, p) room inside the mask without moving the baseline. */
.hero__line { display: block; overflow: hidden; padding-bottom: 0.14em; margin-bottom: -0.14em; }
.hero__mi { display: block; }
.hero__tail { display: inline; }
/* text-safe crop of the metal gradient: the last glyphs keep >= 4.5:1 on the canvas.
   Over media the ramp is reversed (pale -> bright) so the accent survives the scrim. */
.hero__accent { background: var(--metal-gradient-text); -webkit-background-clip: text; background-clip: text;
  -webkit-text-fill-color: transparent; color: transparent; }
.hero[data-tone='dark'] .hero__accent { background-image: var(--metal-gradient-on-media); }
.hero__sub { font-size: 1.0625rem; line-height: 1.65; max-width: 55ch; margin: 0 0 var(--space-md); text-wrap: pretty; }
.hero__eyebrow { display: flex; align-items: center; gap: var(--space-sm); margin-bottom: var(--space-md); }

/* Tagline lockup: [hairline][ Devanagari ][hairline] with the English line centred
   beneath the Devanagari block only (one grid keeps both on the same axis). */
.hero__tagline { display: grid; width: fit-content; max-width: 100%; margin: 0 0 var(--space-lg);
  grid-template-columns: minmax(12px, 40px) auto minmax(12px, 40px); column-gap: var(--space-sm);
  align-items: center; }
.hero__dev { grid-column: 2; grid-row: 1; margin: 0; white-space: nowrap; text-align: center;
  font-family: var(--font-devanagari, sans-serif); font-size: clamp(1.0625rem, 1.8vw, 1.25rem);
  font-weight: 600; line-height: 1.5; }
.hero__rule { height: 1px; align-self: center; margin-top: 0.28em; /* optical: Devanagari body sits below line-box centre */ }
.hero__rule--lead { grid-column: 1; grid-row: 1; transform-origin: right center; }
.hero__rule--trail { grid-column: 3; grid-row: 1; transform-origin: left center; }
.hero__en { grid-column: 2; grid-row: 2; margin: 2px 0 0; text-align: center; white-space: nowrap;
  font-size: 0.75rem; letter-spacing: 0.01em; }

.hero__ctas { display: flex; align-items: center; flex-wrap: wrap; gap: var(--space-sm); }
.hero__btn { display: inline-flex; align-items: center; justify-content: center; gap: var(--space-xs);
  min-height: 48px; padding: 0 var(--space-md); border-radius: var(--radius-card);
  font-weight: 600; font-size: 1rem; line-height: 1; text-decoration: none;
  transition: background-color 200ms cubic-bezier(.16,1,.3,1), color 200ms cubic-bezier(.16,1,.3,1), border-color 200ms cubic-bezier(.16,1,.3,1); white-space: nowrap; }
.hero__btn:focus-visible { outline: 2px solid var(--burgundy); outline-offset: 3px; }
.hero__btn svg { transition: transform 200ms cubic-bezier(.16,1,.3,1); }
.hero__btn:hover svg, .hero__btn:focus-visible svg { transform: translate3d(2px, -2px, 0); }
.hero__btn--primary { background: var(--burgundy); color: var(--surface); border: 1px solid var(--burgundy); }
.hero__btn--primary:hover, .hero__btn--primary:focus-visible { background: var(--burgundy-deep); border-color: var(--burgundy-deep); }
.hero__btn--secondary { background: var(--surface); color: var(--burgundy); border: 1px solid var(--burgundy); }
.hero__btn--secondary:hover, .hero__btn--secondary:focus-visible { background: var(--blush); }
.hero__btn--secondary-dark { background: transparent; color: var(--surface); border: 1px solid var(--surface); }
.hero__btn--secondary-dark:hover, .hero__btn--secondary-dark:focus-visible { background: color-mix(in srgb, var(--surface) 16%, transparent); }

.hero__cue { position: absolute; right: var(--grid-page-padding); bottom: calc(4vw + var(--space-lg));
  display: flex; flex-direction: column; align-items: center; gap: 4px; z-index: 3;
  transition: opacity 400ms cubic-bezier(.16,1,.3,1); pointer-events: none; }
/* the dot travels with transform only; it pauses once the cue has faded after the first scroll */
.hero__cue-dot { top: 0; animation: hero-scroll-dot 1200ms cubic-bezier(.65,0,.35,1) infinite; }
.hero__cue[data-visible='false'] .hero__cue-dot { animation-play-state: paused; }
@keyframes hero-scroll-dot {
  0% { transform: translate3d(0, 0, 0); opacity: 1; }
  80% { transform: translate3d(0, 36px, 0); opacity: 0; }
  100% { transform: translate3d(0, 0, 0); opacity: 0; }
}

/* Entrance start state — armed by the <head> script (html.hero-arm, never set without JS or under
   reduced motion). The timeline un-hides everything; without the class the content is just visible. */
html.hero-arm .hero__mi { transform: translate3d(0, 110%, 0); }
html.hero-arm .hero__rule { transform: scaleX(0); }
html.hero-arm .hero__eyebrow-text,
html.hero-arm .hero__sub,
html.hero-arm .hero__dev,
html.hero-arm .hero__en,
html.hero-arm .hero__btn { opacity: 0; }

/* On-media only. The footage carries blown specular highlights that no flat scrim
   can fully absorb, so each glyph carries its own soft local darkening. Two shadows,
   no hard edge and no panel: a tight one for stroke separation and a wide one that
   sinks the surround. Off over the ambient drawing, which has no moving highlights. */
.hero[data-tone='dark'] .hero__eyebrow-text,
.hero[data-tone='dark'] .hero__h1,
.hero[data-tone='dark'] .hero__sub,
.hero[data-tone='dark'] .hero__dev,
.hero[data-tone='dark'] .hero__en {
  text-shadow: 0 1px 2px color-mix(in srgb, var(--ink) 62%, transparent),
               0 0 18px color-mix(in srgb, var(--ink) 45%, transparent);
}
/* a text-shadow paints over a background-clip:text fill and buries the gradient, so the
   accent takes the same local darkening as a filter instead */
.hero[data-tone='dark'] .hero__accent { text-shadow: none;
  filter: drop-shadow(0 1px 2px color-mix(in srgb, var(--ink) 62%, transparent)); }
.hero[data-tone='dark'] .hero__btn--secondary-dark { text-shadow: 0 1px 2px color-mix(in srgb, var(--ink) 55%, transparent); }

/* ambient light sweep: a single 1200ms pass after the entrance, not a loop */
.hero--in .hero-ambient__sweep { animation: hero-sweep 1200ms cubic-bezier(.87,0,.13,1) 900ms 1 both; }
@media (prefers-reduced-motion: reduce) {
  .hero__cue-dot { animation: none; }
  .hero__btn svg { transition: none; }
  .hero--in .hero-ambient__sweep { animation: none; }
}

@media (min-width: 768px) {
  /* 3 lines (the tail 'running.' drops to its own line) so the headline ends before the 75deg
     diagonal / schematic at every width; 4.8vw capped at 72px keeps it clear at 1920 too. */
  .hero__h1 { font-size: var(--fs-display); }
  .hero__line { white-space: nowrap; }
  .hero__tail { display: block; }
  .hero__content { padding-bottom: calc(4vw + var(--space-xl)); }
}
@media (min-width: 768px) and (max-width: 1023px) { .hero__sub { max-width: 40ch; font-size: 1.1875rem; } .hero__h1 { font-size: clamp(2.25rem, 5vw, 3.25rem); } }
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

  /* on media the copy is the brand's Soft White (--canvas), stepped down by opacity for
     hierarchy, never a pure white that would glare against the footage */
  const textColor = onMedia ? 'var(--canvas)' : 'var(--ink)';
  const subColor = onMedia ? 'color-mix(in srgb, var(--canvas) 90%, transparent)' : 'var(--body)';
  const mutedColor = onMedia ? 'color-mix(in srgb, var(--canvas) 78%, transparent)' : 'var(--muted)';
  const hairColor = onMedia ? 'color-mix(in srgb, var(--canvas) 50%, transparent)' : 'var(--grey-metal)';

  const [line1, line2] = site.hero.headline;
  const [before, after] = line2.split('big machines');
  const hasAccent = after !== undefined;

  const rootRef = useRef<HTMLElement>(null);
  const [cueVisible, setCueVisible] = useState(true);

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
        onComplete: () => {
          gsap.set(q('.hero__mi, .hero__eyebrow-text, .hero__sub, .hero__rule, .hero__dev, .hero__en, .hero__btn'), { clearProps: 'opacity,transform' });
        },
      });
      tl.fromTo(q('.hero__eyebrow-text'), { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.7, ease: 'expo.out' }, 0.1)
        .fromTo(q('.hero__mi'), { yPercent: 110 }, { yPercent: 0, duration: 0.9, ease: 'expo.out', stagger: 0.08 }, 0.1)
        .fromTo(q('.hero__sub'), { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.7, ease: 'expo.out' }, 0.5)
        .fromTo(q('.hero__rule'), { scaleX: 0 }, { scaleX: 1, duration: 0.7, ease: 'power3.inOut' }, 0.6)
        .fromTo(q('.hero__dev, .hero__en'), { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.7, ease: 'expo.out', stagger: 0.08 }, 0.7)
        .fromTo(q('.hero__btn'), { opacity: 0, x: -17, y: 17 }, { opacity: 1, x: 0, y: 0, duration: 0.7, ease: 'back.out(1.4)', stagger: 0.2 }, 0.9);
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

  useEffect(() => {
    const onScroll = () => setCueVisible(window.scrollY < 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <section ref={rootRef} className="hero" aria-label="Hero" data-tone={onMedia ? 'dark' : 'light'}>
      <style>{HERO_STYLES}</style>

      {/* Media layer — sits behind all content */}
      <HeroMedia media={site.hero.media} />

      <div className="hero__content">
        {/* Eyebrow — §11.5 (no numbering) */}
        <div className="hero__eyebrow">
          <span
            className="hero__eyebrow-text"
            style={{
              fontSize: 'var(--fs-label)',
              lineHeight: 'var(--lh-label)',
              fontFamily: 'var(--font-archivo), sans-serif',
              textTransform: 'uppercase',
              letterSpacing: 'var(--tr-label)',
              color: isAmbient ? 'var(--grey-metal)' : mutedColor,
              fontWeight: 600,
            }}
          >
            {site.hero.eyebrow}
          </span>
        </div>

        {/* H1 — Archivo Expanded; metal gradient on "big machines" (only gradient text on the page) */}
        <h1 className="hero__h1" style={{ color: textColor }}>
          <span className="hero__line"><span className="hero__mi">{line1}</span></span>{' '}
          <span className="hero__line">
            <span className="hero__mi">
              {hasAccent ? (
                <>
                  {before}
                  <span className="hero__accent">big machines</span>
                  <span className="hero__tail">{after}</span>
                </>
              ) : line2}
            </span>
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
            {/* brand accent on canvas is --burgundy; over the scrim it is --rose-pale,
                the token the ramp reserves for text on burgundy */}
            <span style={{ color: onMedia ? 'var(--rose-pale)' : 'var(--burgundy)' }}>भारते शिल्पितम्, </span>
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
      <div className="hero__cue" data-visible={cueVisible ? 'true' : 'false'} style={{ opacity: cueVisible ? 1 : 0 }} aria-hidden="true">
        <span style={{
          fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.16em', fontWeight: 600,
          fontFamily: 'var(--font-mono, monospace)', color: onMedia ? 'var(--canvas)' : 'var(--burgundy)',
          writingMode: 'vertical-rl',
        }}>
          Scroll
        </span>
        <div style={{ width: 1, height: 40, background: onMedia ? 'var(--canvas)' : 'var(--burgundy)', opacity: 0.3, position: 'relative' }}>
          <div className="hero__cue-dot" style={{
            width: 4, height: 4, borderRadius: '50%', background: onMedia ? 'var(--canvas)' : 'var(--burgundy)',
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
