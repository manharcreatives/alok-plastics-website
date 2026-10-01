# Admin panel (`/admin/`)

A self-contained PHP app for Hostinger Premium (static files + PHP only). No Node, no Composer, no build step, no database server. Source lives in `public/admin/`; `pnpm build` copies it to `out/admin/` untouched.

## What it does

| Screen | Purpose |
|---|---|
| Dashboard | New / unread / this week / this month counts, 30-day bar chart (inline SVG), status pipeline, most requested products, buyer-type split, latest enquiries. Warns when settings are incomplete or when email notification failed. |
| Enquiries | Every valid website submission, also stored by `api/enquiry.php`. Filters (status, buyer type, product, date range, active/archived), search, sortable columns, pagination, unread marker (unread count shown on the nav tab). CSV export honours the current filters (UTF-8 with BOM for Excel; formula-injection safe). |
| Enquiry detail | All fields, source page, one-tap Call / WhatsApp (`wa.me`) / Email with a greeting prefilled, status (new, contacted, quoted, won, lost), assign to a person, internal notes log, archive/restore, delete (separate confirm page). |
| Site settings | Phone, WhatsApp, email, Maps link, GSTIN, social links, typical reply time, opening hours, announcement banner. Writes `data/settings.json`. |
| Open roles | Add/edit/hide/delete roles for the Careers page. Writes `data/careers.json`. |
| Products | Hide/show published products in lists. Writes `data/product-overrides.json`. |
| Activity log | Sign-ins, failed/blocked sign-ins, status changes, notes, exports, deletes, settings saves (anonymous IP code only). |
| System check | PHP version, storage backend, writable folders, data folder outside web root, HTTPS. |

Nothing is pre-filled with invented values: every setting starts empty and the site must fall back to what is built into `src/content/*.ts`.

## Setup on Hostinger

1. `pnpm build`, then upload `out/` to `public_html/` as usual (this includes `admin/`, `api/`, `data/`). **Never delete `public_html/data/`, `public_html/admin/config.php` or the private data folder when re-uploading** (see "Redeploying").
2. Make a password hash. Preferred: on your own computer with PHP, `php public/admin/hash.php` (asks twice, 12+ characters). Fallback without PHP: open `https://yoursite/admin/hash.php` once; it only prints a hash, never saves anything, and answers 404 as soon as a real `config.php` exists. Delete `hash.php` from the server afterwards.
3. In `public_html/admin/` copy `config.php.example` to `config.php` (File Manager), paste the hash for each user. Add one block per person (the display name appears in notes and "assigned to").
4. Recommended: create a folder **above** `public_html` (for example `/home/uXXXX/alok-private`) and set `'data_dir'` to its absolute path in `config.php`. Enquiries, audit log, sessions and login counters live there, unreachable from the web. If you skip this, they go to `admin/data/` protected by `.htaccess` (the System screen shows an advisory).
5. Make sure `public_html/data/` exists and is writable by PHP (normally yes; permissions 755 for folders, 644 for files, and `config.php` 640 if Hostinger allows).
6. Visit `https://yoursite/admin/`, sign in, open **System check** and clear any "Fix" rows.
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

## Intentionally out of scope

- Product create/edit/delete and images: product content lives in `src/content/products.ts` and needs a rebuild (or the SRS Node-hosting future scope). The Products screen only hides/shows existing published items in lists; the product page, sitemap and search results are unaffected. Its product list is a snapshot (`public/admin/lib/catalogue.php`, taken 2026-10-01); refresh it when products change, for example `node -e` over `products.ts` extracting `slug`, `name`, `published`.
- Changing your own password in the UI (edit `config.php` with a new hash from `hash.php`), user roles/permissions, two-factor sign-in, email/WhatsApp sending from the panel (it opens your own apps), bulk actions, file uploads.
- Migration between SQLite and JSON-lines storage; automated backups.

## Open points for the client / developer

- Mail currently also CCs the enquirer (existing behaviour in `api/enquiry.php`). That lets anyone make the site email a third party; consider removing the CC.
- Session/lockout timings and the `'owner'` account names are placeholders (`TODO(client)`).
- Add `Disallow: /admin/` and `Disallow: /data/` to `public/robots.txt` (not edited here; the admin already sends `X-Robots-Tag: noindex`).
- Tested with PHP 8.3 CLI server only; Apache/LiteSpeed `.htaccess` rules were reviewed, not executed.
