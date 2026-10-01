/**
 * Preloader timeline — §10.3
 * GSAP timeline for the construction sequence.
 * Called from Preloader.tsx after refs are available.
 *
 * NOTE: All timings in seconds (GSAP default). §10.3 gives ms — divide by 1000.
 *
 * The Logo component is a placeholder until the client supplies the vector.
 * When the real logo is available, the named elements (#A-ribbon, #LO-core, etc.)
 * will have proper path geometry for clip-path reveals. For now the animation
 * uses opacity/transform as a structural stand-in.
 */

import type { RefObject } from 'react';
import gsap from 'gsap';
import { prefersReducedMotion } from '@/hooks/useReducedMotion';
import { markPreloaderDone } from '@/lib/preload';

export interface PreloaderRefs {
  overlay: RefObject<HTMLDivElement | null>;
  grid: RefObject<HTMLDivElement | null>;
  logoArea: RefObject<HTMLDivElement | null>;
  logoSvg: RefObject<SVGSVGElement | null>;
  aRibbon: RefObject<SVGGElement | null>;
  loCore: RefObject<SVGGElement | null>;
  kArm: RefObject<SVGGElement | null>;
  plasticsGroup: RefObject<SVGGElement | null>;
  rule: RefObject<HTMLDivElement | null>;
  ruleLine: RefObject<HTMLDivElement | null>;
  counter: RefObject<HTMLDivElement | null>;
  microLabel: RefObject<HTMLDivElement | null>;
  tagline: RefObject<HTMLDivElement | null>;
  shirorekha: RefObject<HTMLDivElement | null>;
  taglineDev: RefObject<HTMLParagraphElement | null>;
  taglineEn: RefObject<HTMLParagraphElement | null>;
  hairlineLeft: RefObject<HTMLSpanElement | null>;
  hairlineRight: RefObject<HTMLSpanElement | null>;
  bgText: RefObject<HTMLDivElement | null>;
  lightSweep: RefObject<HTMLDivElement | null>;
  panelLower: RefObject<HTMLDivElement | null>;
  panelUpper: RefObject<HTMLDivElement | null>;
  seam: RefObject<HTMLDivElement | null>;
  /** The logo slot in the navbar — for FLIP handoff */
  navLogoSlot: RefObject<HTMLElement | null>;
}

export interface TimelineOptions {
  onProgress?: (value: number) => void;
  onComplete?: () => void;
  /** Allow caller to fast-forward via Esc/click */
  getTimeline?: (tl: gsap.core.Timeline) => void;
}

export function buildPreloaderTimeline(
  refs: PreloaderRefs,
  opts: TimelineOptions = {},
): gsap.core.Timeline {
  const reduced = prefersReducedMotion();

  let finalized = false;
  const tl = gsap.timeline({
    paused: true,
    onUpdate() {
      if (opts.onProgress) {
        opts.onProgress(Math.round(tl.progress() * 100));
      }
    },
    onComplete() {
      finalizeExit();
      opts.onComplete?.();
    },
  });

  opts.getTimeline?.(tl);

  /* ── Reduced-motion path — §10.4 ─────────────────────────────────
   * Static logo + tagline for 500ms, then 250ms opacity crossfade.
   */
  if (reduced) {
    tl
      .set(refs.overlay.current, { opacity: 1 })
      .to(refs.overlay.current, {
        opacity: 0,
        duration: 0.2,
        delay: 0.5,
        ease: 'power3.inOut',
        onComplete: () => {
          if (refs.overlay.current) {
            refs.overlay.current.style.display = 'none';
            refs.overlay.current.setAttribute('aria-hidden', 'true');
          }
        },
      });
    return tl;
  }

  /* ── Full construction sequence ───────────────────────────────── */

  /* t 0–0.25s — The sheet */
  tl
    .to(refs.grid.current, {
      opacity: 0.03,
      duration: 0.2,
      ease: 'power3.inOut',
    }, 0)
    /* Register marks (handled via CSS; GSAP draws them in via scaleX) */
    .to('.preloader__register-mark', {
      scaleX: 1,
      duration: 0.2,
      stagger: 0.04,
      ease: 'expo.out',
    }, 0.05)
    /* Measurement rule endcaps appear */
    .to(refs.rule.current, {
      opacity: 1,
      duration: 0.2,
      ease: 'expo.out',
    }, 0.1)
    /* Counter fades in */
    .to(refs.counter.current, {
      opacity: 1,
      duration: 0.2,
      ease: 'expo.out',
    }, 0.15)
    /* Micro-label fades in */
    .to(refs.microLabel.current, {
      opacity: 1,
      duration: 0.2,
      ease: 'expo.out',
    }, 0.2);

  /* Background layer — oversized ALOK LIGHT drifts up-and-right at 6% */
  tl.fromTo(refs.bgText.current,
    { opacity: 0, x: 0, y: 0 },
    {
      opacity: 0.06,
      x: '2%',
      y: '-3%',
      duration: 2.5,
      ease: 'power3.inOut',
    }, 0);

  /* t 0.15–1.25s — Construction */

  /* A ribbon: opacity + scale up from base (placeholder — will be clip-path in final) */
  tl.fromTo(refs.aRibbon.current,
    { opacity: 0, scaleY: 0, transformOrigin: 'bottom center' },
    {
      opacity: 1,
      scaleY: 1,
      duration: 0.7,
      ease: 'expo.out',
    }, 0.15);

  /* L+O core: two halves slide in from opposite 45° sides and lock */
  tl.fromTo(refs.loCore.current,
    { opacity: 0, x: -16, y: -16 },
    {
      opacity: 1,
      x: 0,
      y: 0,
      duration: 0.4,
      ease: 'back.out(1.4)', /* mechanical click */
    }, 0.45);

  /* K arm extends up-and-right */
  tl.fromTo(refs.kArm.current,
    { opacity: 0, x: -12, y: 12 },
    {
      opacity: 1,
      x: 0,
      y: 0,
      duration: 0.4,
      ease: 'expo.out',
    }, 0.7);

  /* t 1.1–1.6s — Light sweep across wordmark */
  tl.fromTo(refs.lightSweep.current,
    { x: '-120%', y: '120%' },
    {
      x: '120%',
      y: '-120%',
      duration: 0.4,
      ease: 'power3.inOut',
    }, 1.1);

  /* t 1.3–1.8s — PLASTICS letters rise */
  if (refs.plasticsGroup.current) {
    tl.fromTo(refs.plasticsGroup.current,
      { opacity: 0, y: 8, letterSpacing: '0.28em' },
      {
        opacity: 1,
        y: 0,
        letterSpacing: '0.16em', /* tighten to logo's exact spacing */
        duration: 0.4,
        ease: 'expo.out',
      }, 1.3);
  }

  /* t 1.65–2.5s — Inscription */
  /* Shirorekha draws left → right */
  tl.fromTo(refs.shirorekha.current,
    { scaleX: 0 },
    {
      scaleX: 1,
      duration: 0.4,
      ease: 'power3.inOut',
    }, 1.65);

  /* Tagline container fades in */
  tl.to(refs.tagline.current, {
    opacity: 1,
    duration: 0.2,
    ease: 'expo.out',
  }, 1.65);

  /* Devanagari glyphs hang from shirorekha — clip-path top→bottom */
  tl.fromTo(refs.taglineDev.current,
    { clipPath: 'inset(0 0 100% 0)' },
    {
      clipPath: 'inset(0 0 0% 0)',
      duration: 0.7,
      ease: 'expo.out',
    }, 1.85);

  /* Flanking hairlines draw outward */
  tl.fromTo(refs.hairlineLeft.current,
    { scaleX: 0, opacity: 1, transformOrigin: 'right center' },
    { scaleX: 1, opacity: 1, duration: 0.4, ease: 'expo.out' }, 2.1);
  tl.fromTo(refs.hairlineRight.current,
    { scaleX: 0, opacity: 1, transformOrigin: 'left center' },
    { scaleX: 1, opacity: 1, duration: 0.4, ease: 'expo.out' }, 2.1);

  /* English line appears */
  tl.fromTo(refs.taglineEn.current,
    { opacity: 0, y: 4 },
    { opacity: 1, y: 0, duration: 0.4, ease: 'expo.out' }, 2.3);

  /* t 2.6–3.4s — Exit */

  /* Tagline + furniture fall away */
  tl.to([refs.tagline.current, refs.grid.current, refs.rule.current,
    refs.counter.current, refs.microLabel.current, refs.bgText.current], {
    opacity: 0,
    y: -8,
    duration: 0.4,
    ease: 'power3.inOut',
    stagger: 0.02,
  }, 2.6);

  /* Handoff — logo glides to the navbar logo; the overlay's own canvas goes
   * transparent at the same instant because the two exit panels (same colour)
   * sit directly behind it, so nothing visibly changes. Plain transforms, no
   * DOM re-parenting, so React-owned nodes are never moved. Degrades to a
   * simple fade when the navbar logo can't be measured. */
  tl.add(() => {
    const overlay = refs.overlay.current;
    const logoEl = refs.logoSvg.current;
    const navSvg = (refs.navLogoSlot.current ?? document.querySelector('.glass-nav__logo'))
      ?.querySelector('svg') ?? null;
    if (overlay) overlay.style.backgroundColor = 'transparent';

    if (logoEl && navSvg) {
      const from = logoEl.getBoundingClientRect();
      const to = navSvg.getBoundingClientRect();
      /* Nav logo is visibility:hidden while is-preloading; rect is still valid */
      if (from.width > 0 && to.width > 0) {
        gsap.to(logoEl, {
          x: to.left - from.left,
          y: to.top - from.top,
          scale: to.width / from.width,
          transformOrigin: '0 0',
          duration: 0.7,
          ease: 'expo.inOut',
        });
        return;
      }
    }
    if (logoEl) gsap.to(logoEl, { opacity: 0, duration: 0.4 });
  }, 2.6);

  /* Overlay splits — two panels part */
  tl.to(refs.panelLower.current, {
    y: '40%',
    x: '-20%',
    duration: 0.7,
    ease: 'expo.inOut',
  }, 2.75);
  tl.to(refs.panelUpper.current, {
    y: '-40%',
    x: '20%',
    duration: 0.7,
    ease: 'expo.inOut',
  }, 2.75);

  /* Tell the hero its entrance may start as the panels part */
  tl.add(() => { window.dispatchEvent(new Event('alok:hero-go')); }, 2.85);

  /* Seam glow — 200ms on the split edges */
  tl.to(refs.seam.current, {
    opacity: 1,
    duration: 0.2,
    ease: 'power3.inOut',
  }, 2.8)
  .to(refs.seam.current, {
    opacity: 0,
    duration: 0.2,
    ease: 'expo.out',
  }, 3.0);

  return tl;

  function finalizeExit() {
    if (finalized) return;
    finalized = true;
    markPreloaderDone();
    for (const r of [refs.overlay, refs.panelLower, refs.panelUpper, refs.seam]) {
      if (r.current) r.current.style.display = 'none';
    }
    refs.overlay.current?.setAttribute('aria-hidden', 'true');
    document.documentElement.classList.remove('is-preloading');
    document.querySelector('#main')?.removeAttribute('inert');
    document.querySelector('header')?.removeAttribute('inert');
  }
}

/* Counter updater — call on each progress tick */
export function updatePreloaderCounter(
  counterEl: HTMLDivElement | null,
  ruleLineEl: HTMLDivElement | null,
  value: number,
) {
  if (counterEl) {
    counterEl.textContent = String(value).padStart(3, '0');
  }
  if (ruleLineEl) {
    gsap.to(ruleLineEl, {
      scaleX: value / 100,
      duration: 0.2,
      ease: 'expo.out',
      overwrite: 'auto',
    });
  }
}
