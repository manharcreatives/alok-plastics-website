/**
 * Motion vocabulary hooks — §12.2
 * All scroll animations use GSAP. micro-interactions use `motion` (Framer Motion).
 * Never use Lenis for micro-interactions.
 *
 * Pattern: each hook accepts a ref and optional ScrollTrigger options.
 * All animations are gated on !prefersReducedMotion.
 * Use useGSAP from @gsap/react for cleanup on unmount.
 */

'use client';

import { useEffect, useRef, type RefObject } from 'react';
import { useGSAP } from '@gsap/react';
import { SplitText } from 'gsap/SplitText';
import { gsap, ScrollTrigger, DURATIONS, EASINGS } from '@/lib/motion';

gsap.registerPlugin(SplitText);
import { prefersReducedMotion } from './useReducedMotion';

/* ── useGSAP registration ────────────────────────────────────────── */
gsap.registerPlugin(useGSAP);

export interface ScrollTriggerOpts {
  trigger?: Element | string | null;
  start?: string;
  end?: string;
  once?: boolean;
  scrub?: boolean | number;
}

/* ── useMaskRise — headings reveal ──────────────────────────────── */
/**
 * §12.2: SplitText lines, yPercent 110→0 inside overflow mask.
 * 900ms expo.out, 80ms stagger.
 */
export function useMaskRise(
  ref: RefObject<HTMLElement | null>,
  opts: ScrollTriggerOpts = {},
) {
  useGSAP(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;

    const split = new SplitText(el, { type: 'lines', linesClass: 'split-line', aria: 'none' });
    /* Mask: overflow hidden on each line */
    split.lines.forEach(line => {
      (line as HTMLElement).style.overflow = 'hidden';
    });

    gsap.from(split.lines, {
      yPercent: 110,
      duration: DURATIONS.long,
      ease: EASINGS.out,
      stagger: 0.08,
      scrollTrigger: {
        trigger: opts.trigger ?? el,
        start: opts.start ?? 'top 85%',
        once: opts.once ?? true,
      },
      onComplete: () => split.revert(),
    });
  }, { scope: ref, dependencies: [] });
}

/* ── useDrawRule — hairlines and dividers ───────────────────────── */
/**
 * §12.2: scaleX from origin left, 700ms power3.inOut.
 */
export function useDrawRule(
  ref: RefObject<HTMLElement | SVGElement | null>,
  opts: ScrollTriggerOpts = {},
) {
  useGSAP(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;

    gsap.from(el, {
      scaleX: 0,
      transformOrigin: 'left center',
      duration: DURATIONS.medium,
      ease: EASINGS.powerInOut,
      scrollTrigger: {
        trigger: opts.trigger ?? el,
        start: opts.start ?? 'top 88%',
        once: opts.once ?? true,
      },
    });
  }, { scope: ref, dependencies: [] });
}

/* ── useDiagonalWipe — images and cards ─────────────────────────── */
/**
 * §12.2: clip-path polygon revealing lower-left → upper-right (K direction).
 * 1000ms expo.inOut.
 */
export function useDiagonalWipe(
  ref: RefObject<HTMLElement | null>,
  opts: ScrollTriggerOpts = {},
) {
  useGSAP(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;

    gsap.from(el, {
      clipPath: 'polygon(0% 100%, 0% 100%, 0% 100%, 0% 100%)',
      duration: 0.9,
      ease: EASINGS.inOut,
      scrollTrigger: {
        trigger: opts.trigger ?? el,
        start: opts.start ?? 'top 85%',
        once: opts.once ?? true,
      },
      onComplete: () => {
        /* Remove clip-path to avoid paint overhead after animation */
        if (el) el.style.clipPath = '';
      },
    });
    /* Set the final state */
    gsap.set(el, {
      clipPath: 'polygon(0% 100%, 100% 0%, 100% 100%, 0% 100%)',
    });
  }, { scope: ref, dependencies: [] });
}

/* ── useLockReveal — interlocking cards (L+O motif) ─────────────── */
/**
 * §12.2: Two elements slide 24px along 45° and meet, back.out(1.4) mechanical click.
 */
export function useLockReveal(
  ref1: RefObject<HTMLElement | null>,
  ref2: RefObject<HTMLElement | null>,
  triggerRef?: RefObject<HTMLElement | null>,
) {
  useGSAP(() => {
    const el1 = ref1.current;
    const el2 = ref2.current;
    if (!el1 || !el2 || prefersReducedMotion()) return;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: triggerRef?.current ?? el1,
        start: 'top 80%',
        once: true,
      },
    });

    tl.from(el1, { x: -17, y: -17, opacity: 0, duration: DURATIONS.medium, ease: EASINGS.back }, 0)
      .from(el2, { x: 17, y: 17, opacity: 0, duration: DURATIONS.medium, ease: EASINGS.back }, 0);
  }, { scope: ref1, dependencies: [] });
}

/* ── useLightSweep — product hover, proof numerals ──────────────── */
/**
 * §12.2: 45° soft white band crosses once, 700ms. Never loops on hover.
 * The el should have position:relative and overflow:hidden.
 */
export function useLightSweep(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;

    const sweep = document.createElement('div');
    sweep.setAttribute('aria-hidden', 'true');
    sweep.style.cssText = `
      position: absolute; inset: -20%; pointer-events: none;
      background: linear-gradient(45deg, transparent 30%, rgba(255,255,255,.18) 50%, transparent 70%);
      transform: translateX(-120%) translateY(120%);
      mix-blend-mode: soft-light; will-change: transform;
    `;
    el.style.position = 'relative';
    el.style.overflow = 'hidden';
    el.appendChild(sweep);

    let sweepTween: gsap.core.Tween | null = null;
    const trigger = () => {
      if (sweepTween?.isActive()) return;
      sweepTween = gsap.fromTo(sweep,
        { x: '-120%', y: '120%' },
        { x: '120%', y: '-120%', duration: DURATIONS.medium, ease: EASINGS.powerInOut },
      );
    };

    el.addEventListener('mouseenter', trigger);
    return () => {
      el.removeEventListener('mouseenter', trigger);
      sweep.remove();
      sweepTween?.kill();
    };
  }, [ref]);
}

/* ── useOdometer — stat numerals ────────────────────────────────── */
/**
 * §12.2: Per-digit vertical rolling columns, tabular-nums, 1400ms, once:true.
 * Reduced motion: show final value immediately.
 */
export function useOdometer(
  ref: RefObject<HTMLElement | null>,
  value: number,
  opts: ScrollTriggerOpts = {},
) {
  const hasRun = useRef(false);

  useGSAP(() => {
    const el = ref.current;
    if (!el) return;

    if (prefersReducedMotion()) {
      el.textContent = String(value);
      return;
    }

    const startVal = 0;
    const obj = { val: startVal };

    gsap.to(obj, {
      val: value,
      duration: 1.2,
      ease: EASINGS.inOut,
      scrollTrigger: {
        trigger: opts.trigger ?? el,
        start: opts.start ?? 'top 85%',
        once: true,
        onEnter: () => {
          if (hasRun.current) return;
          hasRun.current = true;
        },
      },
      onUpdate() {
        el.textContent = Math.round(obj.val).toLocaleString('en-IN');
      },
      onComplete() {
        el.textContent = value.toLocaleString('en-IN');
      },
    });
  }, { scope: ref, dependencies: [value] });
}

/* ── useGSAPContext — route-change cleanup ───────────────────────── */
/**
 * §12.3: Wrap all GSAP in a context; revert on component unmount.
 * Usage: const ctx = useGSAPContext(containerRef);
 */
export function useGSAPContext(
  containerRef: RefObject<Element | null>,
  fn: () => void,
  deps: unknown[] = [],
) {
  useGSAP(fn, { scope: containerRef, dependencies: deps });
}

/* ── Nudge utility — hover ↗ for arrow icons ────────────────────── */
/**
 * §12.2: translate(2px,-2px) 200ms nudge on hover — the K direction ↗.
 * Pure CSS is preferred; this is for programmatic use.
 */
export const NUDGE_HOVER_STYLE = {
  transition: `transform ${DURATIONS.micro}s ease`,
  display: 'inline-block',
} as const;

export const NUDGE_HOVER_HANDLERS = {
  onMouseEnter: (e: React.MouseEvent<HTMLElement>) => {
    if (!prefersReducedMotion()) {
      (e.currentTarget as HTMLElement).style.transform = 'translate(2px, -2px)';
    }
  },
  onMouseLeave: (e: React.MouseEvent<HTMLElement>) => {
    (e.currentTarget as HTMLElement).style.transform = '';
  },
} as const;
