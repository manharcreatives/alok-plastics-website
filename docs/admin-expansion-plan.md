# Admin expansion plan (`/admin/` ↔ website)

**Status:** plan only. Nothing in this document has been implemented yet.
**Scope decided with the client (2026-10-02):** Wave 0 wiring first, then products; products work
both live-without-rebuild *and* rebuild-for-SEO; content screens limited to **Careers culture + teams**;
operations = **send from the panel** + **job applications with CV upload**.

Read with: `docs/admin-panel.md` (the panel's spec + security model — non-negotiable),
`docs/PROMPT-FINAL.md` §P14–P18 (the product work already designed), `docs/qa.md`.

---

## 0. Why this document exists

The panel is **built and working**, but almost none of what it writes reaches the website.

| Written by `/admin/` | Read by the website? | Evidence |
|---|---|---|
| `settings.json` → `contact.whatsapp` | yes — FAB only | `src/lib/runtime-data.ts:13`, sole consumer `src/components/sections/WhatsAppFAB.tsx:57` |
| `settings.json` → phone, email, mapsUrl, gstin, socials, replyTime, **hours**, **banner** | **no** | `git grep` for `/data/` in `src/` returns only `runtime-data.ts` + `WhatsAppFAB.tsx` |
| `careers.json` (Open roles) | **no** — zero consumers | `career/page.tsx:86` reads `careerConfig.openRoles` (build-time) |
| `product-overrides.json` (hide/show) | **no** — zero consumers | `products.ts:404` `publishedProducts` is static |
| Product create/edit/delete + images | not built | documented as out of scope in `docs/admin-panel.md:75` |

Meanwhile the real content is hardcoded at build time: `src/content/site.ts` (17 `TODO(client)`),
`src/content/products.ts` (41), `src/content/journey.ts` (6), `src/content/types.ts` (16),
`src/content/career.ts` (2), `src/content/industries.ts` (1).

**Consequence:** ~85% of the panel's output is currently invisible. Wave 0 fixes that before we build
anything new. All contact values are still `null` in `src/content/site.ts:29-34`, so this also becomes
the first time the panel changes anything a visitor can actually see.

---

## 1. Architecture decisions

### D1 — Static export forces a client-side overlay

`next.config.ts` → `output: 'export'`, `images.unoptimized: true`. There is no server on the host
(Hostinger Premium, PHP only — `docs/admin-panel.md:3`). Therefore **every** admin change is a
`fetch('/data/*.json')` in the browser after hydration. This is not a compromise we can design away;
it is the platform. The rule already written down in `docs/admin-panel.md:57-71` stays:

> render the build-time value first, overlay a non-null runtime value after hydration.

Consequences to state honestly in the panel UI itself, not just in docs:

| Updates instantly (after hydration) | Needs a rebuild to be seen by crawlers |
|---|---|
| phone / email / WhatsApp / maps / GSTIN links | prerendered HTML in the initial payload |
| opening hours, reply time, announcement banner | JSON-LD (`src/lib/seo.ts:37`, `:95`) |
| open roles, product lists, hidden products | `sitemap.xml` (`scripts/generate-sitemap.mjs`) |
| new product pages (client-rendered, Wave 1) | `llms.txt` / `llms-full.txt` (`scripts/generate-llms.mjs`) |
| enquiry/apply fallback addresses | OG images, `not-found` page |

### D2 — One provider, one fetch, one cache

Do **not** let each component fetch `/data/…` on its own.

- New `src/components/runtime/RuntimeProvider.tsx` (`'use client'`) mounts in
  `src/app/layout.tsx`, runs one `Promise.all` over the runtime files, validates each with `zod`
  (already a dependency, `package.json:37`), holds the result in React state, exposes hooks.
- Server-rendered HTML keeps build-time values → **no layout shift, no flash of missing content**.
- Any failure (404, HTML shell instead of JSON, invalid shape, offline) → context holds `null` and
  every consumer silently keeps its build-time value. **The site must never break because of this.**
- `runtime-data.ts` keeps `cleanWhatsapp` and its module-scope cache; the provider is the only caller.

Good news for implementation: **most** consumers are already client components — `Drawer`,
`NavMegaPanel`, `Header`, `PartFinder`, `ProductGallery`, `EnquiryFallback`, `ShortEnquiryForm`,
`FullEnquiryForm`, `AboutIntro`, `PanIndiaMap`, `ProductGroups`, `ProofStrip`, `IndustriesBento`,
`ValuesRibbon`, `Hero`, `JourneyOrbit`, `RequirementToRepeat`, `TrustQuote`, `Footer`,
`EnquirySection`, `MapLoader`, `NotFoundFinder`, `WhatsAppFAB`.

Three exceptions that need converting to `'use client'` (they hold no server-only logic today, just
`site.contact.*` reads): `src/components/products/StickyEnquiryBar.tsx`,
`src/components/forms/SuccessNext.tsx`, and the server page files that host them
(`products/[group]/[part]/page.tsx`, `contact/page.tsx`, `enquiry/page.tsx`) — the pages stay server
components and get small client wrappers around only the sections that change.

### D3 — Null never overrides

A `null`/empty runtime value must **never** blank out a build-time value. The panel ships nothing
pre-filled (`docs/admin-panel.md:18`) and the site must stay complete until the owner fills the panel.
Rule in code: `overlay(buildTime, runtime)` returns `runtime` only when it is a non-empty value of the
right type, else `buildTime`.

### D4 — After Wave 1, `data/products.json` is the source of truth

`src/content/products.ts` becomes the **build-time snapshot** produced by
`scripts/sync-runtime-content.mjs`. Client overlay order per group: build-time products render first,
a runtime product with the same slug replaces it in place (same position → no reshuffle), runtime-only
products append. A build-time product is **never removed client-side** — hiding is the admin's
explicit action, so broken links cannot appear after a rollback.

### D5 — Groups: copy editable, structure not

Group ids are the literal union `'01' | '02' | '03' | '04'` (`src/content/types.ts:4`). The panel may
edit group **name / tagline / description** at runtime (same slug → safe). Creating or deleting a
group changes route generation + sitemap, so that stays a developer action and the panel says so.

### D6 — Images are re-encoded, stored outside the web root, served by an allowlisted PHP stream

`docs/PROMPT-FINAL.md` P16 requires re-encode. So the stored bytes are known-good and can live outside
the web root:

- write to `<data_dir>/uploads/<yyyy-mm>/<slug>-<hex>.<ext>` (never inside `public_html`);
- serve via new `public/api/media.php?id=<opaque-id>`: the id must resolve to an entry in
  `products.json`, `Content-Type` comes from a **fixed allowlist map keyed by extension**, never from
  the file or the request; plus `X-Content-Type-Options: nosniff`, `Cache-Control: public, max-age=31536000, immutable`.
  An orphan or unknown id → 404. Images are public content, so this endpoint is unauthenticated but
  allowlist-gated — unreachable files simply do not resolve.
- **Requires the GD extension** to re-encode. If GD is missing, uploads are disabled and the System
  screen shows it; text-only product editing still works. (Add a System check row.)

### D7 — CVs never touch the web root

CVs land in `<data_dir>/applications/` with a `.bin` extension (no served/known extension on disk),
downloaded only through an authenticated admin route with a session check, a CSRF token, an audit
entry, `Content-Disposition: attachment`, and a `Content-Type` from the same fixed allowlist.
Copying `docs/admin-panel.md`'s storage model exactly.

### D8 — Whitelists, not filters

Every `INSERT`/`UPDATE` column list and every JSON key written comes from a fixed `const` list
(same pattern as `AlokStore::MUTABLE`, `core.php:174`). Nothing from `$_POST` may name a column or a
JSON key. Output is escaped with `e()` (`lib/web.php:10`) and free text is only ever rendered as a
**text node** — `innerHTML` stays banned (`docs/admin-panel.md:45`, P17).

### D9 — CSP is strict, so no inline anything

`lib/web.php:58` sets `default-src 'none'; script-src 'self'; style-src 'self'`. Consequences for all
new screens: no inline `onclick`, no inline `style=""`, no `<script>` blocks, no external fonts/CDNs.
Interactive behaviour goes into `public/admin/assets/admin.js`. `file://` upload must be pre-warned if
the browser needs the JS to enable a button (JS must stay optional for saving — never gate saving
behind JS).

---

## 2. Wave 0 — make the existing panel reach the website

No new screens. This is the highest-value, lowest-risk work: the panel already has validated writers,
we only add readers.

### 2.1 `src/lib/runtime-data.ts` → generic, zod-validated

```
src/lib/runtime-data.ts          (rewrite, keep cleanWhatsapp)
src/components/runtime/RuntimeProvider.tsx   (new, 'use client')
src/components/runtime/useRuntime.ts          (new: useRuntime, useRuntimeContact, useRuntimeRoles,
                                                        useRuntimeHiddenProducts, useRuntimeProducts)
src/lib/runtime-schema.ts       (new: zod schemas per file, treat every field as untrusted)
```

Supported files: `settings`, `careers`, `career-content`, `product-overrides`, `products`.
Keep: `cache:'no-cache'`, content-type check, `schemaVersion === 1`, module-scope cache, one fetch.

### 2.2 Careers overlay (job openings start working)

| File | Change |
|---|---|
| `src/app/career/page.tsx:160-167` | extract the roles block into new `src/components/career/RoleList.tsx` (`'use client'`); renders build-time roles first, swaps to runtime `active:true` roles after hydration |
| `src/components/career/RoleList.tsx` | **new** — also renders `description` (today it is collected by `content.php:242` and **never displayed**) and an "Apply now" button per role → the Wave 3 endpoint (§4.2) |

Also fixes a real gap: the panel asks for a description that the site throws away.

### 2.3 Product visibility overlay (hide/show starts working)

`hidden` slugs drop out of **lists, menus and search**; the product page itself stays reachable
(same promise as `docs/admin-panel.md:75`). Consumers:

| File | Note |
|---|---|
| `src/content/navigation.ts:18-25` | `productColumns` — feed `NavMegaPanel.tsx` (already client) |
| `src/app/products/page.tsx` | wrap the grid in a client component |
| `src/app/products/[group]/page.tsx` | same |
| `src/components/products/PartFinder.tsx` | already client; also drop from the machine/material facet counts (`src/lib/products-search.ts:55-60`) |
| `src/components/sections/ProductGroups.tsx` | home section |
| `src/components/hero/ValuesRibbon.tsx:163` | already client |
| `src/components/sections/FaqSection.tsx:17` | material list in the generated FAQ |
| `src/components/contact/NotFoundFinder.tsx:12` | 404 suggestions |
| `src/lib/forms` → `ShortEnquiryForm.tsx:39`, `FullEnquiryForm.tsx:34` | product dropdowns |

`sitemap.xml` + `llms.txt` stay build-time → the panel must show a "rebuild needed" hint (see 5.4).

### 2.4 Settings overlay (the biggest piece)

`settings.json` fields → consumers. All already client components except the pages that host them.

| Field | Consumers |
|---|---|
| `contact.phone` | `Drawer.tsx:224`, `StickyEnquiryBar.tsx:11`, `part/page.tsx:67`, `valuesRibbon`, `contact/page.tsx:67`, `enquiry/page.tsx:52`, `EnquirySection.tsx:46` |
| `contact.whatsapp` | `lib/whatsapp.ts:17,89` + every `waLink` consumer; `WhatsAppFAB.tsx` already handles it |
| `contact.email` | `EnquiryFallback.tsx`, `SuccessNext.tsx:26`, `lib/enquiry-submit.ts:46`, `career/page.tsx:87`, contact/enquiry pages |
| `contact.mapsUrl` | `Footer.tsx:84`, `contact/MapLoader.tsx`, `lib/site.ts:146` (`mapsHref`, `isEmbeddableMapsUrl`) |
| `contact.gstin` | contact page, enquiry form |
| `social.*` | `Footer.tsx` |
| `replyTime` | contact/enquiry pages (new micro-label — renders only when set) |
| `hours` + `hoursNote` | **new** opening-hours block on `src/app/contact/page.tsx` (does not exist today) |
| `banner` | `src/app/layout.tsx` — announcement bar above `<Header/>` |

Preserve the existing rules: phone/email/GSTIN rows render **only when set** (`contact/page.tsx:3`,
`SuccessNext.tsx:3`); no blank rows, no WhatsApp CTA on the contact page.

`lib/site.ts:122-156` helpers (`formatAddress`, `telHref`, `mapsHref`) take a `Contact` argument
already — pass the runtime contact in, keep the signature. That is the cleanest seam in the codebase.

### 2.5 Kill the 404 noise

`public/data/` currently ships only `settings.json` (`{"schemaVersion":1}`). Once Wave 0 fetches more
files we would add two more console 404s (the `docs/critique/r2-motion-designer.md:12` complaint
returns). Commit real empty defaults: `careers.json`, `product-overrides.json`, `career-content.json`.
Keep the `*.example.json` files as the documented contract.

### 2.6 Tests

`tests/smoke.spec.ts` + `tests/a11y.spec.ts` are the only suites. Add:

- `tests/runtime.spec.ts` — Playwright `page.route()` stubs for each `/data/*.json`; assert
  (a) runtime value appears, (b) **build-time value shows when the file is 404 / invalid / empty**,
  (c) hidden product disappears from list + mega menu + finder, (d) `null` runtime does not blank
  build-time content, (e) no console errors.
- `tests/a11y.spec.ts` — re-run on `/contact/` and `/career/` after the new hours block and role list.

### 2.7 Verify

```bash
pnpm typecheck && pnpm lint && pnpm build && pnpm test && pnpm test:a11y
php -S localhost:8080 -t out      # panel + api smoke
```

Manual acceptance: panel → Site settings → phone save → reload website → header/drawer/footer show it.
Careers → add role → reload `/career/` → role visible with its description.

---

## 3. Wave 1 — products: full CRUD, images, and the rebuild path

Follows `docs/PROMPT-FINAL.md` P14/P15/P16/P18. Decisions already made there are **not** re-litigated.

### 3.1 Schema — one contract, mirrored exactly

New `public/admin/lib/product-schema.php` mirrors `src/content/types.ts:31-46` field-for-field:

- enums locked: `machine` ∈ `water-cooler | display-counter | deep-freezer`; `material` ∈
  `nylon | hdpe | ppcp | brass | ss`; `group` ∈ `01|02|03|04` or null; price `unit` ∈ `pc|set`;
- `slug` immutable once created, `[a-z0-9]+(-[a-z0-9]+)*`, unique;
- `published` defaults to **false**; archive (never hard-delete) as the destructive action;
- `summary`/`sku`/`hsn`/`moq`/`packing` optional, length-capped;
- validation errors keyed by field name, and the form must **preserve input** on error
  (same contract as `AlokContent::validateRole`, `content.php:235`).

Group copy (`name`, `tagline`, `description`) editable — see D5.

### 3.2 Store — reuse the existing safe writer

New `public/admin/lib/store-products.php` reads/writes `data/products.json` through
**`AlokContent::save()`** (`content.php:38`), which already does atomic writes and keeps the last 15
versions per file in `<data_dir>/history/` — undo comes free. Add a **"Version history"** screen
(`r=history`) listing those backups with a restore button. No SQL needed for JSON stores.

### 3.3 Upload — the highest-risk piece (P16)

New `public/admin/lib/upload.php`. Reuse for CVs with a different allowlist (§4.2).

| Rule | Value |
|---|---|
| Real type check | `finfo` + `getimagesize()`; both must agree |
| Allowlist | jpg, jpeg, png, webp, avif |
| Size | ≤ 4 MB (check `CONTENT_LENGTH` **before** reading, and `UPLOAD_ERR_INI_SIZE` after) |
| Dimensions | ≥ 400 × 400 |
| Filename | fully server-generated: `<slug>-<12 hex>.<ext>`; the client's filename is never used |
| Traversal | reject `..`, `/`, `\`, NUL, leading `.` anywhere in any incoming name |
| Re-encode | GD: load → re-save to strip EXIF, GPS and any appended payload |
| Storage | `<data_dir>/uploads/<yyyy-mm>/` (D6), created 0750, deny-all `.htaccess` |
| Alt text | mandatory, 10–160 chars; a product cannot publish without it |
| `w`/`h` | written into `products.json` from the real decoded size (no CLS on the gallery) |
| Upload dir hardening | PHP execution denied, no directory listing, `.htaccess` written on creation |
| Cleanup | temp/partial files swept; deleting a product offers orphan-file removal |

Add to `config.php.example`: `uploads_enabled` (bool, default true), `max_upload_mb` (default 4).

### 3.4 Admin UI (P17)

New `views/product.php` (create/edit), `views/product_delete.php`, `views/history.php`; rewrite
`views/products.php` from "hide/show snapshot" to a real list with search, sortable columns,
group filter, publish toggle, and a **preview before publish**. `assets/admin.css` changes are
**additive only** — read the existing 16 KB first; no glass, no gradient, no `backdrop-filter`;
keyboard-first (tab order, Enter to save, `/` to focus search).

Delete the hardcoded `lib/catalogue.php` snapshot **after** the real list works — and update
`page_products()` (`index.php:403`) accordingly. Its "20 entries, 17 published" comment must not
outlive the code.

Nav changes in `views/layout.php:29-36`: add an **Applications** tab with an unread count
(reusing `alok_unseen_count()`), and a "Content" grouping so the tab strip does not become unusable.

### 3.5 Frontend — a new product works without a rebuild

- `src/app/products/[group]/[part]/page.tsx:31` → `export const dynamicParams = false;` **must change
  to `true`**, otherwise a runtime-only slug can never render. This is the single most important line
  in Wave 1.
- `generateStaticParams` keeps prerendering everything the build knows (SEO unaffected for existing
  products); a slug it did not generate is resolved client-side from `data/products.json`.
- Build a 404 for a slug that exists in neither → existing `notFound()` path.
- `src/lib/products-search.ts` must index runtime products too, so search finds them.
- Document plainly: a brand-new product is **JS-rendered**. Google sees it after the rebuild (§5.4).
  Old, JS-off visitors see the button but not the new page until then. That is the price of a
  no-Node host, and the panel must say so rather than hide it.

### 3.6 Rebuild path (Wave 4 — the SEO half of "both")

- New `scripts/sync-runtime-content.mjs`: fetch live `/data/*.json` → write
  `src/content/runtime.generated.json` (git-ignored or committed, decision at implementation time);
  `src/content/*.ts` merge it **on top of** the hand-written values so nothing is lost if the fetch
  fails. `pnpm build` then prerenders the current state and `postbuild` regenerates sitemap + llms.txt.
- New `scripts/sync-runtime-content.mjs --check` → non-zero exit when live and build-time disagree
  (for CI).
- New admin screen **Rebuild**: shows the exact command to paste, the list of files that differ since
  the last sync, and — if configured — a **"Trigger rebuild"** button that POSTs a GitHub
  `repository_dispatch` event.
- New `.github/workflows/deploy.yml`: on `repository_dispatch` → install → `sync` → `build` → commit
  the regenerated content → push. **Hostinger's Git integration** (`docs/deploy-hostinger.md:92`,
  Option C) then redeploys. There is **no workflow in the repo today** and no Node on the host, so
  the build can only ever happen in CI or locally. Say this in the Rebuild screen, in one line.
- Needs from the client: repo admin rights + the webhook secret. That is a setup task, not code.

### 3.7 Attack suite (P18) — mandatory before deploy

Run against `php -S localhost:8080 -t out`. Every case must fail **cleanly** (4xx, no file written, no
fatal, no disclosure):

double extension (`a.php.jpg`) · uppercase/mixed extension · oversize · 4 KB bomb · 1×1 image ·
truncated file · null byte in name · `../` traversal · absolute path · zip renamed `.jpg` ·
GIF89a/`<script>` polyglot · EXIF payload · missing CSRF · CSRF from another session ·
foreign Origin · XSS in name/summary/description (must render as text) · SQL string in every field ·
direct fetch of `media.php` with an unknown/removed id · PHP in the upload dir ·
concurrent double-submit. Then confirm the public site and `api/enquiry.php` still work.

---

## 4. Wave 2 (careers content) and Wave 3 (operations)

### 4.1 Wave 2 — Careers culture + teams (the only content screen in scope)

- New `data/career-content.json`: `{schemaVersion:1, culture: string, words: string[3], teams: [{id,name,description}]}`.
- New `views/career_content.php` + `AlokContent::validateCareerContent()` in `content.php` —
  same validators as settings/role. Team ids must be a subset of `ALOK_TEAMS` (`content.php:15`) so
  role validation stays consistent; the panel shows existing teams as fixed cards with editable
  name/description, and add/remove needs a developer.
- Overlay into `src/app/career/page.tsx:85-88, 109-118, 141-148` via `useRuntimeCareerContent()`.
- Empty/`null` culture → keep the built-in text (D3).

### 4.2 Wave 3 — Job applications + CV upload

New **public** attack surface, so it gets the P16 treatment with a different allowlist.

- New `public/api/apply.php` — mirrors `api/enquiry.php`'s defences: Origin/Referer check, honeypot,
  per-IP rate limit, server-side validation, header sanitation, JSON response, CSP header.
  `enquiry.php:16-22` is the checklist.
- Validation mirrors a new `src/lib/application-schema.ts` (zod), same pattern as
  `src/lib/enquiry-schema.ts`.
- New `public/admin/lib/applications.php`: `AlokApplicationsStore` extending the `AlokStore` pattern
  (`core.php:169`) — SQLite `applications.sqlite` + `applications.jsonl` fallback, `AlokFs::withLock`,
  `ipHash`, `audit`. Statuses: `new, reviewing, shortlisted, rejected, hired`.
- CV rules: allowlist **pdf, doc, docx only**; ≤ 5 MB; `<data_dir>/applications/` with a `.bin`
  extension (D7); `is_uploaded_file()` + `UPLOAD_ERR_*` handled; **never** moved with
  `copy()` on an unverified temp path; no text extraction (out of scope — a résumé download is enough).
- Admin screens: `views/applications.php` (list, filter by role/status/date, unread badge),
  `views/application.php` (detail, status, notes, assign, CV download, archive, delete),
  `views/application_delete.php`.
- Public side: `Apply now` per role (`RoleList.tsx`, §2.2) → a form; plus a general
  "send your CV" path when no roles are open, keeping the existing empty state (`career/page.tsx:170-187`).
- Add System check rows: applications endpoint wired, applications dir writable and outside the web root.

### 4.3 Wave 3 — Send from the panel

- New `public/admin/lib/mailer.php` (`AlokMailer`): reads `../api/config.php` creds (same file
  `api/enquiry.php:29-36` uses), sends via the same SMTP path, plain text only.
- On `views/enquiry.php`: **"Send from here"** → an editable draft pre-filled from
  `enquiryLines()` (`src/lib/whatsapp.ts:73`) + `subject` prefilled; result reported; audit action
  `mail_sent` with the recipient and outcome. Failure is shown, never swallowed.
- Rate cap per user per hour; the panel shows the count.
- **Honest limit, written into the UI:** WhatsApp cannot be sent automatically without a Meta Business
  API account. Until then WhatsApp stays a deep link (`wa.me`, §14's primary channel) — one tap in
  their own app. Do not promise automation in the panel.

---

## 5. Cross-cutting work

### 5.1 System screen additions (`index.php:433`)

New rows: GD extension present · uploads dir writable · uploads dir outside web root · `media.php`
allowlist resolves · applications endpoint wired · applications dir writable · last runtime rebuild
sync time and whether live ≠ build-time.

### 5.2 Audit actions to log

`product_create` `product_edit` `product_delete` `product_publish` `product_unpublish` `upload`
`upload_reject` `media_served` (rate-limited, or skip — decide at implementation) `history_restore`
`career_content_save` `application_status` `cv_download` `mail_sent` `rebuild_request`.
Never the CV's contents, never a raw IP (`core.php:208-219`).

### 5.3 Security ruleset — non-negotiable for all waves

CSP allows no inline script/style (`web.php:58`) · CSRF token on **every** POST including login and
logout, plus a same-host Origin/Referer check (`auth.php`) · prepared statements, update columns only
from a fixed whitelist · every output escaped with `e()` · free text as **text nodes, never
`innerHTML`** · strict per-field validation, https-only links (existing `content.php:109`) ·
raw IPs never stored (salted HMAC, 20 hex) · new `$_FILES` handling behind an allowlist + re-encode +
out-of-webroot storage · `.htaccess` denies extended to `lib/` (unchanged) and `data/uploads/`,
`applications/` · every new `lib/*` file keeps the `defined('ALOK_ADMIN') || exit;` guard.

### 5.4 Rebuild staleness indicator

The panel shows, per screen, "last synced to build-time: `<date>`" and marks values that crawlers
cannot see yet. One line, honest, no jargon — this is the thing that otherwise makes the client think
the panel is broken.

### 5.5 Documentation to update (last task of the final wave)

| File | Change |
|---|---|
| `docs/admin-panel.md` | screens table (add Applications, Career content, Rebuild, Version history); JSON contract for `products.json` + `career-content.json`; move product CRUD/upload out of "Intentionally out of scope"; new security bullets for `$_FILES`, `media.php`, `apply.php`; new "Rebuild" section |
| `docs/PROMPT-FINAL.md` / `docs/PROMPT-MASTER.md` | mark P14–P18 done with the shipped file list |
| `docs/qa.md` | overlay test results, attack-suite results, known SEO limits |
| `docs/decisions.md` | ADR-style entries for D1–D9 (static-export overlay, `products.json` as source of truth, out-of-webroot media, CI-only rebuild) |
| `docs/deploy-hostinger.md` | new files that must never be wiped on redeploy: `data/*.json`, `media.php`, `apply.php`, uploads + applications dirs |
| `public/robots.txt` | `Disallow: /admin/`, `Disallow: /data/` (already listed as an open point in `admin-panel.md:83`) |
| `docs/client-questions.md` | close items resolved here; add the new client asks (Meta Business API for WhatsApp send, repo admin rights for the rebuild webhook, who gets which admin account) |

### 5.6 Out of scope — say so in the panel, do not fake it

Change own password (still `config.php` + `hash.php`) · user roles/permissions (all accounts are
equal) · two-factor · bulk actions · storage migration · automated backups (history + CSV only) ·
email/WhatsApp **templates library** · résumé text extraction · price display (client decision:
`site.showPrices = false` stays) · analytics dashboards.

---

## 6. File inventory

### New — frontend
```
src/lib/runtime-schema.ts
src/lib/runtime-data.ts                        (rewrite)
src/components/runtime/RuntimeProvider.tsx
src/components/runtime/useRuntime.ts
src/components/career/RoleList.tsx
src/components/career/OpeningHours.tsx
src/components/runtime/ProductListOverlay.tsx
src/lib/application-schema.ts
src/components/career/ApplyForm.tsx
```

### New — scripts / CI
```
scripts/sync-runtime-content.mjs
.github/workflows/deploy.yml
public/data/careers.json            (empty default, commit)
public/data/product-overrides.json  (empty default, commit)
public/data/career-content.json     (empty default, commit)
tests/runtime.spec.ts
```

### New — admin
```
public/admin/lib/product-schema.php
public/admin/lib/store-products.php
public/admin/lib/upload.php
public/admin/lib/mailer.php
public/admin/lib/applications.php
public/admin/lib/views/product.php
public/admin/lib/views/product_delete.php
public/admin/lib/views/history.php
public/admin/lib/views/applications.php
public/admin/lib/views/application.php
public/admin/lib/views/application_delete.php
public/admin/lib/views/application_cv.php    (authenticated CV stream)
public/admin/lib/views/career_content.php
public/admin/lib/views/rebuild.php
```

### New — public endpoints
```
public/api/media.php               (allowlisted product image stream)
public/api/apply.php               (job application + CV)
```

### Modified
```
src/app/layout.tsx                 RuntimeProvider + announcement banner
src/app/career/page.tsx            client sections for roles / culture / teams / apply
src/app/contact/page.tsx           runtime contact + new opening-hours block
src/app/enquiry/page.tsx           runtime contact
src/app/products/page.tsx          runtime products + hidden filter
src/app/products/[group]/page.tsx  same
src/app/products/[group]/[part]/page.tsx   dynamicParams=true, runtime resolution, runtime phone
src/components/layout/{Header,Drawer,NavMegaPanel}.tsx
src/components/products/{PartFinder,ProductGallery}.tsx
src/components/sections/{Footer,EnquirySection,ProductGroups,FaqSection,AboutIntro,
                         PanIndiaMap,ProofStrip,IndustriesBento,ValuesRibbon,WhatsAppFAB}.tsx
src/components/forms/{ShortEnquiryForm,FullEnquiryForm,EnquiryFallback,SuccessNext}.tsx
src/components/products/StickyEnquiryBar.tsx
src/components/contact/{MapLoader,NotFoundFinder}.tsx
src/lib/{whatsapp,seo,products-search,enquiry-submit}.ts   (accept a runtime contact/product list)
src/content/products.ts            becomes the build-time snapshot (§3.6)
public/admin/index.php             new routes in the $routes map + page_* functions
public/admin/lib/content.php       career-content validators
public/admin/lib/views/layout.php  nav groups + Applications count
public/admin/lib/views/{products,careers,role,system,enquiry}.php
public/admin/assets/admin.css      additive only
public/admin/config.php.example    uploads_enabled, max_upload_mb, rebuild_webhook
public/robots.txt                  Disallow /admin/ + /data/
```

### Untouched on purpose
`src/content/types.ts` (the schema is the contract) · `public/admin/lib/auth.php` (the security model
is already right) · the enquiry pipeline (`api/enquiry.php` storage path) · anything under `src/art/`.

---

## 7. Wave order, gates and dependencies

Section → wave map: §2 = Wave 0 · §3.1–3.5 + 3.7 = Wave 1 · §4.1 = Wave 2 · §4.2–4.3 = Wave 3 ·
§3.6 = Wave 4 (it is written inside the products section because it consumes `products.json`, but it
ships last). §5 is cross-cutting.

| Wave | Depends on | Gate before moving on |
|---|---|---|
| **0** wiring | — | typecheck, lint, build, Playwright (incl. fallback cases), a11y, manual panel→site check |
| **1** products | 0 (`products.json` reader + provider) | **P18 attack suite green** before any upload is enabled in production |
| **2** careers content | 0 | typecheck + overlay tests |
| **3** operations | 1 (`upload.php` exists) | CV attack cases green; `apply.php` abuse cases green; mailer failure path tested |
| **4** rebuild + CI | 1, 2 | `--check` disagrees → build must fail loudly; manual end-to-end deploy test |

Suggested: 0 → 2 (cheap, quick win) → 1 → 3 → 4.

## 8. Open questions for the client

1. **Rebuild webhook** — repo admin rights + a GitHub token to create the workflow, or should the
   Rebuild screen stay copy-paste-only? (§3.6)
2. **WhatsApp send** — is a Meta Business API number planned? Until yes, deep link only. (§4.3)
3. **Admin accounts** — who gets an account, and display names (they appear in "assigned to" and the
   audit log)? (`admin-panel.md:82` still open)
4. **`enquiry.php` CC** — the enquirer is still CC'd, which lets anyone make the site email a third
   party. Remove? (`admin-panel.md:81`)
5. **CV retention** — delete rejected applications after N days, or keep until manual deletion?
6. **Prices** — `showPrices` is `false` and product CRUD will collect prices anyway. Store and hide, or
   do not collect them in the panel at all?

## Runtime product edits and SEO (public site)

The site reads `/data/products.json` (validated in `src/lib/runtime-schema.ts`) and overlays non-empty values onto build-time products after hydration: name, summary, description, material, sku/hsn/moq/packing and images (only `/api/media.php?id=<[a-z0-9_-]+>`). `ProductSeoRuntime` also sets `document.title`, meta description, og:/twitter: tags and the Product JSON-LD from `seoTitle`/`seoDescription`. Limit: the site is a static export, so crawlers and link-preview bots that do not run JavaScript keep seeing the build-time tags and JSON-LD; edits are visible to browsers and JS-rendering crawlers only. Sitemap, llms.txt and the product pages' HTML change only on rebuild.
