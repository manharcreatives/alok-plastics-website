'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

/** Re-runs the server page every few seconds (used by the live carts screen). Pauses while the tab is hidden. */
export default function AutoRefresh({ seconds = 8 }: { seconds?: number }) {
  const router = useRouter();
  useEffect(() => {
    const t = setInterval(() => {
      if (document.visibilityState === 'visible') router.refresh();
    }, seconds * 1000);
    return () => clearInterval(t);
  }, [router, seconds]);
  return null;
}
