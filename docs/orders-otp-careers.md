# Orders, customer sign-in (OTP) and career applications

All of this runs on the existing Hostinger plan: static site plus PHP. No Node server and no database server.

## Customer flow

1. Customer adds parts to the cart and opens `/cart/`.
2. Not signed in: the page asks for full name and mobile number, then a 6-digit code (`/api/auth.php`, actions `request` and `verify`).
3. A session token is kept in the browser (`localStorage` key `alok:session:v1`) and a hashed copy is stored on the server (`sessions.jsonl`). It lasts 30 days.
4. Place order (`/api/order.php`) saves the order (`AP-XXXXXX`) with the customer and every line, emails the client, appends to the Google Sheet and returns a pre-filled WhatsApp message.
5. WhatsApp opens with the order summary. The success screen shows the Order ID and a button to open WhatsApp again.

If the SMS provider is not configured, or the server cannot be reached, the cart falls back to the original "send request on WhatsApp" form so ordering never breaks.

## What the client must provide

- WhatsApp number for orders: `$ALOK_WHATSAPP` in `public/api/config.php` (and optionally `NEXT_PUBLIC_CLIENT_WHATSAPP` at build time for other WhatsApp buttons).
- Enquiry / career email: `$ALOK_TO_EMAIL`, `$ALOK_FROM_EMAIL`.
- An SMS or WhatsApp OTP provider account. Indian SMS needs DLT registration and an approved OTP template. Supported in code: MSG91, Fast2SMS, or any webhook (n8n, Make, WhatsApp Business provider). Until `$ALOK_OTP['provider']` is set, sign-in is unavailable and the fallback is used.
- Google Apps Script URL and secret: see `docs/google-apps-script/README.md`.

WhatsApp messages are opened as a pre-filled `wa.me` link on the customer's device. Sending automatically from the server needs the WhatsApp Business API, which is a separate paid setup.

## Where data lives

Private data folder (see `docs/admin-panel.md`): `orders.jsonl`, `customers.jsonl`, `applications.jsonl`, `sessions.jsonl`, `otp.json`, `ratelimit.json`, and `resumes/` (uploaded CVs, never served directly). Orders, applications, customers and resume downloads are managed in `/admin/` under Orders, Applications and Customers. The IP address is stored as received for orders and applications.

## Career form

`/career/` posts to `/api/career.php`: validation, honeypot, rate limit (5 per hour per IP). Saved in the admin, emailed to the client, and posted to the Google Sheet (resume file stored in Drive). Resume: PDF, DOC or DOCX up to 3 MB, or a link.

## Admin products

Products can be added, edited, moved between the five groups and removed from `/admin/` (Products). Products added in the admin are listed in their group, search and cart at once and open at `/products/item/?s=<slug>`; they are not statically generated, so they are not individually indexed by search engines until the product is added to `src/content/products.ts`. Built-in products moved to another group appear under the new group in lists; their own URL stays the same until the next build.
