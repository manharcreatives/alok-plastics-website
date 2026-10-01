# Phase 6 — Enquiry & WhatsApp

**Status:** Complete  
**Build:** ✓ Passes (11 static pages)  
**TypeScript:** ✓ Clean

---

## Files created

| File | Purpose |
|------|---------|
| `src/lib/enquiry-schema.ts` | Zod v4 schemas: `shortEnquirySchema`, `fullEnquirySchema`, `flattenZodErrors`, `validateShortForm` |
| `src/lib/whatsapp.ts` | WA deep link helpers: `waGeneral()`, `waProduct()`, `waFromShortForm()` |
| `src/lib/analytics.ts` | `dataLayer` event pushes: `trackEnquirySubmit`, `trackWhatsAppClick`, `trackPhoneClick`, `trackQuoteCtaClick` |
| `public/api/enquiry.php` | PHP endpoint — validates, rate-limits (30s/IP), honeypot, sends email via `mail()` |
| `public/api/config.php.example` | SMTP config template — `config.php` is never committed |
| `src/components/forms/ShortEnquiryForm.tsx` | Short form (name, company, phone, product, qty, message) — used in S11 + reusable |
| `src/components/forms/FullEnquiryForm.tsx` | Full bulk form with multi-line product selection, GSTIN, city/state |
| `src/app/enquiry/page.tsx` | `/enquiry` route — full form + WhatsApp sidebar + contact block |
| `docs/deploy-hostinger.md` | Deployment guide for Hostinger Premium |

## Files updated

| File | Change |
|------|--------|
| `src/components/sections/EnquirySection.tsx` | Refactored to use `ShortEnquiryForm` component (DRY) |

---

## Architecture notes

- Zod v4 API used throughout (`issues` not `errors`; no `required_error` shorthand)
- PHP endpoint uses `php mail()` by default; PHPMailer SMTP upgrade path documented
- `config.php` in `.gitignore` — credentials never committed
- WhatsApp is primary channel (§14.1) — all forms offer WA follow-up after success
- Analytics events are no-ops when `ga4Id` is null (privacy-safe)
- Form states: idle → submitting → success/error with `aria-live="polite"`

---

## PHP endpoint security measures

- CORS: Origin/Referer header check against `$ALOK_SITE_URL`
- Honeypot: `_honey` must be empty (silent success for bots)
- Rate limiting: one request per hashed IP per 30 seconds (file-lock)
- Server-side validation mirrors Zod schema
- Email header injection prevention (sanitised values)
- Content-Security-Policy header: `default-src 'none'`

---

## Test checklist (manual — run before go-live)

- [ ] Valid submit → email arrives at `$ALOK_TO_EMAIL`
- [ ] Missing required field → inline error shown, no submit
- [ ] Invalid GSTIN format → inline error
- [ ] Honeypot filled → silently succeeds (no email sent)
- [ ] Rate limit → 429 on second submit within 30s
- [ ] Network failure → error state shown with WhatsApp fallback
- [ ] WhatsApp link opens WA with correct prefilled message
- [ ] Analytics: `enquiry_submit` event fires on success
- [ ] `ShortEnquiryForm` works on both dark (home) and light (enquiry page)

---

## Awaiting from client

- `enquiry@alokplastics.com` — confirm the enquiry inbox address
- `noreply@alokplastics.com` — create this mailbox on Hostinger
- WhatsApp number — configure in `site.contact.whatsapp`
- Typical reply time — add to success message copy
