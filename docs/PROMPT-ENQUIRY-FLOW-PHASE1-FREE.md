# PROMPT — Phase 1: poora flow asli, lekin zero running cost

> Pehle `AGENTS.md` padho (yeh non-standard Next.js hai; code se pehle `node_modules/next/dist/docs/` ka relevant guide). Phir `docs/PROMPT-ENQUIRY-ORDER-FLOW.md` padho: woh poora vision hai. Yeh file uska **Phase 1** hai: wahi flow, wahi DB, wahi admin lifecycle, bas paid cheezein (SMS, WhatsApp API) abhi nahi.

## Goal

Client ke saamne meeting mein **asli working system** dikhana (dummy screens nahi): cart → admin mein live dikhe → enquiry (naam, mobile, address, OTP) → `ENQ-xxxx` → WhatsApp → admin lifecycle (quote → confirm → payment → dispatch → GST invoice → close). Kal paid provider lagana ho to sirf `config.php` badle, code nahi.

## Constraints

- Hostinger Premium: static export + PHP + SQLite/JSON. Node server, paid SMS, WhatsApp Business API **nahi**.
- Kuch bhi hardcode mat karo jo baad mein provider badalne par tod de. Har paid cheez ek **adapter** ke peeche ho.

## Free approach, cheez-wise

1. **OTP: pluggable adapter** (`AlokShop::sendOtp` ko extend karo, existing hashing/TTL/rate-limit/tries barkarar):
   - `mode = 'demo'` (Phase 1 default): SMS nahi jaata. OTP server par generate + hash hota hai, aur response mein `demo_code` aata hai. UI mein ek clearly-marked banner: "Demo mode: aapka OTP 123456". Ye sirf tab chale jab config mein `demo` ho; `demo_code` production mode mein kabhi response mein na aaye (test likho).
   - `mode = 'email'` (free, optional): OTP Hostinger SMTP se customer ke email par (existing mail setup reuse). Enquiry form mein email optional field, demo ke liye.
   - `mode = 'msg91' | 'fast2sms' | 'webhook'`: existing code, Phase 2 mein sirf key daalke on.
   - Server-side rule same rahe: verified session ke bina enquiry submit reject. Demo mode mein bhi OTP verify step asli chale, sirf delivery dummy hai.
2. **Live cart → admin:** `public/api/cart.php` (debounced sync, `visitor_id`, best-effort, OTP ke baad customer se link), admin mein **Live Carts** page (items, qty, last activity, abandoned badge, 5-sec auto-refresh via simple fetch polling, WebSocket nahi).
3. **Enquiry:** naam, mobile, address (line/city/state/pincode), optional GSTIN. Sequential `ENQ-1001+` (lock-safe). Cart lines snapshot, cart `submitted`.
4. **WhatsApp (free):** success screen par `wa.me/<number>?text=<prefilled summary with ENQ ID>`; auto-open + button. Admin ke har stage change par **prefilled wa.me "click-to-send" button** (Order Confirmed, Payment Received, Quote, Dispatch). Admin "Mark as sent" kare, messages log mein jaaye. Templates admin Settings/config mein editable.
5. **Admin lifecycle:** `new → under_review → quote_sent → order_confirmed → payment_received → dispatched → invoiced → closed` (+ cancelled/lost/on_hold), controlled transitions, audit log, quote versions, partial payments, dispatch details.
6. **GST invoice / proforma:** server-rendered **printable HTML** (print-to-PDF browser se), `@media print` CSS. PDF library mat lagao. Gapless invoice no. (series + FY, lock ke andar), CGST/SGST vs IGST seller/buyer state se, HSN, round-off. Company GSTIN/bank/HSN config se; missing ho to `TODO(client)` placeholder dikhe, fake value nahi.
7. **Dashboard:** stage-wise funnel count/value, pending actions.
8. **Demo data:** `scripts/seed-demo.php` (2-3 sample enquiries alag stages mein, "DEMO" tag) + `scripts/reset-demo.php` taaki meeting se pehle clean state mil sake. Production data par ye scripts chalne se pehle confirm maangein.

## Phase 2 (abhi mat banao, bas adapters ready rakho)

Real SMS OTP (MSG91/Fast2SMS + DLT), WhatsApp auto-send via webhook/Business API (`$ALOK_WA_API` flag), online payment gateway. Inke liye `connection.md` mein "Switch to production" checklist likho.

## `connection.md` (deliverable)

Website ↔ admin ka source of truth: architecture diagram, endpoint contract table, step 1–18 → file → API → table → admin screen map, status machine + permissions, ID rules, config keys (`otp.mode`, `$ALOK_WHATSAPP`, ENQ start no.), "Demo vs Production" table, aur rule: "website field badle to doc + API validation + admin view teeno update karo." Purane docs (`orders-otp-careers.md`, `admin-panel.md`) ko isi par point karo; `CHANGELOG.md` update.

## Security (demo mein bhi)

Prepared statements, escape sab output, CSRF admin POST par, rate limits (OTP, cart sync, enquiry), data dir web se bahar/deny, payment/invoice/cancel audit-logged (delete nahi), `demo_code` sirf demo mode mein, demo banner production build mein off.

## Delivery

Chhote steps: audit + `connection.md` skeleton → DB/migration → cart sync + Live Carts → OTP adapter + enquiry form + ENQ + WhatsApp → admin lifecycle/quotes → payments/dispatch/invoice → dashboard + seed/reset scripts → docs. Har step ke baad `pnpm lint`, `pnpm build` (static export na tute), `php -l` sab PHP par, aur Playwright (`tests/`) end-to-end: cart → admin mein live dikhe → demo OTP → ENQ ID → stage transitions → invoice. Edge cases: galat/expire OTP, double submit, empty cart, product delete, concurrent ENQ, partial payment, quote revision, CGST/SGST vs IGST.

End mein: kya bana, demo kaise chalaye (3-minute script), Phase 2 mein kya lagega aur approx cost.
