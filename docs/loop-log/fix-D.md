# fix-D — Footer, Enquiry & Forms

## Iteration 1 (implement)
- site.ts: added formatCityLine / formatAddressLines / formatAddress / telHref (city==state deduped; no new values).
- navigation.ts: trailing slashes; footer product links derived from productGroups; footerProductLinks / footerCompanyLinks exports (no index slicing); dropped /sitemap.xml from legal (not a Phase 7 route).
- Footer.tsx: rebuilt. Brand (white logo + tagline EN/HI + descriptor), Products, Company, Contact, bottom bar (© year, legal). 4/2/1 col via scoped CSS. Contact shows address, Maps only if mapsUrl, phone/email/WhatsApp only if set, always "Enquire online" -> /enquiry/. No JS hover handlers; contrast raised (was 0.3 alpha).
- enquiry-schema.ts: message (Additional notes) optional; trim before min; digit-count phone rule; custom messages; buyerType message.
- PHP: message optional, phone rule mirrors schema.
- Forms: aria-required only on truly required fields, aria-invalid + aria-describedby, role=alert inline errors, focus first invalid field, responsive rows, visible focus, on-dark placeholder/option colours, per-line product errors, labels tied to inputs.
- enquiry-submit.ts + EnquiryFallback.tsx: JSON-verified POST; 404/HTML/network/timeout/5xx -> WhatsApp / mailto (when configured) + Try again; 422 server errors mapped inline; 429 message.
- WhatsAppFAB: var(--whatsapp), 2px radius, safe-area insets, hides on #enquiry and #site-footer, reduced-motion via CSS media query, analytics.
- #25D366 removed everywhere in my files (-> var(--whatsapp)).
- enquiry page: responsive grid (stacks <1024), deduped address, FE0E arrows.

## Iteration 2 (checks)
tsc clean; check-hex / glass / spacing / forbidden pass. Fixed: "&#10003;" tripped check-hex; "backdrop-filter" in a comment tripped check-glass.
Schema sanity test (node): empty notes passes; empty full form yields name/company/phone/buyerType/lines.0.product errors.

## Iteration 3 (self-critique)
- Footer min-height typo (44 -> 44px) fixed.
- Not verified visually (no build allowed): 375/768/1440 layouts are CSS-reasoned only.

## Remaining
- phone/whatsapp/email/mapsUrl/gstin still null (TODO(client)); with all null, fallback = "Try again" only.
- /sitemap.xml link removed from footer legal — re-add once the sitemap exists.
- Other files (Header/Drawer/Hero/UtilityBar) still build their own wa.me links; could use waGeneral().
- Company is required in both schemas (kept; confirm with client if it hurts conversion).
