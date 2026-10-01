/**
 * Runtime overlay for admin-managed values (public/data/settings.json, written by /admin/).
 * Build-time values from site.ts always render first; a valid, non-empty runtime value
 * overlays them after hydration. The file is treated as untrusted text (docs/admin-panel.md).
 */
export type RuntimeSettings = {
  schemaVersion: 1;
  contact?: { phone?: string | null; whatsapp?: string | null; email?: string | null; mapsUrl?: string | null };
};

let cache: Promise<RuntimeSettings | null> | null = null;

export function fetchRuntimeSettings(): Promise<RuntimeSettings | null> {
  if (typeof window === 'undefined') return Promise.resolve(null);
  cache ??= fetch('/data/settings.json', { cache: 'no-cache' })
    .then(async r => {
      if (!r.ok || !(r.headers.get('content-type') ?? '').includes('json')) return null;
      const j = await r.json();
      return j && j.schemaVersion === 1 ? (j as RuntimeSettings) : null;
    })
    .catch(() => null);
  return cache;
}

/** Digits-only WhatsApp number from a runtime string, or null if it doesn't look like one. */
export function cleanWhatsapp(v: unknown): string | null {
  if (typeof v !== 'string') return null;
  const d = v.replace(/\D/g, '');
  return d.length >= 10 && d.length <= 15 ? d : null;
}
