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
/* The motion core (GSAP + ScrollTrigger + Lenis, ~45 KB gz) is imported dynamically so it is not on
   the critical path of pages whose first paint doesn't need it. Sections that animate import it
   statically and share the same module instance. */

export default function LenisProvider({ children }: { children?: React.ReactNode }) {
  useEffect(() => {
    let alive = true;
    let destroy: (() => void) | undefined;
    import('@/lib/motion').then(m => {
      if (!alive) return;
      m.initLenis();
      destroy = m.destroyLenis;
    });
    return () => { alive = false; destroy?.(); };
  }, []);

  return <>{children}</>;
}
