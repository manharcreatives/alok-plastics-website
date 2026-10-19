'use client';

import { useSyncExternalStore } from 'react';
import { site } from '@/content/site';
import { setAnalyticsConsent } from '@/lib/analytics';

const STORAGE_KEY = 'alok:consent';
const EVENT_NAME = 'alok:consent-changed';

/* localStorage as an external store — avoids setState-in-effect and hydration mismatch
   (server snapshot is null → banner hidden on SSR; client decides from the stored choice). */

function subscribe(onStoreChange: () => void): () => void {
  window.addEventListener(EVENT_NAME, onStoreChange);
  return () => window.removeEventListener(EVENT_NAME, onStoreChange);
}

function getSnapshot(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function getServerSnapshot(): null {
  return null;
}

/**
 * Cookie consent banner — Google Consent Mode v2.
 * Hidden once a choice is stored; updates gtag consent + the analytics event gate.
 * No banner when analytics IDs are unset in site.ts.
 */
export default function ConsentBanner() {
  const stored = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  if (!site.analytics.ga4Id && !site.analytics.gtmId) return null;
  if (stored === 'all' || stored === 'essential') return null;

  function choose(choice: 'all' | 'essential') {
    try {
      localStorage.setItem(STORAGE_KEY, choice);
    } catch {
      /* storage blocked — consent stays denied */
    }
    const granted = choice === 'all';
    setAnalyticsConsent(granted);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    if (typeof w.gtag === 'function') {
      w.gtag('consent', 'update', {
        ad_storage: granted ? 'granted' : 'denied',
        ad_user_data: granted ? 'granted' : 'denied',
        ad_personalization: granted ? 'granted' : 'denied',
        analytics_storage: granted ? 'granted' : 'denied',
      });
    }
    window.dispatchEvent(new Event(EVENT_NAME));
  }

  return (
    <div
      role="region"
      aria-label="Cookie consent"
      className="fixed inset-x-0 bottom-0 z-[90] border-t border-line bg-canvas/95 backdrop-blur-sm print:hidden"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="text-sm leading-snug text-ink/80">
          We use cookies (Google Analytics) to understand how the site is used.{' '}
          <a href="/privacy/" className="underline underline-offset-2 hover:text-ink">
            Privacy policy
          </a>
        </p>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => choose('essential')}
            className="rounded-full border border-line px-4 py-2 text-sm text-ink transition-colors hover:bg-ink/[0.04]"
          >
            Essential only
          </button>
          <button
            type="button"
            onClick={() => choose('all')}
            className="rounded-full bg-ink px-4 py-2 text-sm text-canvas transition-opacity hover:opacity-90"
          >
            Accept all
          </button>
        </div>
      </div>
    </div>
  );
}
