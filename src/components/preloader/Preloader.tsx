/**
 * Preloader component — §10.2–§10.4
 *
 * Full-viewport overlay. Runs once per session (sessionStorage guard).
 * Construction sequence: sheet → construction → light sweep → PLASTICS inscription
 * → Devanagari inscription → FLIP to navbar → diagonal split exit.
 *
 * Accessibility:
 * - role="status" aria-live="polite" — announces "Loaded" at end
 * - page body is inert while running
 * - Skip button: bottom-centre, 44×44 tap target
 * - Focus returned to skip link after exit
 *
 * The Logo named elements (#A-ribbon, #LO-core, #K-arm) reference the placeholder
 * SVG geometry from Logo.tsx. When the client supplies the real vector, the GSAP
 * clip-path reveals in preloader.timeline.ts will target the same element IDs.
 */

'use client';

import { useEffect, useRef, useCallback } from 'react';
import Logo from '@/components/brand/Logo';
import type { PreloaderRefs } from './preloader.timeline';
import { shouldShowPreloader, markPreloaderDone } from '@/lib/preload';
import './preloader.css';

/** Hide every preloader surface and release the page. Idempotent. */
function endNow() {
  document.querySelectorAll<HTMLElement>('#preloader-overlay, .preloader__panel, .preloader__seam')
    .forEach(el => { el.style.display = 'none'; });
  document.documentElement.classList.remove('is-preloading');
  markPreloaderDone();
}

interface PreloaderProps {
  /** Ref to the navbar logo slot for FLIP handoff */
  navLogoSlotRef?: React.RefObject<HTMLElement | null>;
  onComplete?: () => void;
}

export default function Preloader({ navLogoSlotRef, onComplete }: PreloaderProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const logoAreaRef = useRef<HTMLDivElement>(null);
  const logoSvgRef = useRef<SVGSVGElement>(null);
  const aRibbonRef = useRef<SVGGElement>(null);
  const loCoreRef = useRef<SVGGElement>(null);
  const kArmRef = useRef<SVGGElement>(null);
  const plasticsRef = useRef<SVGGElement>(null);
  const ruleRef = useRef<HTMLDivElement>(null);
  const ruleLineRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLDivElement>(null);
  const microLabelRef = useRef<HTMLDivElement>(null);
  const taglineRef = useRef<HTMLDivElement>(null);
  const shirorekhaRef = useRef<HTMLDivElement>(null);
  const taglineDevRef = useRef<HTMLParagraphElement>(null);
  const taglineEnRef = useRef<HTMLParagraphElement>(null);
  const hairlineLeftRef = useRef<HTMLSpanElement>(null);
  const hairlineRightRef = useRef<HTMLSpanElement>(null);
  const bgTextRef = useRef<HTMLDivElement>(null);
  const lightSweepRef = useRef<HTMLDivElement>(null);
  const panelLowerRef = useRef<HTMLDivElement>(null);
  const panelUpperRef = useRef<HTMLDivElement>(null);
  const seamRef = useRef<HTMLDivElement>(null);

  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  const skip = useCallback(() => {
    const tl = timelineRef.current;
    if (tl) {
      tl.timeScale(4);
    } else {
      endNow();
      onComplete?.();
    }
  }, [onComplete]);

  useEffect(() => {
    const html = document.documentElement;

    /* The <head> script is the single source of truth: it only sets
     * html.is-preloading when this is the first visit in the session, motion is
     * allowed and the connection is not save-data/2g. Otherwise the CSS keeps
     * the overlay display:none and there is nothing to run. */
    if (!html.classList.contains('is-preloading') || !shouldShowPreloader()) {
      endNow();
      onComplete?.();
      return;
    }

    /* Inert the page content — NOT body (the preloader lives in body) */
    const inertTargets = Array.from(document.querySelectorAll('header, #main'));
    inertTargets.forEach(el => el.setAttribute('inert', ''));

    const refs: PreloaderRefs = {
      overlay: overlayRef,
      grid: gridRef,
      logoArea: logoAreaRef,
      logoSvg: logoSvgRef,
      aRibbon: aRibbonRef,
      loCore: loCoreRef,
      kArm: kArmRef,
      plasticsGroup: plasticsRef,
      rule: ruleRef,
      ruleLine: ruleLineRef,
      counter: counterRef,
      microLabel: microLabelRef,
      tagline: taglineRef,
      shirorekha: shirorekhaRef,
      taglineDev: taglineDevRef,
      taglineEn: taglineEnRef,
      hairlineLeft: hairlineLeftRef,
      hairlineRight: hairlineRightRef,
      bgText: bgTextRef,
      lightSweep: lightSweepRef,
      panelLower: panelLowerRef,
      panelUpper: panelUpperRef,
      seam: seamRef,
      navLogoSlot: navLogoSlotRef ?? { current: document.querySelector<HTMLElement>('.glass-nav__logo') },
    };

    /* Repeat visits never download the timeline (+ GSAP): it is only imported when the overlay runs.
     * The overlay is already painted by CSS from the <head> class, so nothing is shown late. */
    let cancelled = false;
    let tl: gsap.core.Timeline | null = null;
    let fontsTimer: ReturnType<typeof setTimeout> | undefined;
    let speedUp: ReturnType<typeof setTimeout> | undefined;
    const failsafe = setTimeout(() => {
      tl?.progress(1);
      endNow();
      inertTargets.forEach(el => el.removeAttribute('inert'));
    }, 5000);

    import('./preloader.timeline').then(({ buildPreloaderTimeline, updatePreloaderCounter }) => {
    if (cancelled) return;
    const t = tl = buildPreloaderTimeline(refs, {
      onProgress: (value) => {
        updatePreloaderCounter(counterRef.current, ruleLineRef.current, value);
      },
      onComplete: () => {
        inertTargets.forEach(el => el.removeAttribute('inert'));
        onComplete?.();
        /* Announce to screen readers via the live region */
        const live = document.getElementById('preloader-live');
        if (live) live.textContent = 'Loaded Alok Plastics';
      },
    });
    timelineRef.current = t;

    /* Start once fonts are ready (so the tagline doesn't swap mid-sequence),
     * but never wait more than 1.2s */
    let started = false;
    const start = () => {
      if (started || cancelled) return;
      started = true;
      t.play();
    };
    fontsTimer = setTimeout(start, 1200);
    document.fonts?.ready.then(start, start);

    /* Speed-up at 4s (from mount); hard failsafe at 5s above jumps to the end.
     * The <head> script's 6s class removal is the last line of defence. */
    speedUp = setTimeout(() => { t.timeScale(6); }, 4000);
    }, () => { if (!cancelled) { endNow(); inertTargets.forEach(el => el.removeAttribute('inert')); onComplete?.(); } });

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') skip();
    };
    document.addEventListener('keydown', handleKey);

    return () => {
      cancelled = true;
      document.removeEventListener('keydown', handleKey);
      clearTimeout(fontsTimer);
      clearTimeout(speedUp);
      clearTimeout(failsafe);
      tl?.kill();
      timelineRef.current = null;
      inertTargets.forEach(el => el.removeAttribute('inert'));
    };
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, []);

  return (
    <>
      {/* Main overlay */}
      <div
        ref={overlayRef}
        id="preloader-overlay"
        className="preloader"
        role="dialog"
        aria-label="Loading Alok Plastics"
      >
        <span id="preloader-live" className="sr-only" role="status" aria-live="polite" />
        {/* Background layer — oversized आलोक LIGHT, aria-hidden */}
        <div
          ref={bgTextRef}
          className="preloader__background-text"
          aria-hidden="true"
        >
          <span className="devanagari-part">आलोक</span>&nbsp;·&nbsp;LIGHT
        </div>

        {/* Drawing grid */}
        <div ref={gridRef} className="preloader__grid" aria-hidden="true" />

        {/* Logo construction area */}
        <div ref={logoAreaRef} className="preloader__logo-area">
          {/* Register marks */}
          <div className="preloader__register" aria-hidden="true">
            <div className="preloader__register-mark preloader__register-mark--tl" />
            <div className="preloader__register-mark preloader__register-mark--tr" />
            <div className="preloader__register-mark preloader__register-mark--bl" />
            <div className="preloader__register-mark preloader__register-mark--br" />
          </div>

          {/* Light sweep */}
          <div ref={lightSweepRef} className="preloader__light-sweep" aria-hidden="true" />

          {/* The Logo SVG — named parts for GSAP */}
          <Logo
            ref={logoSvgRef}
            variant="color"
            lockup="full"
            animated
            title="Alok Plastics"
            style={{ width: '100%', height: 'auto' }}
          />
        </div>

        {/* Measurement rule */}
        <div ref={ruleRef} className="preloader__rule" aria-hidden="true">
          <div className="preloader__rule-endcap" />
          <div ref={ruleLineRef} className="preloader__rule-line" />
          <div className="preloader__rule-endcap" />
          {/* Counter — bottom right */}
          <div ref={counterRef} className="preloader__counter">000</div>
          {/* Micro-label — bottom left */}
          <div ref={microLabelRef} className="preloader__micro-label">
            ALOK PLASTICS · EST. 1998 · CHANDIGARH
          </div>
        </div>

        {/* Inscription — Devanagari tagline */}
        <div ref={taglineRef} className="preloader__tagline" aria-hidden="true">
          <div className="preloader__tagline-hairlines">
            <span
              ref={hairlineLeftRef}
              className="preloader__tagline-hairline preloader__tagline-hairline--left"
            />
            <div style={{ position: 'relative' }}>
              {/* Shirorekha — draws before glyphs */}
              <div
                ref={shirorekhaRef}
                className="preloader__shirorekha"
              />
              <p
                ref={taglineDevRef}
                lang="sa"
                className="preloader__tagline-devanagari"
              >
                <span className="part-1">भारते शिल्पितम्, </span>
                <span className="part-2">विश्वय निर्मितम्</span>
              </p>
            </div>
            <span
              ref={hairlineRightRef}
              className="preloader__tagline-hairline preloader__tagline-hairline--right"
            />
          </div>
          <p
            ref={taglineEnRef}
            lang="en"
            className="preloader__tagline-english"
          >
            Crafted in Bharat, made for the world.
          </p>
        </div>

        {/* Skip intro */}
        <button
          type="button"
          className="preloader__skip"
          onClick={skip}
          aria-label="Skip intro"
        >
          Skip intro
        </button>
      </div>

      {/* Exit panels — outside the overlay so they sit behind it on z-axis */}
      <div ref={panelLowerRef} className="preloader__panel preloader__panel--lower" aria-hidden="true" />
      <div ref={panelUpperRef} className="preloader__panel preloader__panel--upper" aria-hidden="true" />
      <div ref={seamRef} className="preloader__seam" aria-hidden="true" />
    </>
  );
}
