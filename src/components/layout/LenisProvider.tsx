/**
 * LenisProvider — mounts Lenis on the client, provides smooth scroll context.
 * Wrap around the main page content in layout.tsx (client boundary).
 *
 * §12.1: ONE shared rAF loop via gsap.ticker. Touch is NOT smoothed.
 * §12.1: ×1000 and lagSmoothing(0) are both enforced inside motion.ts.
 * §12.3: data-lenis-prevent on modals, drawers, mega-panel — handled at usage site.
 */

'use client';

import { useEffect } from 'react';
import { initLenis, destroyLenis } from '@/lib/motion';

export default function LenisProvider({ children }: { children?: React.ReactNode }) {
  useEffect(() => {
    initLenis();
    return () => destroyLenis();
  }, []);

  return <>{children}</>;
}
