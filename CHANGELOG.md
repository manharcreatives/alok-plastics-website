# Changelog

## Enquiry → order flow wired website ⇄ admin (see connection.md)

- Live carts: cart syncs to `/api/cart.php`; admin "Live carts" page shows customer, products, qty, availability, abandoned state.
- Enquiry: OTP login, required delivery address, sequential `ENQ-1001+` IDs, prefilled WhatsApp redirect.
- Admin lifecycle: new → review → quote → confirmed → payment → dispatch → GST invoice no. → closed (+ cancel), audit-logged, click-to-send WhatsApp message per stage.
- `connection.md` added as the wiring reference.


## Premium revamp: five product groups, customer sign-in orders, careers form, admin additions

- Five product groups, simplified product cards, catalogue and custom-part block, manufacturer snapshot in About, Why-choose layout fix, rebalanced footer, one icon set (Phosphor).
- Cart: name and mobile sign-in with OTP, order saved on the server, structured WhatsApp message, success screen with Order ID.
- Careers: application form with resume upload or link, saved in the admin, emailed and logged to Google Sheet.
- Admin: Orders, Applications, Customers; Products can be added, moved between groups, given fitment and removed.
- Old group and product URLs redirect to the new groups.

## 0.2.0 — 2026-10-01
**Fix pass (Phases 1–6)** — glass nav centring/overflow fixed; preloader mounted (logo → Sanskrit tagline → navbar hand-off, failsafes); real logo vectorised (98.4% pixel match); hero H1/CTAs/scroll cue fixed; WhatsApp CTA; counters, product bento, industries bento, USP chain rebuilt; journey dead-scroll removed (~500vh → ~275vh, static on mobile); dot-matrix India map; honesty-rule copy cleanup; footer address/contact; forms (optional notes, a11y errors, offline fallback); local fonts (offline-safe build).
**Phase 7** — /about, /products (finder + filters), /products/[group], /products/[group]/[part] (17 parts), /industries, /career, /contact, /privacy, /terms, /refund (placeholders, noindex), branded 404; shared Footer/FAB in layout.
**Phase 8** — metadata + JSON-LD (Organization, LocalBusiness, WebSite, Product, BreadcrumbList, FAQPage), sitemap, robots, llms.txt, .htaccess, OG/icons, SEO audit script, lab pruning.
**Phase 9** — Playwright smoke + axe tests, contrast and aria fixes, Lighthouse run (see docs/qa.md).

## 0.1.0 — Phases 0–6 (initial build)
