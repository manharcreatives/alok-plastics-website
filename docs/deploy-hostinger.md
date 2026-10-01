# Deploying Alok Plastics to Hostinger Premium

## Architecture
Static Next.js export (`output: 'export'`) + one PHP endpoint at `/api/enquiry.php`.
Hostinger Premium supports static files + PHP. **No Node.js runtime required or used.**

---

## 1. Build the static export

```bash
pnpm build
```

This produces the `out/` directory — these are the files you upload to Hostinger.

Verify the build is static:
```bash
ls out/
# Should contain index.html and all page directories
```

---

## 2. Set up the PHP endpoint on Hostinger

### 2a. Create the enquiry email address
1. Log into your Hostinger control panel → **Emails** → **Email Accounts**
2. Create: `enquiry@alokplastics.com` (or whatever email the client wants to receive enquiries at)
3. Note the password for the SMTP config below

### 2b. Upload `public/api/enquiry.php`
The PHP files in `public/api/` should be uploaded to `public_html/api/` on Hostinger.

### 2c. Create `config.php` (never commit this file!)
On the server, create `public_html/api/config.php` with real values:
```php
<?php
$ALOK_TO_EMAIL   = 'enquiry@alokplastics.com';
$ALOK_FROM_EMAIL = 'noreply@alokplastics.com';
$ALOK_SITE_URL   = 'https://alokplastics.com';
$ALOK_SMTP_HOST  = 'smtp.hostinger.com';
$ALOK_SMTP_PORT  = 465;
$ALOK_SMTP_USER  = 'noreply@alokplastics.com';
$ALOK_SMTP_PASS  = 'your_email_password_here';
$ALOK_RATE_DIR   = sys_get_temp_dir();
```

**DO NOT** upload the `.example` file as `config.php` — it has no real credentials.

### 2d. Test the PHP endpoint
From your local terminal (with PHP installed):
```bash
cd "D:/alok plastics"
php -S localhost:8080 -t public/
# Then in a new terminal:
curl -X POST http://localhost:8080/api/enquiry.php \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "name=Test+User&company=Test+Co&phone=9876543210&message=Test+enquiry+message&product=F-Bush&_source=test"
# Expected: {"ok":true,"message":"Thank you for your enquiry..."}
```

### 2e. Test honeypot (spam trap)
```bash
curl -X POST http://localhost:8080/api/enquiry.php \
  -d "name=Spambot&company=SPAM&phone=1234567890&message=buy+cheap+pills&_honey=gotcha"
# Expected: {"ok":true,...} — silently succeeds to confuse bots
```

### 2f. Test rate limiting
Submit twice quickly — the second should return 429 Too Many Requests.

---

## 3. Upload files to Hostinger

### Option A: File Manager (easiest)
1. Log into Hostinger Panel → **Files** → **File Manager**
2. Navigate to `public_html/`
3. Delete old files (if any exist from a previous deploy)
4. Upload the contents of `out/` (not the `out/` folder itself, its contents)
5. Upload `public/api/enquiry.php` to `public_html/api/enquiry.php`
6. Create and upload `config.php` as described above

### Option B: FTP (for large uploads)
FTP credentials: Hostinger Panel → **Advanced** → **FTP Accounts**
```bash
# Using lftp (Linux/Mac) or FileZilla (Windows)
lftp -e "mirror -R out/ public_html/ && bye" -u username,password ftp.hostinger.com
```

### Option C: Git deployment (if Hostinger Business or Cloud)
Set up the GitHub/GitLab integration in Hostinger Panel → **Git** and deploy from the `main` branch.
The `out/` directory should be set as the web root.

---

## 4. Set up `.htaccess`

Upload `public/.htaccess` (or `out/.htaccess`) to `public_html/.htaccess`.

This handles:
- HTTPS redirect
- Clean URLs (remove trailing slashes for static pages)
- 1-year cache headers for immutable assets (`/_next/static/`)
- 30-day cache for `/media/`
- PHP-specific headers

The `.htaccess` file will be created in Phase 8 (SEO/GEO).

---

## 5. Adding the hero video (when client provides footage)

1. Place encoded video files at `public/media/hero.mp4` and `public/media/hero.webm`
2. Place hero poster at `public/media/hero-poster.jpg`
3. Update `src/content/site.ts`:
   ```ts
   hero: {
     media: {
       mode: 'auto',   // changed from 'ambient'
       video: {
         webm: '/media/hero.webm',
         mp4: '/media/hero.mp4',
         mobileMp4: null,  // add if you have a mobile version
       },
       poster: '/media/hero-poster.jpg',
     }
   }
   ```
4. Run `pnpm build` and re-upload

See `docs/hero-video-brief.md` for the video shoot brief to send the client/videographer.

---

## 6. Adding new products

All product data is in `src/content/products.ts`. To add a product:
1. Add an entry to the `products` array in that file
2. Set `published: true`
3. Run `pnpm build` and re-upload

---

## 7. PHP version

The endpoint uses PHP 8.0+ features (declare(strict_types), string functions).
Hostinger Premium supports PHP 8.0, 8.1, 8.2 — use 8.1 or 8.2 for best compatibility.
Set PHP version: Hostinger Panel → **Advanced** → **PHP Configuration**.

---

## 8. SMTP email (optional — improves deliverability)

The `enquiry.php` uses PHP `mail()` by default, which should work on Hostinger.
For better deliverability, install PHPMailer via Composer and switch to SMTP:

```bash
# On Hostinger, SSH in and run:
cd public_html
curl -sS https://getcomposer.org/installer | php
php composer.phar require phpmailer/phpmailer
```

Then update `enquiry.php` to use PHPMailer with the `$ALOK_SMTP_*` config values.
PHPMailer code is not included to keep the endpoint dependency-free by default.

---

## Checklist before going live

- [ ] `config.php` created on server with real credentials (never in git)
- [ ] `pnpm build` passes with 0 errors
- [ ] All files from `out/` uploaded to `public_html/`
- [ ] `public/api/enquiry.php` uploaded to `public_html/api/`
- [ ] Test form submission: check email arrives at `$ALOK_TO_EMAIL`
- [ ] Test WhatsApp link: opens WhatsApp with prefilled message
- [ ] HTTPS redirect works (`http://` → `https://`)
- [ ] Hero shows without video (ambient mode) if video not yet ready
- [ ] GA4 ID configured in `site.ts` if analytics required
- [ ] DNS pointing to Hostinger (propagation can take 24–48h)

---

## Appendix: admin panel and enquiry inbox

`public/admin/` (admin app) and `public/data/` (runtime JSON) are copied into `out/` by the build and uploaded with the rest. `api/enquiry.php` now also stores every valid submission for the inbox. Setup, security notes and the redeploy rules (never wipe `admin/config.php`, the private data folder or `data/*.json`) are in `docs/admin-panel.md`.
