'use client';

/**
 * RuntimeProvider — one fetch, one context, mounted once in the root layout.
 *
 * The panel writes `public/data/*.json`; the static export cannot know about it at
 * build time, so every admin-authored value reaches the browser the same way: the
 * build-time value from `src/content/*` renders first and is in the HTML, then this
 * provider overlays a non-null runtime value after hydration.
 *
 * That order is not a detail, it is the whole contract (docs/admin-panel.md:71):
 *   · no layout shift, because the first paint already has the real content
 *   · no flash of a missing phone number
 *   · crawlers, JSON-LD and llms.txt keep reading the build-time values, which is
 *     the honest limit of a no-Node host and is documented rather than hidden
 *
 * State starts as EMPTY_RUNTIME, so the server render and the first client render are
 * identical. If a fetch fails, the state simply never changes.
 */

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { EMPTY_RUNTIME, fetchRuntimeData, type RuntimeData } from '@/lib/runtime-data';

const RuntimeCtx = createContext<RuntimeData>(EMPTY_RUNTIME);

export default function RuntimeProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<RuntimeData>(EMPTY_RUNTIME);

  useEffect(() => {
    let live = true;
    fetchRuntimeData().then(next => {
      if (live) setData(next);
    });
    return () => {
      live = false;
    };
  }, []);

  const value = useMemo(() => data, [data]);

  return <RuntimeCtx.Provider value={value}>{children}</RuntimeCtx.Provider>;
}

/** The raw validated bundle. Most components want one of the narrow hooks instead. */
export function useRuntime(): RuntimeData {
  return useContext(RuntimeCtx);
}
