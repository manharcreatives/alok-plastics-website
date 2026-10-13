# Alok Plastics — Setup on a friend's PC (from GitHub)

Windows guide. The site + admin + WhatsApp automation run from the built `out/` folder, served by PHP.
No hosting needed — works on any PC with internet.

> ⚠️ The repo is **public on GitHub**. Secrets never live in the repo — they are provided privately by Utsav
> (see step 3). Never commit `public/api/config.php`, `public/admin/config.php`, `public/data/settings.json`
> or any `data/` folder — all are git-ignored already.

---

## 1. Install prerequisites (once)

### Git
- https://git-scm.com → install (defaults fine).

### PHP 8.3 (Windows x64)
- Download **PHP 8.3 (VC17 x64 Thread Safe) ZIP** from https://windows.php.net/download
- Unzip to `C:\php`.
- Copy `C:\php\php.ini-development` → `C:\php\php.ini`.
- In `php.ini` uncomment these lines (remove the `;`):
  ```
  extension_dir = "ext"
  extension=curl
  extension=gd
  extension=mbstring
  extension=fileinfo
  extension=sqlite3
  extension=pdo_sqlite
  ```
- Add `C:\php` to System PATH:
  Settings → System → About → Advanced system settings → Environment Variables → select `Path` → Edit → New → `C:\php` → OK.
- Verify in a **new** terminal:
  ```powershell
  php -v
  php -m | Select-String "curl|gd|mbstring|openssl|sqlite"
  ```

### Node.js + pnpm
- Install Node.js **20 LTS** from https://nodejs.org
- Open a terminal and:
  ```powershell
  npm install -g pnpm
  ```

---

## 2. Get the code

```powershell
git clone https://github.com/manharcreatives/alok-plastics-website.git
cd alok-plastics-website
pnpm install
```

---

## 3. Create config files (secrets — ask Utsav privately, never via GitHub)

### a) `public/api/config.php`
Copy `public/api/config.php.example` → `public/api/config.php` and fill real values. Utsav sends you:
- `$ALOK_WHATSAPP` — business WhatsApp number (digits with country code, e.g. `917479497003`)
- `$ALOK_WHATSAPP_API['key']` — WasenderAPI session Bearer key
- `$ALOK_WHATSAPP_API['secret']` — Wasender dashboard **Webhook Secret** (do NOT regenerate it in the dashboard)
- `$ALOK_BUSINESS` — real GSTIN / bank details / QR path (the example file shows placeholders)
- `$ALOK_OTP` — keep `skip` = `true` (OTP is off: customers enter name + mobile only)
- `$ALOK_TO_EMAIL`, `$ALOK_GAS_URL`, `$ALOK_GAS_SECRET` if mail/Google Sheets are used

### b) `public/admin/config.php`
Copy `public/admin/config.php.example` → `public/admin/config.php`.
Admin logins are created by Utsav (hash from `php public/admin/hash.php`). Leave as-is unless told otherwise.

### c) `public/data/settings.json`
Copy `public/data/settings.example.json` → `public/data/settings.json`, fill contact block:
```json
{ "schemaVersion": 1, "contact": { "phone": "+91 ...", "whatsapp": "91...", "email": "...", "mapsUrl": null, "gstin": null } }
```

---

## 4. (Optional) Copy existing data from Utsav

If you want the same orders / customers / admin accounts:
- Copy the folder **`public/admin/data/`** (private runtime: orders, customers, users, sequences) into the clone **before** step 5.
- Copy **`public/data/settings.json`** too.
- Utsav shares these privately (they are NOT in the repo).

---

## 5. Build + run

```powershell
pnpm build        # ~1-3 min; generates out/ (site + admin + api + data)
pnpm admin         # = php -S 127.0.0.1:8080 -t out  (keeps running)
```

Verify in browser:
- `http://localhost:8080` → website
- `http://localhost:8080/admin/` → admin login (Utsav's credentials)
- `http://localhost:8080/api/wa-webhook.php` → JSON `{"ok":true,"disabled":true}` (webhook is off by default)

**Manual WhatsApp mode (default):** from the admin open an enquiry → "Open in WhatsApp" opens the customer chat
on your own phone/WhatsApp Web with the message pre-filled; you press send yourself. Status changes send nothing.
For PDFs use "Generate PDF & Download", then attach the file in the chat ("Open WhatsApp chat").
OTP is off and the inbound webhook is off (`$ALOK_WHATSAPP_API['webhook'] = false`, `['autosend'] = false`).

---

## 6. Automation (OFF — optional, for later)

The WasenderAPI code is kept but disabled. To re-enable later: set `$ALOK_WHATSAPP_API['webhook'] = true` (and `['autosend']`
if wanted) in `public/api/config.php`, expose the PC with cloudflared, and set the webhook URL in the Wasender dashboard.
Nothing here is needed for the manual flow.

---

## 7. WhatsApp number

The client WhatsApp number is `917479497003` (+91 74794 97003). It lives in:
1. `public/api/config.php` → `$ALOK_WHATSAPP` and `public/data/settings.json` → `"whatsapp"` (both git-ignored).
2. `src/content/site.ts` default (or build with `$env:NEXT_PUBLIC_CLIENT_WHATSAPP="91..." ; pnpm build`).
After any change run `pnpm build` again and test: place an order (name + mobile only), then use "Open in WhatsApp" in the admin.

---

## 8. Day-to-day + limits

- Keep the server terminal open while you want the site live.
- Add/change products/site text → edit then `pnpm build` again (same as step 5).
- Never put `config.php`, `settings.json` or any `data/` folder on GitHub or in a shared chat.
- Meta (Facebook) WhatsApp Cloud API is **not used in production** — the sandbox token was a test only; keep Wasender.

---

## Troubleshooting

| Problem | Likely cause & fix |
|---|---|
| `unable to get local issuer certificate` | PHP lacks CA bundle — this repo vendors `public/api/lib/cacert.pem` (auto-used). Confirm it exists after clone. |
| OTP/Send fails with `not_configured` | `$ALOK_WHATSAPP_API['key']` empty in `public/api/config.php`. |
| Webhook health returns `403` server-to-server | You're opening the wrong URL — use `.../api/wa-webhook.php` with the tunnel (GET health is public). |
| Sends hit 429 | Free trial = 1 msg/min. Wait or upgrade. |
| `pnpm build` error ghao `out/` | Node too old → install Node 20 LTS, re-run `pnpm install`. |