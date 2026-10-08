# AGENT PROMPT — Real wiring: Website ⇄ Admin (login OTP, live cart, enquiry, WhatsApp, product management)

> Yeh `docs/PROMPT-ENQUIRY-FLOW-PHASE1-FREE.md` ko **supersede** karta hai. Wahan OTP "demo mode" tha; ab **OTP asli hoga**. Poore lifecycle (quote → payment → invoice) ka vision `docs/PROMPT-ENQUIRY-ORDER-FLOW.md` mein hai; yahan uska demo-scope hai.

Tum autonomous senior full-stack agent ho. Pehle `AGENTS.md` padho: yeh non-standard Next.js hai, code likhne se pehle `node_modules/next/dist/docs/` ka relevant guide padho aur deprecation notices follow karo. Plan banao, phir step-by-step execute karo, har step khud verify karo. Sirf tab ruko jab koi cheez client/user ke bina ho hi na sake (neeche "Blockers").

## Kal ke demo mein kya dikhna chahiye (Definition of Done)

1. Customer apna **asli mobile number** dalta hai, uske phone par **asli OTP** aata hai, verify hota hai, naam + address deta hai (login).
2. Customer products cart mein daalta hai → admin panel mein **usi waqt** dikhta hai: kaun (naam, mobile, address), kaunse items, variant, qty, last activity.
3. Customer Enquiry submit karta hai → `ENQ-xxxx` ID banti hai, DB mein save, admin ko enquiry dikhti hai (cart lines ke saath).
4. Customer **WhatsApp par redirect** hota hai, prefilled enquiry summary ke saath; "Send" dabata hai.
5. Admin panel se **naya product add / edit** kar sakta hai (naam, group, image, specs, **availability**), aur website par turant dikhta hai. Customer us product ko cart mein daal sakta hai.
6. Admin availability badal sakta hai (In stock / Limited / Out of stock / Made to order / Hidden), aur website par badge dikhta hai; Out of stock par "Add to cart" ki jagah "Notify / Enquire" aata hai.
7. Admin enquiry ko review karke stage badal sakta hai (`new → under_review → quote_sent → order_confirmed`) aur har stage par prefilled WhatsApp "click-to-send" button milta hai. (Payment/dispatch/invoice stages ka structure ho, par full polish Phase 2.)

## Constraints

- Hostinger Premium: static export (`output: 'export'`) + PHP + SQLite/JSON. Node server nahi.
- Pehle audit karo, duplicate mat banao. Already hai: `public/api/{auth,enquiry,order,career,media}.php`, `public/admin/lib/{shop,core,products,query,web,...}.php`, `views/*`, `src/components/cart/*`, `src/components/forms/*`, `src/lib/{whatsapp,auth-client,enquiry-submit,runtime-data}.ts`, admin Products (docs/orders-otp-careers.md "Admin products"). Gap-list banao: kya hai / kya missing.
- Existing code style, naming, comment density follow karo. Design tokens use karo (`docs/PROMPT-UI-UX.md`), hardcoded colors nahi.

## Workstream A — Real OTP login

Existing `AlokShop::sendOtp/verifyOtp` (hashed OTP, 10 min TTL, rate limits, tries) reuse karo; delivery adapter (`msg91 | fast2sms | webhook`) already hai.

- **Important:** India mein SMS OTP ke liye DLT registration/approved template lagta hai, aur "bilkul free" real SMS OTP reliable nahi hota. Tum guess mat karo: current pricing/free-tier/terms **web par verify karo** (MSG91, Fast2SMS, Firebase Phone Auth, aur koi WhatsApp OTP option) aur user ko ek chhota comparison do (cost, setup time, DLT zaroorat, kal tak possible ya nahi). Recommendation do; jo kal tak sabse sasta aur jaldi chalne wala ho use wire karo.
- Adapter ko config-driven rakho (`public/api/config.php`, `config.php.example` update). API key kabhi repo mein commit mat karo.
- `demo` mode sirf **fallback** ke taur par rakho (provider key na ho to), clearly banner ke saath, aur production config mein `demo_code` kabhi response mein na aaye (test).
- Login = mobile → OTP → naam + address (line, city, state, pincode, optional GSTIN) → 30-din session (existing). Already signed-in ko OTP dobara nahi.
- Server-side: verified session ke bina enquiry/order submit reject. Rate limits barkarar. Mobile validation: 10-digit IN.
- Failure UX: OTP na aaye to resend (cooldown), saaf error, aur WhatsApp fallback.

## Workstream B — Live cart → Admin

- `public/api/cart.php`: upsert (debounced ~1.5 s) + GET own cart. `visitor_id` (localStorage); OTP verify ke baad cart customer se link. Best-effort, cart kabhi na tute (static preview par bhi).
- Cart line mein product slug, naam, variant, qty, unit, image, **availability at time of add**.
- Store: `carts` table (SQLite pattern from `core.php`, jsonl fallback). Status `open|submitted|abandoned` (24 h inactivity).
- Admin **"Live Carts"** page: list (customer naam/mobile/city, item count, last activity, abandoned badge) → detail (har line, qty, variant) → "WhatsApp follow-up" prefilled button. Auto-refresh polling ~5 s. Permission-gated.
- Privacy: OTP se pehle sirf anonymous cart; privacy page mein ek line.

## Workstream C — Enquiry + ENQ ID + WhatsApp

- Enquiry submit (logged-in customer): cart snapshot + customer + address → ek transaction mein save. Sequential `ENQ-1001+` (lock-safe), poore flow mein wahi ID. Existing `enquiries`/`orders` ko unify karo (migration script, dry-run, backup pehle); purana data na tute.
- Success screen: ENQ ID bada + auto-open `wa.me/<ALOK_WHATSAPP>?text=…` (button bhi, popup-blocker ke liye). Text: ID, naam, mobile, city, har line (product, variant, qty), "Please share quote." Length limit handle karo.
- Admin enquiry detail: customer + address + items + stage + notes + manual toggle "WhatsApp message received" (server ko pata nahi chalta ki customer ne Send dabaya).
- Stage machine (controlled transitions, audit log: kaun/kab/kya): `new → under_review → quote_sent → order_confirmed → payment_received → dispatched → invoiced → closed`, side: `cancelled`, `lost`, `on_hold`. Is demo mein pehle 4 stages fully wire karo; baaki ka data model + transitions ready rakho.
- Har stage par admin ko prefilled wa.me "click-to-send" button (templates config/Settings mein editable) + "Mark as sent" + messages log. Server se WhatsApp auto-send **nahi** (Business API paid hai).

## Workstream D — Admin product management (naye products + availability)

Existing admin Products (add/edit/move/remove) audit karo aur yeh gaps bharo:

- Fields: naam, slug, group (5 groups), description, specs, images (upload via existing `media.php`, size/type validation), tags, **availability** enum: `in_stock | limited | out_of_stock | made_to_order | hidden`, optional `stock_note` (e.g. "Ships in 3 days"), `moq`, `featured`.
- Website par: product list/search/cart/detail sab admin-added products turant dikhayein (existing runtime-data pattern: `src/lib/runtime-data.ts`, `runtime-schema.ts`). Availability badge cards + detail par. `out_of_stock` → add-to-cart disabled, "Enquire / Notify me" CTA. `hidden` → public lists/search/sitemap se bahar. `made_to_order` → lead-time note.
- Cart mein jo product baad mein out-of-stock/hidden ho jaye uski cart line par warning dikhe aur enquiry submit se pehle user ko batao.
- Admin audit log mein product create/edit/availability change. Role permission `products` (existing).
- Note the known limit (docs/orders-otp-careers.md): admin-added products static-generated nahi hote, SEO-indexed nahi jab tak `src/content/products.ts` mein add na ho. Isse client ko batane layak ek line `connection.md` mein likho.

## Workstream E — `connection.md` (deliverable)

Repo root mein: architecture diagram (Browser → `public/api/*.php` → data store → `public/admin/`), endpoint contract table (method, URL, auth, request, response, errors), step → website file → API → table/field → admin screen map, status machine + permissions, ID rules, config keys (`otp` provider, `$ALOK_WHATSAPP`, ENQ start), "Demo vs Production" notes, aur rule: "website field badle to doc + API validation + admin view teeno update karo." Purane docs ko isi par point karo; `CHANGELOG.md` update.

## Security (non-negotiable)

Prepared statements; escape sab output (admin views, WhatsApp text `rawurlencode`); CSRF admin POST par; rate limits (OTP, cart sync per visitor, enquiry); data dir web-root se bahar/deny; PII public folder mein nahi; uploads type/size validate, executable extensions reject; delete ki jagah cancel/void + audit; secrets repo mein nahi.

## Execution plan (har step ke baad verify)

1. Audit + gap-list + OTP provider research (user ko comparison) + `connection.md` skeleton.
2. DB schema + migrations (idempotent) + enquiry/order unification script.
3. OTP login wiring (A).
4. Cart sync + Live Carts (B).
5. Enquiry + ENQ ID + WhatsApp + admin detail/stages (C).
6. Product management + availability on site (D).
7. Docs (`connection.md`, changelog), 3-minute demo script, `scripts/seed-demo.php` + `reset-demo.php` (confirm maango prod data par chalane se pehle).

**Verification (har step):** `pnpm lint`, `pnpm build` (static export na tute), `php -l` har PHP file par, Playwright test (`tests/`) end-to-end: login (OTP mock/webhook in test) → cart → admin mein live dikhe → enquiry → ENQ ID → wa.me link sahi → admin product add + availability badal → website par reflect. Edge cases: galat/expire OTP, resend cooldown, double submit, empty cart, product delete/out-of-stock cart mein hote hue, concurrent ENQ ID, mobile viewport par admin. Kuch fail ho to root cause theek karo, test mat todo/skip karo. Browser mein asli dekh kar bhi check karo (dev server + screenshot), sirf tests par bharosa mat karo.

## Blockers (user se maango, guess mat karo)

OTP provider ka account/API key (+ DLT template agar zaroori), client ka WhatsApp number (`$ALOK_WHATSAPP`), kal ke demo ka host (local ya Hostinger). Jab tak na mile, `config.php.example` + `TODO(client)` rakho aur baaki kaam aage badhao.

## Final report

Kya bana, kya manual setup baaki hai (keys/number), 3-minute demo script, known limits (WhatsApp click-to-send, admin products SEO), aur Phase 2 (payment/dispatch/GST invoice polish, WhatsApp auto-send) mein kya aayega.
