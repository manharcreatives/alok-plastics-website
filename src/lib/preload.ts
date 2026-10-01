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

/* Session guard — one preloader run per session */
export const SESSION_KEY = 'alok:preloaded';

export function shouldShowPreloader(): boolean {
  if (typeof window === 'undefined') return false;
  if (sessionStorage.getItem(SESSION_KEY)) return false;

  /* Save-Data / slow connection — skip entirely */
  const conn = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
  if (conn?.saveData) return false;
  if (conn?.effectiveType && ['slow-2g', '2g'].includes(conn.effectiveType)) return false;

  /* Reduced motion — handled by the component (still show, but simplified) */
  return true;
}

export function markPreloaderDone() {
  try { sessionStorage.setItem(SESSION_KEY, '1'); } catch (_) {}
}
