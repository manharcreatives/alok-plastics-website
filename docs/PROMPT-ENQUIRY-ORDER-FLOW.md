# PROMPT — Enquiry → Quote → Order → Payment → Dispatch flow (Website ⇄ Admin connected)

> Is poore file ko Claude Code ko prompt ki tarah do. Pehle `AGENTS.md` padho: yeh Next.js standard wala nahi hai, code likhne se pehle `node_modules/next/dist/docs/` ke relevant guide padho.

---

## 0. Role aur goal

Tum is repo ke senior full-stack engineer ho. Goal: website (Next.js static export) aur admin panel (PHP, `public/admin/`) ko ek **single connected workflow** mein jodna, jahan customer ka cart live admin ko dikhe, enquiry OTP-verified ho, aur enquiry se lekar GST invoice / Order Closed tak poora lifecycle admin panel se chale.

**Hard constraints (Hostinger Premium):** static export + PHP + SQLite/JSON files. Node server, Redis, external DB nahi. Naya paid service mat lagao. WhatsApp par server se auto-send **nahi** ho sakta (WhatsApp Business API alag paid setup hai) — isliye har outgoing WhatsApp message ek **prefilled `wa.me` click-to-send link** hoga jo admin ke panel mein ek button se khulega (aur customer-side message customer ke phone se jayega).

## 1. Pehle audit karo (code likhne se pehle)

Yeh already exist karta hai, dobara mat banao, extend karo:

- `public/api/enquiry.php`, `public/api/order.php`, `public/api/auth.php` (OTP: `request` / `verify`), `public/api/_bootstrap.php`
- `public/admin/lib/shop.php` (`AlokShop::sendOtp/verifyOtp/rateLimit`, orders, customers, sessions), `core.php` (enquiries SQLite table, `STATUSES`), `query.php`, `views/*` (enquiries, enquiry, orders, order, customers, dashboard)
- `src/components/cart/*` (`CartProvider`, `CartPageClient`, `CartAuth`), `src/components/forms/*`, `src/lib/whatsapp.ts`, `src/lib/auth-client.ts`, `src/lib/enquiry-submit.ts`
- `docs/orders-otp-careers.md`, `docs/admin-panel.md`, `docs/commerce-brief.md`

Audit ka output: ek chhota gap-list (kya hai / kya missing / kya conflict karta hai). Dhyan do: abhi `enquiries` (SQLite) aur `orders` (`AP-XXXXXX`, jsonl) **do alag cheezein** hain. Inhe ek unified lifecycle mein laana hai (section 3). Existing data ke liye migration likho, purana data nahi tootna chahiye.

## 2. Flow jo implement karna hai

```
1  Browse Products
2  Add to Cart            → cart server par sync (admin ko "live cart" dikhe)
3  Submit Enquiry         → name + mobile + address form
4  OTP verify             → mobile par OTP, user enter karta hai
5  Backend DB mein save   → enquiry + saari cart lines + customer address
6  Enquiry ID             → ENQ-1042 (sequential, human-friendly)
7  WhatsApp redirect      → prefilled enquiry summary (ID ke saath)
8  User WhatsApp mein Send dabata hai
9  Admin enquiry review karta hai
10 Admin quote / proforma invoice bhejta hai
11 Admin Panel: "Confirm Order"
12 Customer ko "Order Confirmed" message
13 Customer offline payment karta hai
14 Admin "Payment Received" mark karta hai
15 Customer ko "Payment Received" message
16 Dispatch
17 GST Invoice
18 Order Closed
```

### 2.1 Live cart → Admin (steps 2)

- Jab user add-to-cart kare, website cart (localStorage, jaisa abhi hai) ke saath **server par bhi sync** ho. Naya endpoint `public/api/cart.php` (POST upsert, GET own cart), debounced (~1.5 s), best-effort — fail ho to cart kabhi na tute.
- Cart ek `visitor_id` (random, localStorage) se identify ho; OTP verify ke baad wahi cart customer/mobile se link ho jaaye (anonymous → identified).
- Store: `carts` table (SQLite, `core.php` ke pattern par; SQLite na ho to jsonl fallback jaisa baaki code karta hai): `visitor_id, customer_phone, lines(JSON: product slug, name, variant, qty, unit), updated_at, status(open|submitted|abandoned)`.
- Admin panel mein naya section **"Live Carts"**: kaun sa visitor/customer, kaunsi items, qty, last activity, "abandoned" badge (jaise 24 h inactivity). Mobile known ho to "WhatsApp follow-up" button (prefilled wa.me).
- Privacy: sirf cart contents + visitor id; OTP se pehle koi personal data store nahi. Privacy page mein ek line add karo.

### 2.2 Enquiry submit: Mobile + OTP + Name + Address (steps 3–5)

- Form fields: **Full name, Mobile (10-digit IN), Address (line, city, state, pincode)**, optional GSTIN/company, optional note. Validation client (Zod, `src/lib/enquiry-schema.ts`) aur server dono par same.
- Flow: mobile daalo → "Send OTP" → `auth.php?action=request` → 6-digit OTP input → `verify` → verified session token. **Enquiry submit bina verified session ke reject** (server-side check, sirf UI par bharosa nahi).
- Existing OTP code reuse karo (hashed OTP, 10 min TTL, rate limit `otp:<phone>` 5/hr, `otpip` 15/hr, max tries). Provider config `$ALOK_OTP` (MSG91 / Fast2SMS / webhook). Agar provider configured nahi hai: clear error + fallback (neeche 2.6).
- Already signed-in (30 din session) customer ko OTP dobara mat poochho; sirf address confirm karao.
- Submit par server ek **transaction** mein: customer upsert (phone unique) → enquiry row → cart lines freeze (snapshot) → cart `status=submitted`.
- Honeypot, Origin check, rate-limit (existing pattern) barkarar rakho.

### 2.3 Enquiry ID (step 6)

- Format `ENQ-<n>`, n sequential (1001 se start, config mein). Race-condition safe (SQLite autoincrement / file lock). Order IDs (`AP-XXXXXX`) ko `ENQ-` se replace/alias karo (ek hi ID poore lifecycle mein; sirf prefix Invoice/Order ke liye internal ho sakta hai). Admin, customer message, WhatsApp, GST invoice — sab jagah wahi ID.

### 2.4 WhatsApp redirect (steps 7–8)

- Success screen: Enquiry ID bada dikhao + auto-open `wa.me/<ALOK_WHATSAPP>?text=...` (popup-blocker ke liye button bhi, auto-redirect 1.5 s baad).
- Prefilled text: ID, naam, mobile, city, har line (product, variant, qty), "Please share quote / proforma invoice." Length limit ka dhyan (lamba ho to top N lines + "full list in enquiry ENQ-xxxx").
- Admin ko pata chalna chahiye ki customer ne WhatsApp message **actually bheja ya nahi** — yeh server ko nahi pata. Isliye admin Enquiry detail mein manual toggle "WhatsApp message received" rakho; aur enquiry hamesha DB mein already saved hai (WhatsApp send na bhi kare to lead nahi khoti).

### 2.5 Admin lifecycle (steps 9–18)

Ek hi `status` field, controlled transitions (invalid jump block, har change audit log mein: kaun, kab, kya):

`new → under_review → quote_sent → order_confirmed → payment_received → dispatched → invoiced → closed`
Side states: `cancelled`, `lost` (reason ke saath), `on_hold`. Kisi bhi stage se cancel allowed (reason mandatory).

Har stage par admin ke liye action + data:

| Stage | Admin action | Data capture |
|---|---|---|
| under_review | Enquiry kholte hi auto `seen`; "Start review" | assigned_to, internal notes (existing) |
| quote_sent | "Send Quote": line-wise rate, GST %, freight, validity date; proforma PDF/printable HTML | `quote` JSON (versioned — revise quote par v2, v1 history rahe), totals |
| order_confirmed | **"Confirm Order"** (sirf quote_sent ke baad) | confirmed_at, final quote version lock |
| payment_received | **"Payment Received"** | amount, mode (NEFT/UPI/cheque/cash), UTR/ref, date, partial payment support (balance dikhao) |
| dispatched | "Dispatch" | transporter, LR/tracking no., date, packages |
| invoiced | "Generate GST Invoice" | invoice no. (series + FY), GSTIN buyer/seller, HSN, CGST/SGST vs IGST (state se auto), round-off, printable PDF/HTML |
| closed | "Close Order" (sirf invoiced + balance 0) | closed_at |

Customer messages (steps 12 aur 15 + quote/dispatch): har transition par admin ke screen par **ek prefilled wa.me button** aata hai (template editable, `Order Confirmed — ENQ-1042 …`, `Payment Received ₹… — ENQ-1042 …`, quote ke liye proforma link, dispatch ke liye LR no.). Templates ek jagah (`public/admin/lib/` config / admin Settings) rakho, hardcode mat karo. Har message ka log: `messages` list (stage, text, sent_marked_by, time) — admin "Mark as sent" kare.
Optional (flag ke peeche): agar `$ALOK_WA_API` webhook configured ho (n8n/Make/provider), server se auto-send; warna click-to-send.

Admin UI: Enquiries list mein stage filter + counts, Orders view ko isi lifecycle ka "confirmed onwards" filter banao (alag data silo nahi). Dashboard par pipeline funnel: stage-wise count aur value, aaj ka pending action ("quote due", "payment pending > 7 days").

Roles: existing roles/permissions system use karo — naye permissions: `quote`, `confirm_order`, `record_payment`, `dispatch`, `invoice`. Payment aur invoice sirf authorised role.

### 2.6 Failure & fallback

- SMS provider down/not configured → enquiry form "WhatsApp par seedha bhejo" fallback (jaise abhi cart mein hai) dikhaye, aur server par `unverified=1` flag ke saath save kare (admin ko alag badge). Kabhi lead gum nahi honi chahiye.
- `api/*.php` unreachable (static preview) → existing `unavailable` handling barkarar.

## 3. Data model (SQLite, `core.php` migrations ke pattern par, idempotent `CREATE TABLE IF NOT EXISTS` / `ALTER`)

- `customers(phone UNIQUE, name, address_line, city, state, pincode, gstin, company, verified_at)`
- `carts(visitor_id, customer_phone, lines, status, updated_at)`
- `enquiries` extend: `enq_no, customer_phone, address(JSON), lines(JSON snapshot), verified, wa_received, stage, quote(JSON,versioned), confirmed_at, cancelled_reason`
- `payments(enq_id, amount, mode, ref, paid_at, by)`
- `dispatches(enq_id, transporter, tracking_no, dispatched_at)`
- `invoices(enq_id, invoice_no UNIQUE, fy, taxable, cgst, sgst, igst, total, issued_at)`
- `events(enq_id, at, actor, type, from, to, note)` — audit + customer timeline
- `messages(enq_id, stage, text, marked_sent_by, at)`

Existing `orders.jsonl` / purani enquiries → one-time migration script (`scripts/`), dry-run flag ke saath, backup pehle.

## 4. `connection.md` — yeh deliverable zaroori hai

Repo root (ya `docs/`) mein **`connection.md`** banao jo website ↔ admin panel ka single source of truth ho. Usme:

1. **Architecture diagram** (ASCII/mermaid): Browser (Next static) → `public/api/*.php` → SQLite/data dir → `public/admin/`.
2. **Endpoint contract table:** har endpoint ka method, URL, auth, request fields, response, error codes (`cart.php`, `auth.php`, `enquiry.php`, admin actions).
3. **Data flow per step (1–18):** step → website component/file → API → DB table/field → admin screen jahan dikhta hai.
4. **Status machine:** allowed transitions, kaun kar sakta hai (permission), kaunsa message template trigger hota hai.
5. **ID & numbering rules:** `ENQ-`, invoice series, FY reset.
6. **Config keys:** `$ALOK_WHATSAPP`, `$ALOK_OTP`, `$ALOK_WA_API`, ENQ start number, company GSTIN/state/HSN defaults, abandoned-cart hours.
7. **Rule for future changes:** "Website mein koi field badle to is file, API validation aur admin view teeno update karo."
8. Known limits (WhatsApp auto-send nahi, OTP provider DLT requirement).

`docs/orders-otp-careers.md`, `docs/admin-panel.md` mein purane flow ko `connection.md` ki taraf point karo (duplicate content mat rakho). `CHANGELOG.md` update karo.

## 5. Security checklist (non-negotiable)

- Server-side OTP-verified session check enquiry submit par; client par trust nahi.
- Sab input validate/escape (admin views mein `htmlspecialchars`; WhatsApp text `rawurlencode`).
- CSRF tokens admin POST actions par (existing pattern), prepared statements har query mein.
- Rate limits: OTP, cart sync (per visitor), enquiry.
- Customer PII (phone, address, GSTIN) public folder mein kabhi nahi; data dir web-root se bahar / `.htaccess` deny.
- Payment/invoice/cancel actions audit log mein, delete nahi — sirf cancel/void.
- Invoice number gapless aur unique (lock ke andar generate).

## 6. Delivery rules

- Chhote, reviewable steps mein kaam karo: (1) audit + `connection.md` skeleton → (2) data model + migration → (3) cart sync + Live Carts → (4) OTP enquiry form + ENQ ID + WhatsApp → (5) admin lifecycle + quotes → (6) payments / dispatch / GST invoice → (7) dashboard + permissions → (8) docs/changelog.
- Existing code style, naming, comment density follow karo. Design tokens ke liye `docs/PROMPT-UI-UX.md` / design system; hardcoded colors nahi.
- Har step ke baad: `pnpm lint`, `pnpm build` (static export tootna nahi chahiye), `php -l` har PHP file par, aur Playwright test (`tests/`) naye flow ke liye: cart → OTP (provider mock/webhook) → enquiry → ENQ ID → admin mein stage transitions → invoice.
- Edge cases test karo: galat/expire OTP, double submit, empty cart par submit, cart mein product baad mein delete, concurrent ENQ ID, partial payment, quote revision, state ke hisaab se CGST/SGST vs IGST, mobile par admin usability.
- Jo cheez client se chahiye (WhatsApp number, SMS provider account, GSTIN, bank details, invoice series, HSN codes) uski `TODO(client)` list alag se do; placeholder values hardcode mat karo.
- End mein summary: kya bana, kya manual setup baaki, aur kya limitation hai (WhatsApp click-to-send).
