# P7 — Contact, legal & 404 (Agent P3)

Pass 1: implemented /contact, /privacy, /terms, /refund, not-found + MapLoader, NotFoundFinder, LegalPage.
Checks: `npx tsc --noEmit` clean; check-forbidden / check-glass / check-hex / check-spacing pass.
Self-critique fixes: removed nested <main> (layout already renders main#main); shortened titles because the root template appends "| Alok Plastics, Chandigarh".
Decisions: map iframe only when mapsUrl is an embed URL (/maps/embed or output=embed); otherwise a link-out to mapsUrl or the address-derived search URL. No third-party request before the click.
Legal pages: headings + "being finalised" notice only; no legal text, no "Last updated".
Client info needed: phone, email, WhatsApp, GSTIN, business hours, Google Maps embed URL, legal text for privacy/terms/refund.
Not run: next build (shared dir), axe/Playwright, visual 375px check.
