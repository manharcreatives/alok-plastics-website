/**
 * Motion core — §12.1 (client-only module)
 *
 * Three things people get wrong (§12.1):
 * 1. Never a standalone requestAnimationFrame loop for Lenis — gsap.ticker ONLY
 * 2. ×1000 is mandatory — GSAP ticker gives SECONDS, Lenis.raf() wants MILLISECONDS
 * 3. lagSmoothing(0) is mandatory — no catch-up jitter
 *
 * Import this once from a client boundary (e.g. LenisProvider).
 * Never import on the server.
 */

'use client';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { Flip } from 'gsap/Flip';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger, SplitText, Flip);

ScrollTrigger.config({ ignoreMobileResize: true });

export let lenis: Lenis | null = null;
let lenisInitialized = false;

export function initLenis(): Lenis | null {
  if (lenisInitialized) return lenis;
  lenisInitialized = true;

  const prefersReduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return null;

  lenis = new Lenis({
    duration: 1.2,
    smoothWheel: true,
    // touch is NOT smoothed — keeps native address-bar collapse on mobile
  });

  lenis.on('scroll', ScrollTrigger.update);

  /* ONE shared loop — GSAP ticker gives seconds, Lenis.raf() wants milliseconds → ×1000 */
  gsap.ticker.add((t) => lenis!.raf(t * 1000));
  gsap.ticker.lagSmoothing(0); /* no catch-up jitter */

  /* Refresh ScrollTrigger after fonts and known-size media load */
  document.fonts.ready.then(() => ScrollTrigger.refresh());

  return lenis;
}

export function destroyLenis() {
  if (lenis) {
    gsap.ticker.remove((t) => lenis!.raf(t * 1000));
    lenis.destroy();
    lenis = null;
    lenisInitialized = false;
  }
}

export { gsap, ScrollTrigger, SplitText, Flip };

/* ── Motion vocabulary constants — §12.2 ────────────────────────── */

export const EASINGS = {
  out: 'expo.out',
  inOut: 'expo.inOut',
  powerInOut: 'power3.inOut',
  back: 'back.out(1.4)',
} as const;

/* Allowed durations only (ms) */
export const DURATIONS = {
  micro: 0.2,   /* 200ms — nudge, hover */
  short: 0.4,   /* 400ms — small transitions */
  medium: 0.7,  /* 700ms — draws, wipes */
  long: 0.9,    /* 900ms — mask rise */
  full: 1.2,    /* 1200ms — complex sequences */
} as const;
