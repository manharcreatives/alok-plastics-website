# Admin panel (`/admin/`)

A self-contained PHP app with a custom look that follows the public site (burgundy, Archivo/Inter/JetBrains Mono fonts self-hosted in `assets/fonts/`, sidebar navigation on desktop, bottom tab bar on phones). Shared component classes are listed at the top of `assets/admin.css`; `page_head()` and `icon()` in `lib/web.php` build headers and icons. The Site settings and System check screens were removed; `data/settings.json`, if present, is only read by the public site.

A self-contained PHP app for Hostinger Premium (static files + PHP only). No Node, no Composer, no build step, no database server. Source lives in `public/admin/`; `pnpm build` copies it to `out/admin/` untouched.

## What it does

| Screen | Purpose |
|---|---|
| Dashboard | New / unread / this week / this month counts, 30-day bar chart (inline SVG), status pipeline, most requested products, buyer-type split, latest enquiries. Warns when an email notification failed. |
| Enquiries | Every valid website submission, also stored by `api/enquiry.php`. Filters (status, buyer type, product, date range, active/archived), search, sortable columns, pagination, unread marker (unread count shown on the nav tab). CSV export honours the current filters (UTF-8 with BOM for Excel; formula-injection safe). |
| Enquiry detail | All fields, source page, one-tap Call / WhatsApp (`wa.me`) / Email with a greeting prefilled, status (new, contacted, quoted, won, lost), assign to a person, internal notes log, archive/restore, delete (separate confirm page). |
| Open roles | Add/edit/hide/delete roles for the Careers page. Writes `data/careers.json`. |
| Products | Product manager: every product (published or not) with search/group filter; per product edit name, summary, long description, specs (material, SKU, HSN, MOQ, packing), SEO title + meta description (live counters and Google-style preview) and images (upload, alt text, reorder, delete, first = main). Each field shows the build-time default; empty = default; "Reset all to default" per product. Hide/show still writes `data/product-overrides.json`; edits write `data/products.json`. Also per product: price (INR, optional), availability (In stock / Out of stock / On request, default), stock, keywords, brand, featured, status (Active / Inactive / Archived). The list has search (name, SKU, group, keyword, brand), filters (group, status, availability, hidden, edited), sorting (name, recently edited, price), a "Needs attention" filter (no image / no price / no description) and a bulk quick-edit of price, availability and status for every listed row in one save (plain form POST, works without JavaScript). |
| Activity log | Sign-ins, failed/blocked sign-ins, status changes, notes, exports, deletes, product and role changes (anonymous IP code only). |

Nothing is pre-filled with invented values: every setting starts empty and the site must fall back to what is built into `src/content/*.ts`.

## Setup on Hostinger

1. `pnpm build`, then upload `out/` to `public_html/` as usual (this includes `admin/`, `api/`, `data/`). **Never delete `public_html/data/`, `public_html/admin/config.php` or the private data folder when re-uploading** (see "Redeploying").
2. Make a password hash. Preferred: on your own computer with PHP, `php public/admin/hash.php` (asks twice, 12+ characters). Fallback without PHP: open `https://yoursite/admin/hash.php` once; it only prints a hash, never saves anything, and answers 404 as soon as a real `config.php` exists. Delete `hash.php` from the server afterwards.
3. In `public_html/admin/` copy `config.php.example` to `config.php` (File Manager), paste the hash for each user. Add one block per person (the display name appears in notes and "assigned to").
4. Recommended: create a folder **above** `public_html` (for example `/home/uXXXX/alok-private`) and set `'data_dir'` to its absolute path in `config.php`. Enquiries, audit log, sessions and login counters live there, unreachable from the web. If you skip this, they go to `admin/data/` protected by `.htaccess`.
5. Make sure `public_html/data/` exists and is writable by PHP (normally yes; permissions 755 for folders, 644 for files, and `config.php` 640 if Hostinger allows).
6. Visit `https://yoursite/admin/` and sign in.
7. Submit a test enquiry from the site; it appears in Enquiries. If the email did not arrive but the enquiry is in the inbox, the record is flagged "email notification failed" and the Dashboard warns; fix SMTP/mail in `api/config.php` (see `deploy-hostinger.md`).

PHP 8.0+ required (8.1/8.2 recommended). Storage uses SQLite through PDO when available (`enquiries.sqlite`), otherwise JSON lines (`enquiries.jsonl`) with file locking. The choice is sticky: if `enquiries.jsonl` already exists it keeps being used. There is no automatic migration between the two.

### Redeploying

`out/` contains no `config.php` and no `data/settings.json` (only `*.example.json`), so a normal upload will not overwrite them. Do not use a "delete everything first" step; keep `admin/config.php`, `admin/data/` (if used) and `data/*.json`. Take a backup of the private data folder (download `enquiries.sqlite`/`.jsonl`) now and then; CSV export is the other backup.

## Security model

- Passwords: `password_hash` (Argon2id if the host has it, else bcrypt cost 12). No default account; with no valid hash the panel only shows a setup page.
- Sessions: `HttpOnly`, `SameSite=Strict`, `Secure` on HTTPS, cookie scoped to `/admin/`, strict mode, ID regenerated at login, session files kept in the private data folder. 30 minutes idle and 12 hours absolute limits (configurable).
- CSRF: per-session token on **every** POST (including login and logout) plus same-host Origin/Referer check. Exports are read-only GET.
- Brute force: 5 failed attempts per IP and per username locks that key for 15 minutes (configurable); constant-ish timing for unknown users. Trade-off: someone who knows the username can lock the owner out for 15 minutes; waiting or deleting `throttle.json` in the data folder clears it.
- Data: prepared statements only (PDO); column names for updates come from a fixed whitelist; all output HTML-escaped; strict validation of every settings/role field (https-only links, GSTIN/phone/email formats, time ranges); enquiry input is tag-stripped and control characters removed on arrival. Raw IPs are never stored (salted HMAC, 20 hex chars).
- Headers: CSP `default-src 'none'; script-src 'self'; style-src 'self'` (no inline script or style anywhere), `X-Frame-Options: DENY`, `nosniff`, `Referrer-Policy: same-origin`, `X-Robots-Tag: noindex`, `no-store`, HSTS on HTTPS. Page also has `<meta name="robots" content="noindex">`.
- Files: `.htaccess` denies `config*.php`, `*.sqlite|jsonl|lock|bak|tmp|log`, and the whole `lib/` folder; every `lib/*` file also exits if requested outside the app; the data folder gets its own deny-all `.htaccess`. LiteSpeed (Hostinger) honours these. Confirm after deploy: `https://yoursite/admin/config.php` and `/admin/lib/core.php` must show nothing useful (403/blank), and `/admin/data/…` must be 403/404.
- Public JSON written by the panel is strictly public content. Role descriptions are plain text; **render with text nodes, never `innerHTML`**.

## Public JSON contract (frontend hook)

All three files are served as `/data/<name>.json`, `Cache-Control: no-cache`, and may be missing (404) until the owner first saves; the site must work without them. Examples: `public/data/*.example.json`.

`settings.json` (v1): `contact.{phone,whatsapp,email,mapsUrl,gstin}` (string or null; `whatsapp` is digits with country code, ready for `wa.me/<n>`), `social.{instagram,linkedin,facebook,youtube}` (https URL or null), `replyTime` (string or null), `hours.{mon..sun}.{closed:boolean,open:"HH:MM"|null,close:"HH:MM"|null}` (both null and `closed:false` = unpublished, show nothing for that day), `hoursNote`, `banner.{enabled,text,href}` (`href` is `https://…`, a `/path/`, or null), `updatedAt`.

`careers.json` (v1): `roles[]` of `{id,title,team,type,location,description,active,createdAt,updatedAt}`. `team` ids match `career.ts` (`product-development`, `sales`, `social-media-marketing`, `tech-developers`); `type` is `full-time|part-time|contract|internship`. Map `active` to `CareerRole.published`. Show only `active:true`.

`product-overrides.json` (v1): `{hidden: string[]}` of product slugs to drop from lists/menus.

**Hook to implement in `src/lib` (orchestrator; not written by this agent):**

```ts
// src/lib/runtime-data.ts  (client-only)
export async function fetchRuntime<T>(name: 'settings' | 'careers' | 'product-overrides'): Promise<T | null> {
  try {
    const r = await fetch(`/data/${name}.json`, { cache: 'no-cache' });
    if (!r.ok || !(r.headers.get('content-type') ?? '').includes('json')) return null; // static hosts may answer 200 with an HTML shell
    const j = await r.json();
    return j && j.schemaVersion === 1 ? (j as T) : null;
  } catch { return null; }
}
```

Rules for consumers: (1) always render the build-time value from `site.ts` first, then overlay a non-null runtime value after hydration (null/empty never overrides); (2) validate shapes again before use (treat the file as untrusted text); (3) never inject as HTML; (4) fetch once per page load and cache in module scope; (5) banner and hours render only when present. Limits to state plainly: prerendered HTML, JSON-LD, `llms.txt` and crawlers see only the build-time values, so a new phone number or address still needs a rebuild to be indexed. The runtime layer is for fast, no-rebuild edits (banner, hours, links, open roles).

## Product data and images

`data/products.json` (v1, public): `{schemaVersion, updatedAt, products:{<slug>:{name?, summary?, description?, material?, sku?, hsn?, moq?, packing?, seoTitle?, seoDescription?, images:[{id,url:"/api/media.php?id=<id>",alt}], updatedAt}}}`. Commerce keys (all optional): `price` (number 0..9999999, INR), `availability` (`in-stock|out-of-stock|on-request`), `stock` (integer 0..100000), `keywords` (string[], max 20, each <= 40 chars, lowercase, deduped), `brand` (<= 60), `featured` (true only), `status` (`active|inactive|archived`). The build-time catalogue has no price or stock, so an unset price means the website shows "Price on request" and unset availability means "On request". Inactive/Archived products are removed from website lists, search and menus; the page shows "no longer available". "Reset all to default" removes these keys too. Only keys the owner set are written (empty or equal-to-default means the build-time value is used). Slugs are whitelisted against the catalogue. Limits: name 120, summary 300, description 3000, seoTitle 70, seoDescription 170, alt 140, 8 images per product. All text is plain text; escape on output.

Images: uploaded in the product screen, re-encoded with PHP GD (JPEG/PNG/WebP only, 8 MB max, longest side 2400 px, EXIF dropped), stored outside the web root at `<data_dir>/uploads/<yyyy-mm>/<slug>-<id>.<ext>` and streamed by `api/media.php?id=` (public, but the id must be listed in `products.json`; fixed content-type map, `nosniff`, one-year cache; unknown id is 404). Deleting an image, or resetting a product, removes the file. Without the GD extension uploads are disabled with a note on the screen; text editing still works. Keep `post_max_size` at 16M or more for multi-image uploads. Back up `<data_dir>/uploads/` with the rest of the private folder.

## Products, orders, applications and customers
Products can be added, edited, moved between the five groups and removed from the website. Added products open at `/products/item/?s=<slug>` and are not individually indexed until they are added to the code. Moving a built-in product changes its group in lists and search, not its static URL until the next build. Orders, career applications and customers have their own pages; see `docs/orders-otp-careers.md`.

## Intentionally out of scope

- Creating, deleting or regrouping products, group copy, sizes/variants and machine fit (these live in `src/content/products.ts` and need a rebuild). The product list is a build-time snapshot, `public/admin/lib/catalogue.php`, regenerated by `scripts/generate-catalogue.mjs` (postbuild, or `bash scripts/dev-sync.sh` locally).
- Changing your own password in the UI (edit `config.php` with a new hash from `hash.php`), user roles/permissions, two-factor sign-in, email/WhatsApp sending from the panel (it opens your own apps), file uploads. Bulk editing is limited to price, availability and status on the Products list.
- Migration between SQLite and JSON-lines storage; automated backups.

## Open points for the client / developer

- Mail currently also CCs the enquirer (existing behaviour in `api/enquiry.php`). That lets anyone make the site email a third party; consider removing the CC.
- Session/lockout timings and the `'owner'` account names are placeholders (`TODO(client)`).
- Add `Disallow: /admin/` and `Disallow: /data/` to `public/robots.txt` (not edited here; the admin already sends `X-Robots-Tag: noindex`).
- Tested with PHP 8.3 CLI server only; Apache/LiteSpeed `.htaccess` rules were reviewed, not executed.
