/**
 * Asset preloader — §10.4 / §10.3
 *
 * Tracks:
 * - document.fonts.ready
 * - Hero poster image decode()
 * - Hero video 'canplay' (when device qualifies)
 * - Critical above-the-fold images
 *
 * Progress is the max of real loading progress and a minimum choreography
 * timeline — never jumps backwards, never finishes before the sequence is ready.
 */

'use client';

export interface PreloadProgress {
  value: number; /* 0–100 */
  done: boolean;
}

export type ProgressCallback = (progress: PreloadProgress) => void;

interface PreloadTask {
  name: string;
  weight: number;
  promise: Promise<void>;
}

function makeTask(name: string, weight: number, p: Promise<unknown>): PreloadTask {
  return {
    name,
    weight,
    promise: p.then(() => {}).catch(() => {}), /* never reject */
  };
}

export function buildPreloadTasks(opts: {
  heroPosterSrc?: string | null;
  heroVideoSrc?: string | null;
  criticalImageSrcs?: string[];
}): PreloadTask[] {
  const tasks: PreloadTask[] = [];

  /* Fonts */
  tasks.push(makeTask('fonts', 30, document.fonts.ready));

  /* Hero poster */
  if (opts.heroPosterSrc) {
    const img = new Image();
    tasks.push(makeTask('poster', 25, img.decode().catch(() => {})));
    img.src = opts.heroPosterSrc;
  }

  /* Hero video */
  if (opts.heroVideoSrc) {
    const video = document.createElement('video');
    video.preload = 'metadata';
    const p = new Promise<void>(resolve => {
      video.addEventListener('canplay', () => resolve(), { once: true });
      video.addEventListener('error', () => resolve(), { once: true });
      setTimeout(() => resolve(), 3000); /* hard fallback */
    });
    tasks.push(makeTask('video', 20, p));
    video.src = opts.heroVideoSrc;
  }

  /* Critical images */
  (opts.criticalImageSrcs ?? []).forEach((src, i) => {
    const img = new Image();
    tasks.push(makeTask(`img-${i}`, 10, img.decode().catch(() => {})));
    img.src = src;
  });

  return tasks;
}

export function createPreloader(
  tasks: PreloadTask[],
  onProgress: ProgressCallback,
  /** Minimum time in ms before done can be true (matches choreography) */
  minMs = 2600,
): { cancel: () => void } {
  let cancelled = false;
  let completed = 0;
  const totalWeight = tasks.reduce((s, t) => s + t.weight, 0) || 1;
  let realProgress = 0;
  const startTime = Date.now();

  function report() {
    if (cancelled) return;
    const elapsed = Date.now() - startTime;
    /* Minimum choreography curve: 0→90% over minMs, then we wait for real assets */
    const choreoCurve = Math.min(90, (elapsed / minMs) * 90);
    const progress = Math.max(realProgress, choreoCurve);
    const done = realProgress >= 100 && elapsed >= minMs;
    onProgress({ value: Math.round(progress), done });
  }

  /* Interval drives the choreography minimum curve */
  const interval = setInterval(report, 50);

  tasks.forEach(task => {
    task.promise.then(() => {
      if (cancelled) return;
      completed += task.weight;
      realProgress = Math.round((completed / totalWeight) * 100);
      report();
    });
  });

  /* Hard cap: mark done after minMs even if assets aren't ready */
  const hardCap = setTimeout(() => {
    if (!cancelled) {
      realProgress = 100;
      report();
    }
  }, Math.max(minMs, 4000));

  return {
    cancel() {
      cancelled = true;
      clearInterval(interval);
      clearTimeout(hardCap);
    },
  };
}

/* Per-tab guard — the preloader runs once per browser tab, so a refresh or in-site navigation in the
   same tab skips it, while every new tab (link, bookmark, typed URL, new window) plays it again.
   The marker lives in window.name, which survives reloads and navigation within a tab but starts
   empty in each new tab. sessionStorage is deliberately NOT used: browsers copy it into tabs opened
   from the page (target=_blank, duplicate tab), which would wrongly skip the preloader there.
   Keep the string in sync with the inline script in SiteDocument.tsx. */
export const SESSION_KEY = 'alok:preloaded';

function tabSeen(): boolean {
  try { return window.name.indexOf(SESSION_KEY) >= 0; } catch (_) { return false; }
}

export function shouldShowPreloader(): boolean {
  if (typeof window === 'undefined') return false;
  if (tabSeen()) return false;

  /* Every visitor sees it: no Save-Data / slow-connection / reduced-motion opt-out (reduced motion gets
     the short fade version from preloader.timeline.ts) */
  return true;
}

export function markPreloaderDone() {
  try { if (!tabSeen()) window.name = (window.name ? window.name + ' ' : '') + SESSION_KEY; } catch (_) {}
}

/** Lab only: forget this tab's mark so the preloader can be replayed. */
export function resetPreloaderMark() {
  try { window.name = window.name.split(SESSION_KEY).join('').trim(); } catch (_) {}
}
