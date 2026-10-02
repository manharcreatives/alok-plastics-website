# PROMPT — TASK 2: Working Admin Panel with Product Management

> **How to use:** paste this file to Claude Code as a separate task, after Task 1's cycle 1
> (or independently — they touch disjoint files). Sections marked `STATE` persist across runs.

---

## 0. READ FIRST, IN THIS ORDER

| # | File | Why |
|---|---|---|
| 1 | `docs/MASTER_PROMPT.md` | §19 honesty rule is absolute. §6 product taxonomy is LOCKED. |
| 2 | `docs/PROMPT-STATE-ADMIN.md` | **STATE** — cycle count, open bugs, decisions. Read at start, update at end. |
| 3 | `docs/admin-panel.md` | The current panel's full spec. What exists, what is deliberately out of scope. |
| 4 | `docs/decisions.md` | ADR-001 (static export + PHP) is the architectural reason this panel is PHP. Do not relitigate. |
| 5 | `docs/client-questions.md` | Which product fields are genuinely missing vs inventable |

Then reply in **at most 6 lines** — no code yet: what you will change, how you will slice it, your agent waves, the one decision you would argue about, your least-sure risk, and anything you need from me. **Then start. Do not wait for my reply.**

---

## 1. THE MISSION

Today the admin panel works for **enquiries** and is a dead end for products. The Products screen (`public/admin/lib/views/products.php`) is 1,951 bytes and can only **hide or show** 19 names from a hardcoded PHP array (`public/admin/lib/catalogue.php`). Its own copy admits it:

> *"Adding, renaming, or properly removing a product means editing the product content and rebuilding the website; ask your developer."*

**That is the thing to kill.** The client is a manufacturer. New parts land constantly — a new jalli size, a new bracket, a discontinued lock. Right now the developer is the bottleneck for a 5-minute task.

### The definition of done

The client sits down, opens `/admin/`, and does this **without touching code, without a developer, without waiting for a rebuild:**

1. **Add a product** — name, group, material, variants with sizes and prices, machine compatibility, description, "best used for" guidance, and **a photo**.
2. **Edit** any of it later.
3. **Hide / show / archive / delete**.
4. See it **live on the website** within seconds.
5. **Upload an image** from their desktop or phone camera.

If a new product takes more than 60 seconds and one browser refresh, this task has failed.

---

## 2. CURRENT STATE — don't rediscover, verify then extend

### What already works (do not rebuild)

| Piece | File | Note |
|---|---|---|
| Auth, sessions, CSRF, throttle | `public/admin/lib/auth.php` (9,015 B) | Argon2id/bcrypt, HttpOnly+SameSite=Strict, 5-try/15-min lockout |
| SQLite/JSONL store | `public/admin/lib/core.php` (21,304 B) | PDO SQLite with file-locked JSONL fallback |
| Enquiry pipeline | `views/enquiries.php`, `enquiry.php`, `enquiry_delete.php` | Filters, search, pagination, CSV export, status, notes |
| Settings writer | `lib/content.php` → `saveSettings()` | Writes `data/settings.json` |
| Roles writer | `lib/content.php` → `saveRoles()` | Writes `data/careers.json` |
| Visibility toggle | `lib/content.php` → `saveHidden()` | Writes `data/product-overrides.json` |
| Validation | `lib/content.php` → `validateSettings()`, `validateRole()` | Follow this pattern exactly for products |
| Dashboard | `views/dashboard.php` | Add a product row, don't rebuild |
| System check | `views/system.php` | Writable-folder detection — extend it for the upload dir |
| Security headers, `.htaccess` denies | `views/layout.php`, `.htaccess` | **Do not weaken one line** |

### What is missing — the actual work

| # | Gap | Evidence |
|---|---|---|
| A | **No product create/edit form** | `views/` has `role.php`, `enquiry.php` — no `product.php` |
| B | **No image upload** | grep `$_FILES` across `public/admin/` → **zero hits** |
| C | **Product list is a static array** | `lib/catalogue.php` — 19 hardcoded `[slug, name, published]` tuples, snapshot 2026-10-01 |
| D | **Frontend cannot read new products** | `src/lib/runtime-data.ts` only fetches `settings` \| `careers` \| `product-overrides` |
| E | **Static export bakes routes at build** | `next.config.ts` `output: 'export'` + `generateStaticParams` → a brand-new slug has **no page** until rebuild |
| F | **No product store on disk** | `data/` holds only `*.example.json` — no `products.json` |

**Gap E is the hard one and it changes the architecture.** Static export means a new product page cannot exist without a rebuild. Solve it in the design phase — do not discover it mid-build.

---

## 3. ARCHITECTURE DECISION — solve this first

Three routes. **Recommend, then justify.**

### Option A — `products.json` + client-side dynamic route 🔴 RECOMMENDED

Admin writes `data/products.json`. A single catch-all client route renders any product from it. Existing static pages keep their build-time data and get overlaid at hydration.

- **Gain:** new product live in seconds, no rebuild, no hosting change, matches the existing `settings.json` pattern exactly.
- **Cost:** one dynamic catch-all route; per-product SEO needs care.
- **SEO cost — must be honest about this:** prerendered HTML, `sitemap.xml`, `llms.txt` and crawlers see **only build-time** products. A new product is not indexable until a rebuild. Mitigate: every product appears in `/products` and its group page (which *are* static and get a runtime overlay), so crawl depth stays 1–2. Log this limitation in `docs/decisions.md` and in the panel's own help text — **do not hide it from the client.**

### Option B — per-product files under `data/products/<slug>.json`

Same runtime layer, but many small files, fetched on demand. Better for very large catalogues and per-product caching. Worse admin ergonomics (many writes, more failure modes) and needs slug-keyed validation everywhere.

### Option C — abandon static export, move to a Node runtime

Enables server actions, a real DB, ISR. **Reject.** ADR-001 locked static export because Hostinger Premium has no Node.js. This would require a hosting change and rewrite `enquiry.php` and the whole admin panel. Enormous cost for a benefit the client does not need.

**My recommendation: Option A.** Record it as an ADR with the SEO limitation stated plainly. If you disagree and can solve the SEO indexing problem cheaply, argue it — that is a legitimate call.

---

## 4. THE PRODUCT MODEL

Mirror `src/content/types.ts` exactly. The admin writes the **same shape** the frontend already understands, so there is one contract, not two.

```ts
{
  slug: string,              // kebab-case, unique, immutable once created
  name: string,
  groupId: string,           // must match an existing group in products.ts
  published: boolean,
  material?: string,         // NYLON | HDPE | PPCP | BRASS | SS | …
  summary?: string,          // one line, max ~90 chars — the "What it does"
  description?: string,      // plain text, paragraphs allowed. NEVER innerHTML
  bestUse?: string,          // "Best used for" — the buying guidance. This is the
                             // field the client's customers actually need
  variants?: {
    label: string,           // 'RS 60', '3 Inch', 'Light'
    note?: string,           // '11" x 11"'
    price?: number,
    unit?: 'pc' | 'set'
  }[],
  machine?: string[],        // from the FIXED machine list — never free text
  images?: string[],         // '/data/uploads/<file>'
  createdAt: number,
  updatedAt: number
}
```

### Field rules — non-negotiable

- **`bestUse` is not a copy field.** It is the one thing a workshop buyer scans first. Write guidance, not marketing: *"Fits 11"×11" and 14"×14" jalli cut-outs on display-counter cabinets."* Never *"high-quality durable solution."*
- **`machine` is a fixed enum**, not free text. Current set: `display-counter`, `water-cooler`, `deep-freezer`. A free-text field produces `Deep Freezer` / `deep freezer` / `DF` and breaks the filter. Enforce server-side.
- **`groupId` must exist** in `products.ts`. Block the save and list the valid ids.
- **`slug` is immutable** after creation. Show it, never edit it — changing it breaks inbound links. If a name changes, the slug stays and the old URL keeps working.
- **`summary` max ~90 chars.** It renders in `PartCard` at small sizes. Enforce; truncate visibly if over.
- **Prices are stored, not displayed** while `site.showPrices === false` (§6.4). Store them anyway — the client asked. Toggle display from the panel.
- **No `innerHTML`.** Ever. `description` and `bestUse` render as text nodes. This is already a stated rule in `docs/admin-panel.md:45` for roles — extend it to products.

---

## 5. IMAGE UPLOAD — build this properly or not at all

This is the highest-risk part. `$_FILES` appears nowhere in the codebase, so there is **no precedent to copy** and no existing hardening to inherit. You are writing new attack surface.

### Required

| Control | Requirement |
|---|---|
| **Storage** | `data/uploads/` — **outside** the product JSON, inside the folder already `.htaccess`-protected. Confirm the path resolves with the System check |
| **Validation — server side, always** | MIME via `finfo`/`getimagesize` (never trust `$_FILES['type']`) · extension allowlist `jpg/jpeg/png/webp/avif` · max 4 MB · min 400×400 px · reject anything with a PHP/HTML payload signature |
| **Re-encode, never store raw** | `imagecreatefrom*` → `imagejpeg`/`imagewebp` at quality 82, max dimension 1600 px. **This defeats polyglot and embedded-payload attacks.** Never `move_uploaded_file` the client file straight to disk |
| **Filename** | Fully server-generated: `slug` + random hex + extension. **Never trust `$_FILES['name']`** — it is attacker-controlled and is the classic path-traversal vector |
| **Path traversal** | Reject any name containing `..`, `/`, `\`, null bytes |
| **Upload dir hardening** | Ship a deny-PHP `.htaccess` in `data/uploads/` (`<FilesMatch "\.(php\|phtml\|phar\|cgi\|pl)$">Require all denied`) — mirrors the existing `public/data/.htaccess` pattern |
| **CSRF** | Token on the upload POST. Already in `auth.php` |
| **Delete on failure** | If validation or re-encode fails, unlink the partial file. No orphans |
| **Orphan sweep** | Deleting a product must offer to delete its images, or list them as orphaned in System check |
| **Alt text** | Required field. A decorative alt is an a11y failure and `axe` will catch it. Force the client to describe the part — *"Ventilation jalli, square grille, 14 inch"* |

### Display rules

- Below-fold → `loading="lazy"`. Always explicit `width`/`height` (CLS gate).
- **Never** next/image runtime optimizer — `output: 'export'` means it cannot run. Pre-optimize to WebP/AVIF in PHP or ship as-is at ≤1600 px.
- Product cards use a **fixed aspect box** so a portrait photo cannot break the grid.
- Missing image → the existing `PartSheetArt` schematic + `TODO(client)`. **Never a grey placeholder box with a broken-image glyph.**

---

## 6. THE ADMIN UI — same discipline as the site

The panel is where the client does their actual work. It is a tool, and tools earn trust through clarity.

- **Match the existing house style.** `admin.css` (16,319 B) and `admin.js` (1,493 B) already define the look. **Read them before writing a line of new CSS.** Consistency is a feature here — the client learns one system.
- **Form conventions from `role.php` and `settings.php`:** label above field · help text under · error beside the field · required marked · server errors re-render with values preserved (**never lose a client's typed work on a validation error** — this is the single most important UX rule in the panel).
- **Sticky save bar** with unsaved-changes indicator.
- **Two-step delete** — the existing `enquiry_delete.php` is the precedent. Match it exactly.
- **Preview** before publish: show the card as it will appear on the site. Prevents "I saved it and it looks wrong."
- **Keyboard-first.** These are data-entry screens used all day. Tab order, Enter to save, `/` to focus search.
- **No `backdrop-filter`, no glass, no gradient.** The site is the brand showpiece. The panel is an instrument.
- **A11y is the same floor:** labelled inputs, `aria-invalid` + `aria-describedby` on errors, visible focus, ≥44 px targets, real `<fieldset>`/`<legend>`, and **no keyboard trap** in any dialog.
- **Every table column sortable, every list searchable.** The client has 19 products today and 200 next year.

---

## 7. HOW TO WORK — AGENT-WISE

You are the **Orchestrator**. Plan, delegate, integrate, judge.

### Agents to recreate (`.claude/agents/` is empty and gitignored)

| Agent | Owns | Job |
|---|---|---|
| `product-store` | `public/admin/lib/store-products.php`, `public/admin/lib/product-schema.php` | Validate + read/write `data/products.json`, slug rules, enum enforcement |
| `product-upload` | `public/admin/lib/upload.php`, `data/uploads/.htaccess`, `data/uploads/**` | Re-encode pipeline, MIME/px/size validation, hardened dir |
| `product-admin-ui` | `public/admin/lib/views/product.php`, `product_delete.php`, `products.php`, `admin.css` (additive only) | List + create + edit + preview screens |
| `product-runtime` | `src/lib/runtime-data.ts`, new dynamic route, `src/components/products/PartCard.tsx`, `PartFinder.tsx`, `ProductGallery.tsx` | Fetch + overlay + render new products live |
| `qa-auditor` *(read-only)* | `tests/**`, `docs/qa.md` | Upload abuse cases, a11y, CSV/JSON integrity, overlay regression |

### Rules

- **Up to 4 per wave**, parallel **only across disjoint ownership.**
- **`product-store` ships before `product-admin-ui`.** Contracts first — the UI imports a validator that must already exist.
- **`product-upload` is isolated on purpose.** It is the only agent touching raw request data. It gets the strictest brief.
- **Never** weaken a line of `admin.css`, `auth.php` or `.htaccess` to make a new screen work. If they conflict, fix the conflict honestly and say so.
- **Never** invent a product. A test product you add must be obviously a test and removable — or better, add **no** seed product and let the client create the first real one.
- **Never** change `enquiry.php` or the enquiry pipeline. That works.
- Log every report in `docs/agent-log.md`. Write ADRs to `docs/decisions.md`.

---

## 8. THE REVIEW LOOP — EVERY CYCLE

```
PLAN → BUILD → VERIFY → ATTACK → CRITIQUE → FIX → RE-VERIFY → REPEAT
```

1. **PLAN** — restate the change, list exact files, map each to its rule.
2. **BUILD** — via agents.
3. **VERIFY** — all green or it does not ship:
   ```
   pnpm typecheck
   pnpm lint
   pnpm build
   pnpm check:seo
   ```
   Plus, because this task touches PHP: load every touched admin screen and confirm **no PHP notice/warning** in the output. Warnings are failures here.
4. **ATTACK** — for any upload or input path, actually try to break it. `php -S localhost:8080 -t public/admin`, then attempt:
   - `evil.php.jpg` renamed, and a `.php` double extension
   - a 6 MB file
   - a 100×100 px image
   - a file with `%00` in the name
   - a polyglot: valid JPEG header + appended PHP
   - CSRF token omitted, and a token from another session
   - `groupId: "../../etc"`, `machine: "<script>"`, `slug: "../evil"`
   - `description` containing `<script>alert(1)</script>` — **must render as visible text, never execute**
   - a POST with no session cookie
   Every one must fail cleanly with a message. **Paste the actual results into the loop log.**
5. **CRITIQUE** — screenshot the admin screens and review them as a **tool**: is the primary action obvious? can the client complete a task without reading instructions? is any typed work ever lost? Score 1–10 on clarity, density, keyboard flow, error recovery. Tag CRITICAL / MAJOR / MINOR.
6. **FIX** — back to the owning agent with the rule and evidence.
7. **RE-VERIFY** — the **full** list, including the attack suite and a check that the enquiry pipeline and the public site still work. **This task must not break the working panel.**
8. **REPEAT** — until zero CRITICAL and no MAJOR on security or a11y. **Hard cap 5.** If a CRITICAL survives, stop, document, ask me.

### Severity

- **CRITICAL** — auth bypass · CSRF hole · arbitrary file write · stored XSS · SQL injection · path traversal · loses the client's typed input · breaks the existing enquiry pipeline or the public site · any PHP warning · typecheck/lint/build fail.
- **MAJOR** — a required field missing · no way to undo an action · no preview · keyboard trap · client cannot finish a task unaided.
- **MINOR** — wording, ordering, density.

**Never lower the bar to make a loop pass.** Never weaken a security control to make a feature work — say so and leave it flagged instead.

---

## 9. THE STANDING BAR

### Security — non-negotiable, existing model preserved
- Passwords: `password_hash` (Argon2id, else bcrypt cost 12). **No default account.** With no valid hash the panel shows setup only.
- Sessions: `HttpOnly`, `SameSite=Strict`, `Secure` on HTTPS, cookie scoped to `/admin/`, ID regenerated at login. 30 min idle / 12 h absolute.
- CSRF token on **every** POST, plus same-host Origin/Referer check.
- Brute force: 5 failures per IP **and** per username → 15 min lock.
- All SQL via prepared statements; update columns from a **fixed whitelist**; all output HTML-escaped.
- **Raw IPs never stored** — salted HMAC, 20 hex chars.
- Headers unchanged: CSP `default-src 'none'; script-src 'self'; style-src 'self'` (**no inline script or style — this means no inline event handlers in new templates**), `X-Frame-Options: DENY`, `nosniff`, `Referrer-Policy: same-origin`, `X-Robots-Tag: noindex`, `no-store`, HSTS on HTTPS.
- `.htaccess` keeps denying `config*.php`, `*.sqlite|jsonl|lock|bak|tmp|log`, and all of `lib/`.
- Every `lib/*` file keeps its "exit if requested outside the app" guard.

### Honesty — §19, absolute
- **Never** pre-fill a product with invented specs, prices or materials. Empty is a valid state.
- The client is the source of truth for what a part is. Your job is to capture it, not to supply it.
- If a field is unknown, leave it blank and let the site render an honest empty state. **A product with three known fields and four blanks beats a product with seven invented ones.**

### A11y — WCAG 2.2 AA, same floor as the site
Labelled inputs · `aria-invalid` + `aria-describedby` on errors · visible 2 px burgundy focus ring · real `<fieldset>`/`<legend>` · ≥44 px targets · sortable tables with `aria-sort` · no keyboard trap · **axe zero serious/critical on every touched screen**.

### Performance
The panel is opened on a phone, often on mobile data, by someone who wants one number changed. **Target < 400 KB on the products list.** Lazy-load image previews. Virtualise if the catalogue passes 200 items. The public site's 170 KB budget does not apply here, but the instinct does.

---

## 10. WHAT I NEED FROM THE CLIENT

Bundle these into **one** question with your recommendation attached. Do not drip-feed.

| # | Question | Recommendation |
|---|---|---|
| 1 | Admin login — how many people, and what names? | Start with one owner account. `admin-panel.md:82` says the `'owner'` names are placeholders |
| 2 | May list prices be shown publicly? | **No.** Keep `site.showPrices = false`; store prices, show "Get a quote". §6.4 |
| 3 | Is `bestUse` the right field name, or should it be "Best suited for" / "Application"? | `bestUse` — matches the brief you gave me |
| 4 | Which of the 4 product groups do new products belong to? | Confirm the group ids; block anything else |
| 5 | Do they want product **create** live, or create-for-approval-then-publish? | Recommend: create saved as `published: false` by default, one click to publish. Prevents a half-typed product going live |
| 6 | Should deleting a product delete it, or archive it? | **Archive.** Reversible. `enquiry_delete.php` sets the precedent for a two-step confirm |

**Still genuinely blocked on the client** (do not fake): email · GSTIN · Google Maps URL · logo vector master · hero video & poster · testimonials · GA4 ID · social URLs · legal text · reply time.

**Phone and WhatsApp are NOT blocked** — `public/catalogue/spares/catalogue.txt` has **`+91 7479497003`** (21 occurrences) and `9915745414`. These are also writable from the panel's existing Site Settings screen once `data/settings.json` exists.

---

## 11. STATE — `docs/PROMPT-STATE-ADMIN.md` 🔄 LOOP MEMORY

**Read at the start of every cycle. Update at the end. This is what makes each cycle better than the last.**

```markdown
# Alok Plastics — Admin Panel Loop State

## Cycle
current: <n>
stop_condition: zero CRITICAL · no MAJOR on security/a11y · cap 5

## Architecture
decision:            <Option A / B / C>
adr:                <ADR-n>
seo_limitation:     <what crawlers still cannot see — stated plainly>
approved_by_client: <yes/no>

## Prerequisite ledger
| # | Item | Status | Evidence |
|---|------|--------|----------|
| P1 | products.json store + validator | TODO | |
| P2 | Hardened upload pipeline | TODO | |
| P3 | Product CRUD screens | TODO | |
| P4 | Frontend runtime overlay + dynamic route | TODO | |
| P5 | Attack suite all-fail | TODO | |
| P6 | Enquiry pipeline unregressed | TODO | |

## Backlog
| ID | Screen · Field | Issue | Severity | Fix | Owner | Status |
|----|----------------|-------|----------|-----|-------|--------|

## Attack results                  # paste real output, not intentions
| Vector | Expected | Actual | Pass |
|--------|----------|--------|------|

## Protected                        # do not "improve" — the client depends on these
- <element> — <why>

## Rejected approaches
- <approach> — rejected because <reason> (ADR-n)

## Open questions for the client
- <one line each>
```

---

## 12. ABSOLUTE RULES — NEVER BREAK

1. **§19 Honesty** — never invent a product, spec, price, material or certification.
2. **Never weaken security** to make a feature work. No inline `<script>` or `style` (the CSP forbids both).
3. **Never break the working enquiry pipeline.** It works. Leave it alone.
4. **Never store a client-uploaded file without re-encoding it.**
5. **Never trust `$_FILES['name']`, `$_FILES['type']`, or any client-supplied filename.**
6. **Never use `innerHTML`** for admin-authored content.
7. **Never lose typed input** on a validation error.
8. **Never delete on a single click** — two-step, always.
9. **Never deploy, `git push`, install global tools, or delete `data/`, `admin/config.php`** without asking. (`admin-panel.md:22` — re-uploads must never clobber these.)
10. **`slug` is immutable** after creation.