# connection.md — Website ⇄ Admin panel wiring (single source of truth)

Hostinger-style stack: static Next.js site (`out/`) + PHP endpoints (`public/api/`) + PHP admin (`public/admin/`). No Node server, no DB server. Everything below is real, not mocked.

**Rule for future changes:** if a website field changes, update this file, the API validation in `public/api/*.php`, and the admin view in `public/admin/lib/views/*.php` together.

## 1. Architecture

```
Browser (Next static pages, React)
   │  fetch JSON (X-Alok-Session header after login)
   ▼
public/api/*.php  ──►  AlokShop (public/admin/lib/shop.php)  ──►  private data dir
 auth.php  cart.php  order.php  career.php  enquiry.php          (JSONL / JSON files, SQLite for form enquiries)
                                                                         ▲
public/admin/index.php  (login + CSRF + roles)  ───────────────────────┘
 Live carts · Orders (enquiry→order lifecycle) · Customers · Products · Enquiries · Applications
```

Data dir = `data_dir` in `public/admin/config.php` (default `admin/data/`, `.htaccess`-denied). Best practice on live server: a folder **above** `public_html`.

## 2. Files in the data dir

| File | Written by | Holds |
|---|---|---|
| `otp.json` | `auth.php` | hashed OTPs (10 min TTL, 5 tries) |
| `customers.jsonl` | `auth.php`, `order.php` | name, phone (91XXXXXXXXXX), address, last login |
| `sessions.jsonl` | `auth.php` | sha256 of session token, 30-day expiry |
| `carts.jsonl` | `cart.php`, `order.php` | live cart per visitor (`status` open / submitted) |
| `orders.jsonl` | `order.php`, admin | the enquiry → order record (see §4) |
| `enq-seq.json` | `AlokShop::orderCode()` | last ENQ number (lock-protected, starts 1001) |
| `invoice-seq.json` | `AlokShop::nextInvoiceNo()` | gapless invoice counter per financial year |
| `ratelimit.json` | all APIs | per-phone / per-IP / per-visitor throttles |
| `audit.jsonl` | admin | who changed what (status changes etc.) |

## 3. Endpoints

All `POST`, JSON, same-origin (Origin must match `$ALOK_SITE_URL`; localhost:3000/3001 allowed for dev). Config: `public/api/config.php` (git-ignored; template `config.php.example`).

| Endpoint | Auth | Request | Response | Notes |
|---|---|---|---|---|
| `/api/auth.php` `action=request` | none | `name, phone` | `{ok, devCode?}` | sends OTP; `devCode` only when `dev_mode` is on |
| `/api/auth.php` `action=verify` | none | `name, phone, code` | `{ok, token, user}` | creates customer + 30-day session |
| `/api/auth.php` `action=me / logout` | session | – | `{ok, user}` | |
| `/api/cart.php` | optional session | `visitor, items[{slug,name,sku,qty,price,availability}]` | `{ok}` | debounced upsert; empty list deletes the open cart; token attaches name + mobile |
| `/api/order.php` | **session required** | `items, address (≥8 chars), note, visitor` | `{ok, order{code,…}, wa{number,text}}` | creates `ENQ-xxxx`, marks the visitor's cart `submitted`, returns the WhatsApp text |

Website side: `src/lib/auth-client.ts` (`requestOtp`, `verifyOtp`, `syncCart`, `placeOrder`), `src/components/cart/CartProvider.tsx` (`CartSync`), `CartPageClient.tsx`, `CartAuth.tsx`.

## 4. Step-by-step data flow

| # | Step | Website | API | Stored | Admin screen |
|---|---|---|---|---|---|
| 1–2 | Browse, add to cart | `AddToCart`, `useCart` (localStorage `alok:cart:v1`) | `cart.php` (debounced 1.2 s) | `carts.jsonl` open | **Live carts** (auto-refresh 8 s): visitor / customer, products, qty, availability, "Abandoned" after 24 h |
| 3–4 | Login: name + mobile + OTP | `CartAuth` | `auth.php request → verify` | `customers`, `sessions` | Customers; cart row now shows name + mobile |
| 5–6 | Submit enquiry + address | `CartPageClient` | `order.php` | `orders.jsonl` (`status=pending`, `code=ENQ-1001…`, `address`, `items`), cart → `submitted` | Orders (badge count = new enquiries) |
| 7–8 | WhatsApp | popup to `wa.me/<ALOK_WHATSAPP>?text=…` + button | – | – | – (customer presses Send) |
| 9 | Review | – | – | `reviewing` | Order → "Next step" |
| 10 | Quote / proforma | – | – | `quoted`, `quote_amount`, `quote_note` | Order → quote form + WhatsApp message |
| 11–12 | Confirm order | – | – | `confirmed` | WhatsApp "Order confirmed" message |
| 13–15 | Offline payment, mark received | – | – | `paid`, `pay_amount/mode/ref` | WhatsApp "Payment received" message |
| 16 | Dispatch | – | – | `dispatched`, `transporter`, `lr_no` | WhatsApp dispatch message |
| 17 | GST invoice | – | – | `invoiced`, `invoice_no` = `AP/2026-27/0001` | WhatsApp invoice message |
| 18 | Close | – | – | `closed` | – |

Status machine: `pending → reviewing → quoted → confirmed → paid → dispatched → invoiced → closed`; `cancelled` (reason required) from any open stage. Only the next step is allowed; every change is written to `history` and `audit.jsonl`. Legacy statuses map: `processing → reviewing`, `completed → closed`. Code: `AlokShop::ORDER_STATUSES / nextStatus()`, `page_order()` in `shop_pages.php`.

Customer messages: `AlokShop::stageMessage()` builds the text for the current stage; the admin presses **Send on WhatsApp** (opens `wa.me/<customer>?text=…`). The server never sends WhatsApp by itself.

## 5. Products and availability (admin → website)

Admin → Products: add/edit products, price, **availability** (`in-stock`, `out-of-stock`, `on-request`), stock count, status (active/hidden). Saved to `public/data/*.json`, read by the site at runtime (`src/lib/runtime-data.ts`, `useRuntime*`). The cart re-resolves every line against that live data: out-of-stock/hidden products block submitting; stock caps quantity. Limit: admin-added products are not statically generated, so search engines only index them once they are added to `src/content/products.ts`.

## 6. Config keys (`public/api/config.php`)

| Key | Meaning |
|---|---|
| `$ALOK_SITE_URL` | allowed Origin (e.g. `https://alokplastics.com`; local demo `http://127.0.0.1:8080`) |
| `$ALOK_WHATSAPP` | number that receives enquiries, with country code |
| `$ALOK_OTP['provider']` | `msg91` / `fast2sms` / `webhook`; empty = no SMS |
| `$ALOK_OTP['dev_mode']` | **demo only:** returns the OTP in the response and pre-fills it. Never on the live site |
| `$ALOK_TO_EMAIL / $ALOK_FROM_EMAIL` | email copy of each enquiry |
| `$ALOK_GAS_URL / _SECRET` | optional Google Sheet log |

## 7. Demo vs production

| Item | Local demo (now) | Production |
|---|---|---|
| OTP | `dev_mode=true`: code shown/pre-filled, no SMS | set provider + key (MSG91/Fast2SMS need DLT-approved template), `dev_mode=false` |
| WhatsApp number | demo number | client's number |
| Everything else (carts, ENQ IDs, lifecycle, invoices numbers, products) | real | same |

## 8. Known limits

- WhatsApp messages are click-to-send (server auto-send needs the paid Business API).
- GST invoice is a numbered record + message; a printable invoice PDF layout is Phase 2.
- JSONL storage is fine for hundreds of enquiries a month; move to SQLite if volume grows.

## 9. Run locally

```
npx next build          # writes out/ (copies public/api + public/admin)
npm run admin           # php -S 127.0.0.1:8080 -t out   → http://127.0.0.1:8080  and /admin/
```
Admin login = users in `public/admin/config.php` (hash from `php admin/hash.php`).
