/**
 * useReducedMotion — §12.1, §12.3
 *
 * When true:
 * - No Lenis instantiation
 * - No GSAP ScrollTrigger sequences
 * - No pinned sections
 * - No count-up odometers
 * - No marquee motion
 * - No preloader construction sequence
 * - No hero video autoplay
 */

'use client';

import { useEffect, useState } from 'react';

const MQ = '(prefers-reduced-motion: reduce)';

export function useReducedMotion(): boolean {
  const [prefersReduced, setPrefersReduced] = useState(() => {
    if (typeof window === 'undefined') return false;
    return matchMedia(MQ).matches;
  });

  useEffect(() => {
    const mql = matchMedia(MQ);
    const handler = (e: MediaQueryListEvent) => setPrefersReduced(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  return prefersReduced;
}

/* For non-hook use (e.g. in GSAP timelines, server-safe with SSR guard) */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return matchMedia(MQ).matches;
}
