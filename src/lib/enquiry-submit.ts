/**
 * Enquiry transport + graceful fallback helpers (shared by short and full forms).
 *
 * The PHP endpoint only exists on the Hostinger deployment. On a static preview
 * (or if PHP/mail is down) the POST 404s, returns HTML, or fails at network level.
 * Every such case maps to kind 'unavailable' so the UI can offer mailto / retry.
 */

import { site } from '@/content/site';

export const ENQUIRY_ENDPOINT = '/api/enquiry.php';

export type SubmitResult =
  | { ok: true }
  | { ok: false; kind: 'validation'; errors: Record<string, string> }
  | { ok: false; kind: 'rate-limited' }
  | { ok: false; kind: 'unavailable' };

export async function postEnquiry(body: FormData): Promise<SubmitResult> {
  const ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const timer = ctrl ? setTimeout(() => ctrl.abort(), 15_000) : null;
  try {
    const res = await fetch(ENQUIRY_ENDPOINT, { method: 'POST', body, signal: ctrl?.signal });
    if (res.status === 422) {
      const j = await res.json().catch(() => null) as { errors?: Record<string, string> } | null;
      if (j?.errors) return { ok: false, kind: 'validation', errors: j.errors };
      return { ok: false, kind: 'unavailable' };
    }
    if (res.status === 429) return { ok: false, kind: 'rate-limited' };
    if (!res.ok) return { ok: false, kind: 'unavailable' };
    /* A static host may answer 200 with an HTML shell — only a JSON {ok:true} counts. */
    const j = await res.json().catch(() => null) as { ok?: boolean } | null;
    return j?.ok === true ? { ok: true } : { ok: false, kind: 'unavailable' };
  } catch {
    return { ok: false, kind: 'unavailable' };
  } finally {
    if (timer) clearTimeout(timer);
  }
}

/** Fallback channels built from the same summary text; each is null if not configured. */
export function fallbackChannels(summaryLines: string[]): {
  mailto: string | null;
} {
  const text = ['Hello Alok Plastics, enquiry from the website:', ...summaryLines].join('\n');
  const email = site.contact.email;
  return {
    mailto: email
      ? `mailto:${email}?subject=${encodeURIComponent('Website enquiry')}&body=${encodeURIComponent(text)}`
      : null,
  };
}
