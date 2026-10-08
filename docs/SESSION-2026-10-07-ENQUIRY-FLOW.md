# Session notes — 7 Oct 2026: Website ⇄ Admin enquiry flow (demo build)

Yeh file is session ka poora record hai: kya maanga tha, kaunsi prompt files bani, kya build hua, kaise test karna hai, aur kya baaki hai.

## 1. Requirement (user ki taraf se)

Customer cart mein product daale → admin ko dikhe → customer naam + mobile + OTP + address se login / enquiry kare → WhatsApp par redirect → admin quote / confirm / payment / dispatch / GST invoice / close tak handle kare. Admin naye products add kare aur availability set kare. Website aur admin ke beech ka data connection `connection.md` mein documented ho. Kal client ko meeting mein dikhana hai (local demo).

## 2. Prompt files (docs/)

| File | Status |
|---|---|
| `docs/PROMPT-AGENT-DEMO-REAL-WIRING.md` | **Final demo prompt** (real OTP + live cart + enquiry + WhatsApp + admin products/availability) |
| `docs/PROMPT-ENQUIRY-ORDER-FLOW.md` | Bada vision prompt (Phase 2 ke liye; GST/partial payment/permissions/funnel tak) |
| `docs/PROMPT-ENQUIRY-FLOW-PHASE1-FREE.md` | Purana, superseded by `PROMPT-AGENT-DEMO-REAL-WIRING.md` |
| `connection.md` (root) | Website ⇄ admin wiring reference (endpoints, data flow, status machine, config) |
| `docs/SESSION-2026-10-07-ENQUIRY-FLOW.md` | Yeh file |

## 3. Jo build hua (code)

- `public/api/cart.php` (naya): live cart sync, visitor id se.
- `public/api/order.php`: address zaroori, `ENQ-1001+` sequential ID, cart ko `submitted` mark karta hai, `verified` flag.
- `public/api/auth.php`: OTP request/verify; config switch `skip` (OTP band) bhi joda, **default off, end-to-end test poora nahi hua**.
- `public/admin/lib/shop.php`: `ENQ` counter, status lifecycle (`pending → reviewing → quoted → confirmed → paid → dispatched → invoiced → closed`, `cancelled`), `stageMessage()` (WhatsApp templates), `nextInvoiceNo()` (`AP/2026-27/0001`).
- `public/admin/lib/shop_pages.php`, `index.php`, `views/carts.php` (naya), `views/order.php`, `views/orders.php`, `views/layout.php`: Live carts page, stage buttons, quote/payment/dispatch fields, WhatsApp "Send" button, address, verified badge.
- Website: `src/lib/auth-client.ts`, `src/components/cart/CartProvider.tsx` (CartSync), `CartPageClient.tsx` (address required, "Enquiry" wording), `CartAuth.tsx`.
- `CHANGELOG.md` updated. Kuch commit nahi kiya.
- Local config (git-ignored): `public/api/config.php` → `dev_mode=true`, `skip=false`, `ALOK_WHATSAPP=918401833848`, `ALOK_SITE_URL=http://127.0.0.1:8080`.

## 4. OTP ka sach

- Abhi **demo mode**: OTP SMS se nahi jaata, API response mein aata hai aur screen par pre-fill hota hai.
- Asli SMS ke liye provider zaroori (kuch bhi free nahi). Search se mila: Fast2SMS ₹50 welcome bonus (testing), minimum recharge ₹100, DLT route ~₹0.35/OTP (DLT ke saath ₹0.11–0.25), bina-DLT Quick route ~₹5/SMS; Firebase phone auth roz 10 SMS free, baaki paid + billing account. Rates unki site par dubara verify karna.
- Fast2SMS lagane ke liye `public/api/config.php`:
  `$ALOK_OTP = ['provider' => 'fast2sms', 'key' => '<API KEY>', 'template' => '', 'webhook' => '', 'dev_mode' => false, 'skip' => false];`
  Key repo mein commit mat karna.

## 5. Kaise test karein (local)

1. PowerShell:
   ```
   cd "C:\Users\harshil patel\OneDrive\Desktop\plastic 2"
   C:\xampp\php\php.exe -S 127.0.0.1:8080 -t out
   ```
   Window khuli rehni chahiye. (`out/` pehle se built hai. Code badla ho to pehle `npx next build`.)
2. Website: `http://127.0.0.1:8080`, Admin: `http://127.0.0.1:8080/admin/` (user `owner`, apna password).
3. Customer: `/products/` se 2–3 products cart mein → admin ke **Live carts** mein turant dikhna chahiye (8 sec auto-refresh).
4. `/cart/` → naam `Harshil Patel`, mobile `8401833848` → Continue/OTP (khud bhar jaata hai) → Verify → address → **Submit enquiry** → `ENQ-1001` + WhatsApp tab (prefilled).
5. Admin → Orders → `ENQ-1001` → "Next step" buttons: Under review → Quote sent (amount) → Order confirmed → Payment received (amount) → Dispatched (LR no.) → GST invoice issued → Closed. Har stage par "Send on WhatsApp".
6. Products: Admin → Products mein availability "Out of stock" karo → website par Add to cart band hona chahiye.
7. Test ke baad data saaf: `out/admin/data` folder delete.

Maine khud chalaya (browser + curl): cart sync, login + OTP, ENQ-1001, WhatsApp link, admin ke saare stages. **Nahi chalaya:** product add/availability, mobile layout, phone par asli WhatsApp send.

## 6. Baaki kaam (baad mein)

- Asli SMS OTP (Fast2SMS key) aur client ka WhatsApp number (`$ALOK_WHATSAPP`).
- Printable GST invoice (abhi sirf number + message), partial payment, quote versions, role permissions, dashboard funnel (`PROMPT-ENQUIRY-ORDER-FLOW.md` mein).
- Admin se add kiye products SEO-index tabhi honge jab `src/content/products.ts` mein bhi add hon.
- Live par `dev_mode` kabhi on mat rakhna.
- Git commit abhi pending hai.
