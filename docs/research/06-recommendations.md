# 06 · Recommendations: build spec

The research in 01–05, turned into decisions for **this** app and a 1–2 day deadline.
Every brief requirement (R1–R13, F1–F7, P1–P9 in `REQUIREMENTS.md`) stays in **Must**.
Evidence links point to the detailed files; `Qn` refers to the open questions in §5.

## 0. The ten decisions that matter most

1. **Budget-first browsing.** Min/max ₹ price, category chips, make/model search, a result count, removable filter chips, "Clear all", all in the URL ([02 §1](02-ux-patterns.md#1-search-and-filtering)).
2. **Sort by price.** Newest, Price ↑, Price ↓, Year. Done client-side, so no API change is needed now ([02 §2](02-ux-patterns.md#2-sorting)).
3. **Purchase is a confirmation sheet**, not a one-click action: quantity stepper, total in ₹, button "Buy for ₹X", disabled while pending, `409` handled in place ([02 §5](02-ux-patterns.md#5-purchase-flow-high-value-action)).
4. **Stock state is text + icon + colour** on every card: In stock · N / Only N left / Sold out. Sold-out cars stay visible with a disabled "Sold out" button (D3, F5).
5. **Specific delete confirmation**: "Delete 2024 Hyundai Creta?" with a red "Delete vehicle" button and a note that purchase history is kept (D7) ([NN/g 2018](https://www.nngroup.com/articles/confirmation-dialog/)).
6. **Accessible colour tokens.** Apple's stock blues fail 4.5:1 with white text, so use `#0066CC` (5.57:1) and `#6C6C70` for secondary text ([03 §5](03-design-system.md#5-colour)).
7. **System font stack only.** Never ship SF Pro or SF Symbols (licence); use Lucide icons ([03 §9](03-design-system.md#9-licensing-and-trademark-rules-do-not-skip)).
8. **Mobile-first.** Bottom-sheet filters and purchase, 44px targets. India's web traffic was 64–82% mobile, Sep 2025–Sep 2026 ([01 F10](01-users-and-market.md#1-key-findings)).
9. **Translucent nav bar only.** Cards stay solid. Dark mode follows the OS, with no toggle ([03 §5.3, §6](03-design-system.md#53-dark-mode)).
10. **Auth hardening is cheap and visible**: rate-limit auth routes; decide on the NIST 15-character minimum (Q1) ([04 §2](04-accessibility-security-performance.md#2-authentication-ux-and-security)).

## (a) User stories with acceptance criteria

### Shopper (P2 "Arjun")

**US-S1 · Register.** As a shopper I want to create an account so I can browse and buy.
- Fields Name, Email, Password with visible labels and `autocomplete` (`name`, `email`, `new-password`).
- Password shows its rule up front ("At least 8 characters", or 15 per Q1) and has a Show/Hide toggle. Paste works.
- Errors appear under the field after blur or submit. On submit with errors, focus moves to the first invalid field.
- `409` → under Email: "An account with this email already exists." plus a "Sign in instead" link.
- Success → signed in (D16) → `/` with toast "Welcome, {first name}".

**US-S2 · Sign in.**
- `401` → one message above the form: "That email and password don't match. Check them and try again." Email kept, password cleared, focus on Password.
- Submit is disabled and shows a spinner while pending. A double Enter sends one request.
- If redirected because the session expired: banner "Your session has ended. Sign in again to continue." After sign-in, return to the original page.

**US-S3 · Browse inventory.**
- The grid shows every vehicle, including sold out (D3), newest first by default.
- Each card shows image or category placeholder, make + model, year · colour · category, price as `₹12,50,000` (en-IN), and a stock badge.
- First load shows skeleton cards (after 300ms); an API failure shows "Couldn't load vehicles" + "Try again".
- Result count "N vehicles" is visible and announced politely.

**US-S4 · Filter and search.**
- Make and model text search (300ms debounce, case-insensitive substring, D10), category chips (single-select, "All" default), Min ₹ and Max ₹.
- Every active filter appears as a removable chip; "Clear all" resets everything.
- Filters and sort live in the URL; reload and Back keep them.
- Min > Max: inline message "Min price must be less than max price" and **no request is sent** (avoid the API `400`).
- Zero results: "No vehicles match these filters" + chips + "Clear filters" button.
- Mobile (< 768px): a "Filters" button with an active-count badge opens a bottom sheet with "Show results" and "Reset".

**US-S5 · Sort.**
- Options: Newest (default), Price: Low to High, Price: High to Low, Year: Newest First. Stored as `?sort=`.

**US-S6 · Purchase.**
- Purchase on a card opens the purchase sheet (no request yet).
- The sheet shows the vehicle summary, unit price, a quantity stepper (1 to min(stock, 100); default 1), and a live total.
- Primary button: "Buy for ₹{total}". Secondary: "Cancel". No default focus on Buy; initial focus on the stepper.
- While pending: button disabled, "Buying…", Esc and Cancel disabled.
- `201` → sheet closes, the card's stock updates from the response `vehicle`, toast "Purchased {qty} × {make} {model}" with a "View purchases" action.
- `409` → inline in the sheet: "Only {n} left. Someone else just bought one." The stepper clamps to n (or shows "Sold out" and disables Buy if n = 0), and the vehicle refetches.
- `404` → close the sheet, show an inline notice on the page "This vehicle is no longer available", and refetch.
- At quantity 0 the card button reads "Sold out" and is disabled (F5).

**US-S7 · My purchases.** (Should)
- `/purchases` lists newest first: date (en-IN, e.g. "25 Oct 2026, 3:42 pm"), vehicle (snapshot make + model, D7), quantity, unit price, total.
- Empty: "No purchases yet" + "Browse inventory" button.
- Mobile shows stacked rows; desktop a `<table>` with `<th scope="col">`.

### Admin (P1 "Ritu")

**US-A1 · See stock health at a glance.**
- Same grid as shoppers, plus per-card admin actions: Edit, Restock, overflow ⋯ → Delete.
- Low (1–3, Q4) and Sold out badges are visible without opening anything.
- (Could) Summary strip above the grid: "48 units · 3 low · 2 sold out", with a segmented filter **All · Low stock · Sold out**.

**US-A2 · Add a vehicle.**
- The "Add Vehicle" button in the page header opens the vehicle sheet with an empty form.
- Fields: Make, Model, Category (select), Year, Colour, Price (₹), Initial stock, Image URL (optional) with a live preview.
- Validation mirrors the API (DESIGN §4) on the client; server `400` details map onto fields.
- Save → sheet closes, new card appears first, toast "Added {make} {model}".

**US-A3 · Edit a vehicle.**
- Same sheet, pre-filled, title "Edit Vehicle". **No stock field** (D19); helper text "To change stock, use Restock."
- Save is disabled until something changes. Cancel with changes asks "Discard changes?" (Should).

**US-A4 · Restock.**
- Restock opens a small sheet: current stock, "Units to add" stepper (1–10,000), preview "12 → 17".
- Success → badge updates, toast "Restocked {make} {model}: 17 in stock".
- Sold-out cards show **Restock** as the admin's primary action.

**US-A5 · Delete.**
- ⋯ → Delete opens an alert dialog: title "Delete {year} {make} {model}?", body "It will be removed from inventory. Past purchases stay in purchase history.", buttons "Cancel" (focused) and red "Delete Vehicle".
- Pending: button disabled. `204` → card removed, toast "Deleted {make} {model}". `404` → treat as already deleted and refetch.

**US-A6 · Admin controls are hidden for users** (F6), and the API enforces it anyway (D2). A test asserts that the buttons are absent for `USER`.

### Reviewer (P3)

**US-R1** · README states the admin credentials source (`ADMIN_EMAIL`/`ADMIN_PASSWORD`), includes light and dark screenshots of each screen, and lists how each F-requirement can be tried in under 5 minutes.

## (b) Must / Should / Could (1–2 days)

| Tier | Item | Why (evidence) | Est. |
|------|------|----------------|------|
| **Must** | App shell: sticky translucent nav, routes, auth guard, API client with 401 → login + expiry banner | F1, F2; 04 §2.2 | 2h |
| Must | Login + Register screens (US-S1, S2) with labels, autocomplete, Show password, inline errors, pending state | F2; NIST, WCAG 3.3.8 | 2h |
| Must | Design tokens (03 §10) incl. dark values, since they cost almost nothing once tokens exist | F7; HIG Dark Mode | 1h |
| Must | Inventory grid + VehicleCard (US-S3) with stock badges, ₹ en-IN, image fallback, skeleton, error + retry | F3, F5; Baymard list items | 3h |
| Must | Filter bar (US-S4): make/model search, category chips, min/max ₹, result count, applied chips, Clear all, URL sync, empty state | F4, R8; Baymard filters | 3h |
| Must | Purchase sheet (US-S6) with stepper, total, confirm, pending, 409/404 handling, toast | F5, R11; NN/g confirmation; WCAG 3.3.4 | 2.5h |
| Must | Admin: Add/Edit sheet, Restock sheet, Delete alert (US-A2 to A6) | F6, R6, R9, R10, R12 | 4h |
| Must | A11y baseline: focus ring, dialog keyboard pattern, live regions, 44px targets, reduced motion | F7; WCAG 2.2 AA | built in |
| Must | Component tests (Vitest + RTL + MSW) for the above, incl. "Purchase disabled at 0" and "admin buttons hidden for users" | P1, P2 | throughout |
| **Should** | Client-side sort (US-S5) | Baymard sort types | 0.5h |
| Should | My Purchases page (US-S7) | D6; DESIGN Should | 1.5h |
| Should | Mobile filter bottom sheet + mobile tab bar | 01 F10; HIG Tab bars | 2h |
| Should | Rate limiting on `/api/auth/*` (backend) | NIST "SHALL implement a rate-limiting mechanism" | 0.5h |
| Should | `q` search param (make OR model, one box) (backend) | Users type "Hyundai Creta" into one field | 1h |
| Should | "Discard changes?" guard on dirty sheets | HIG Sheets | 0.5h |
| Should | Lighthouse + axe pass, scores in README | CWV targets 04 §3 | 1h |
| **Could** | Admin summary strip + segmented All / Low / Sold out | Lotlinx: aging inventory is the top challenge (67%) | 1h |
| Could | "In stock for N days" on admin cards (from `createdAt`) | FADA aged stock; Lotlinx | 0.5h |
| Could | Per-category counts on chips (from the cached unfiltered list) | Baymard counts | 1h |
| Could | "Hide sold out" toggle (client-side) | Baymard special-purpose filters | 0.5h |
| Could | Multi-select category (API accepts a comma list) | Baymard multi-select (14% don't) | 1.5h |
| Could | Common-password blocklist | NIST SHALL (blocklist) | 1h |
| Could | Idempotency-Key on purchase | IETF draft; double-submit defence in depth | 3h |
| Could | Playwright e2e: register → search → buy; admin add → edit → restock → delete | DESIGN Could | 3h |
| **Won't (now)** | Pagination/"Load more", vehicle detail page, EMI calculator, km/owner fields, reviews or ratings sort, web font | No data or no need at kata scale; avoid fake trust signals (01 §4) | — |

Must total ≈ 17.5h of frontend work. Tight for 1–2 days, but feasible because the backend is nearly done.
**If time runs short, cut in this order:** mobile tab bar → dirty-sheet guard → `q` param → My Purchases (Should in DESIGN).

## (c) Backend / API changes the research suggests

| # | Change | Research basis | Effort | Do it now? |
|---|--------|----------------|--------|------------|
| B1 | **Rate limiting** on `POST /api/auth/login` and `/register` (e.g. `express-rate-limit`, 10/min/IP on login), returning `429` in the standard error shape | NIST 800-63B-4 SHALL; OWASP | S | **Yes (Should).** One middleware + one test. |
| B2 | **Password minimum 15** (zod) + update seed/env example + tests | NIST: 15 for single-factor | S | **Decide (Q1).** Recommended yes. |
| B3 | **`q` param** on `/search`: case-insensitive substring on make OR model; multiple words AND-ed | Single search box; Baymard search persistence | S | Should. Keep `make`/`model` params (R8 tests). |
| B4 | **Sort param** `sort=newest|price_asc|price_desc|year_desc` on list and search | Baymard: price is the most used sort | S | **Not now.** Sort client-side; add the param only with pagination. |
| B5 | Result count in the response (`{ vehicles, total }`) | Baymard counts | S | **Not now.** `vehicles.length` is the count without pagination. |
| B6 | Low-stock flag / threshold | Lotlinx, FADA | S | **Not now.** Derive client-side with `LOW_STOCK_THRESHOLD = 3` (Q4). Move server-side only if several clients need it. |
| B7 | Per-category facet counts endpoint | Baymard: counts are high impact | M | No. Use the Could client-side approach. |
| B8 | Multi-value `category=SUV,SEDAN` | Baymard multi-select | S | Could. |
| B9 | `Idempotency-Key` on purchase | IETF draft-07 (2025) | M | No. D5's atomic update stops overselling; the UI blocks double submit. Mention it in the README as future work. |
| B10 | Common-password blocklist on register | NIST SHALL | S | Could. |
| B11 | Public read (`GET /api/vehicles` without auth) | Baymard: forced account creation causes abandonment (19% in a checkout context, 2017) | S | **No (Q3).** The brief and DESIGN make every vehicle endpoint authenticated. |
| B12 | Pagination | Baymard "Load more" | M | No. Not needed at kata scale. |

## (d) Screen-by-screen UI spec

Tokens and components are from [03](03-design-system.md). Breakpoints: `sm` 640, `md` 768, `lg` 1024, `xl` 1280.

### D1 · App shell

- `<header>` sticky, `material-bar`, 56px. Left: wordmark "Showroom" (Q9). Desktop right: nav links "Inventory", "My Purchases" (`aria-current`), account button (initials avatar + name + "Admin" badge) → menu with "Sign out".
- Mobile: header shows the wordmark and account button only; the **tab bar** (Should) holds Inventory · Purchases · Account. Without the tab bar, the links go into the account menu.
- `<main id="main">` with a "Skip to content" link as the first focusable element.
- Page header inside `<main>`: `text-large-title` (`text-title1` on mobile) "Inventory"; admin gets the tinted "Add Vehicle" button on the trailing side.

### D2 · Login (`/login`)

- Centred card (`--surface`, radius 28, max-width 400, padding 32/24) on `--bg`. App wordmark above it.
- Title "Sign in" (`text-title1`), subtitle "Browse and buy from our showroom." (`--label-2`).
- Email (`type=email`, `autocomplete=email`, `inputMode=email`), Password (`autocomplete=current-password`) + Show button.
- Primary `lg` full-width "Sign In". Footer: "New here? Create an account" link.
- Error block above the fields: `--danger-tint` bg, icon, text, `role="alert"`.

### D3 · Register (`/register`)

- Same layout. Title "Create account". Fields Name, Email, Password (`new-password`) + helper "At least 8 characters" (or 15, Q1) + Show button.
- Primary "Create Account". Footer: "Already have an account? Sign in".
- No "confirm password" field: the Show toggle replaces it (fewer fields; NIST "display the password").

### D4 · Inventory / dashboard (`/`)

Layout, top to bottom:
1. Page header (D1).
2. **Filter bar** (D6).
3. Results row: count "24 vehicles" (`text-subhead`, `--label-2`, `aria-live=polite`) · applied chips · "Clear all" (plain) · trailing **Sort** select.
4. **Grid** of VehicleCards: 1/2/3/4 columns at <640/≥640/≥1024/≥1280; gap 16/24.
5. States:
   - Loading (first time): 8 skeleton cards, `aria-busy`, after a 300ms delay.
   - Refetching: keep cards, faint top progress bar (2px `--accent`), no skeleton.
   - Error: centred panel, icon, "Couldn't load vehicles", "Check your connection and try again.", tinted "Try Again".
   - Empty (no filters): admin "No vehicles yet" + "Add Vehicle"; user "No vehicles in the showroom yet. Check back soon."
   - No results: "No vehicles match these filters", the active chips, filled "Clear Filters".

### D5 · VehicleCard

- `<article aria-labelledby="v-{id}-title">`, `bg-surface rounded-card shadow-card p-2`.
- Media: 16:10, radius 12. `imageUrl` → `<img alt="{year} {make} {model} in {colour}" loading="lazy" decoding="async">`, first 4 cards eager. On error or missing → category tile (`--surface-2` bg + 48px Lucide icon + category name).
- Stock badge overlaid top-right on the media: In stock · N / Only N left / Sold out (03 §8.6).
- Body (padding 8px → 16px total inset):
  - `<h2 id=…>` make + model, `text-title3` 600, max 2 lines.
  - Meta: "2024 · White · SUV", `text-subhead` `--label-2`.
  - Price: `₹12,50,000`, `text-title3` 600, `tabular-nums`. (Optional hint "≈ ₹12.5 lakh", Q5.)
- Actions (user): filled `md` "Purchase" full width. When `quantity === 0`: disabled "Sold out" button + footnote "Check back after restock".
- Actions (admin): the row above + a plain `sm` row: "Edit" (pencil), "Restock" (package-plus), ⋯ menu with "Delete" (`destructive-plain`). Sold out → "Restock" becomes the filled primary.
- Pointer hover: `shadow-card-hover`, 200ms. Never a hover-only action.
- **Note:** the quantity stepper lives in the purchase sheet, not on the card. This keeps cards clean and the decision deliberate (DESIGN §5 put it on the card; this spec moves it).

### D6 · Filter bar

- **Desktop (≥ 768px)**: one row in a `--surface` rounded-card container, padding 12:
  - Search field (flex-1, magnifier icon, clear ×, placeholder "Make or model", label visually hidden but present). Until B3 lands: two fields, "Make" and "Model".
  - Min ₹ and Max ₹ fields (width 140, ₹ prefix, `inputMode=numeric`, grouping on blur, labels "Min price" / "Max price").
  - Row 2: category chips `All · Sedan · SUV · Hatchback · Coupe · Convertible · Truck · Van · Electric` as `role="radiogroup"`, horizontally scrollable, selected chip = `--accent` bg + white text, others `--surface-2`.
  - Applies live with a 300ms debounce. Invalid min/max shows an inline error and sends no request.
- **Mobile (< 768px)**: search field + a "Filters" tinted button with a count badge. Category chips stay visible as a scroll row (one tap). Price lives in a **bottom sheet** "Filters" with Min/Max, Sort, "Reset" (plain) and "Show Results" (filled lg; Should: "Show 12 vehicles" with a live count).
- Mapping: no filters → `GET /api/vehicles`; any filter → `GET /api/vehicles/search?…` (DESIGN §5). Category chip "All" omits the param.

### D7 · Purchase sheet

- Trigger: Purchase on a card. Mobile bottom sheet / desktop 480px dialog. `aria-labelledby` = title.
- Header: "Confirm Purchase" (`text-title2`), leading "Cancel" (plain).
- Summary row: 72×45 thumbnail (radius 8), "Hyundai Creta", "2024 · White · SUV", stock badge.
- Rows (grouped list, `--surface-2`, radius 12, hairline separators):
  - "Price per vehicle" → ₹12,50,000
  - "Quantity" → stepper `[–] 1 [+]` (44px buttons, `aria-label` "Decrease/Increase quantity", input `type=number` min 1, max min(stock,100)); helper "{stock} available".
  - "Total" → `text-title3` 600, ₹ total (`aria-live=polite`).
- Footer: filled `lg` "Buy for ₹12,50,000" (full width on mobile). Pending → "Buying…" + spinner, disabled.
- Error area above the footer (`role="alert"`): 409/404/network messages from US-S6.
- Fine print (`text-footnote`, `--label-2`): "Demo checkout. No payment is taken." (Honest about kata scope; P3 reviewer.)

### D8 · Admin add/edit sheet

- Title "Add Vehicle" / "Edit Vehicle"; leading Cancel, trailing filled "Save" (also a sticky footer on mobile).
- Two-column grid ≥ 640px; one column on mobile:
  - Make*, Model* (`maxLength=50`)
  - Category* (select with display names), Year* (`inputMode=numeric`, 1886 to next year)
  - Colour* (text, 1–50), Price (₹)* (> 0, ≤ 2 decimals)
  - Initial stock* (**create only**, 0–10,000) | Edit: read-only "Stock: 12 · use Restock to change"
  - Image URL (optional, `type=url`, http(s)) + 16:10 preview tile with fallback
- `*` explained once at the top: "All fields are required unless marked optional." (Prefer marking the optional field instead: "Image URL (optional)".)
- Validation: zod schema shared in spirit with the backend; map server `400` `details` onto fields.
- Save disabled while pending or (edit) when unchanged. Success toast. Dirty + Cancel/Esc → "Discard changes?" alert (Should).

### D9 · Delete confirmation

- `role="alertdialog"`, 400px, centred on all sizes.
- Title: "Delete 2024 Hyundai Creta?"
- Body: "It will be removed from inventory. Past purchases stay in purchase history."
- Buttons: "Cancel" (plain, **initial focus**) on the leading side · "Delete Vehicle" (`destructive` filled) on the trailing side. Mobile: stacked, Delete on top, Cancel below.
- No type-to-confirm (NN/g reserves it for the rarest, most dangerous actions).

### D10 · Restock sheet

- Title "Restock"; summary row as in D7.
- "Units to add" stepper (1–10,000, default 1, direct typing allowed), preview line "Stock after restock: 12 → 17" (`aria-live=polite`).
- Filled "Add {n} Units". Success toast "Restocked Hyundai Creta: 17 in stock".

### D11 · My Purchases (`/purchases`)

- Page title "My Purchases"; subtitle "{n} purchases · ₹{sum} total".
- Desktop `<table>`: Date | Vehicle | Qty | Unit price | Total (right-aligned, `tabular-nums`); rows 56px; hairline separators; `<caption class="sr-only">Your purchase history</caption>`.
- Mobile: grouped list rows: title "Hyundai Creta × 2", subtitle date, trailing total.
- A deleted vehicle still shows its snapshot name (D7) with a "No longer listed" badge.
- Empty state: "No purchases yet" + "Browse Inventory".
- Dates: `Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' })`.

### D12 · Copy and formatting rules

- Currency: `new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })`. Show paise only if non-zero.
- Category display names: Sedan, SUV, Truck, Coupe, Hatchback, Convertible, Van, Electric.
- Button labels: title case and verbs ("Add Vehicle", "Save", "Delete Vehicle"). Messages: sentence case, no blame, say how to fix ([NN/g 2023](https://www.nngroup.com/articles/error-message-guidelines/)).
- Never "OK" on a confirm button ([HIG Alerts](https://developer.apple.com/design/human-interface-guidelines/alerts)).

## (e) Open questions for the product owner

| # | Question | Options | **Recommended answer** | Why |
|---|----------|---------|------------------------|-----|
| Q1 | Password minimum: keep 8 or raise to 15? | 8 (current D15) · 15 · 12 | **Raise to 15** if the backend agent can update the schema, tests and seed in about 30 minutes. Otherwise keep 8 and add a README line: "NIST SP 800-63B-4 asks for 15 for single-factor passwords; kept at 8 for demo convenience." | NIST 800-63B-4 SHALL (04 §2.1). Reviewers who know NIST will notice. |
| Q2 | Can admins also buy cars? | Yes · No (hide Purchase for admins) | **Yes.** The API allows it, and hiding it adds a code path and confuses demos. | Simpler, consistent. |
| Q3 | Should browsing work without signing in? | Keep auth on all vehicle endpoints · public GET | **Keep auth** (as built). Mention public browsing as future work. | DESIGN §4 contract and tests; brief scope. |
| Q4 | What counts as "Low stock"? | ≤ 3 · ≤ 5 · % of initial | **1–3 units** (`LOW_STOCK_THRESHOLD = 3`, one frontend constant). | Car quantities per model are small; 3 reads naturally as "Only 3 left". |
| Q5 | Price format: exact (₹12,50,000) or lakh shorthand (₹12.5 Lakh)? | Exact · shorthand · both | **Exact as primary** (D17), optional muted "≈ ₹12.5 lakh" on cards only. | Exactness for a purchase; Indian portals use lakh shorthand (01 §4). |
| Q6 | Max quantity per purchase in the UI? | min(stock, 100) · min(stock, 10) · always 1 | **min(stock, 100)**, matching the API (D4), default 1. | No hidden rule that differs from the API. |
| Q7 | Delete: simple confirm or type-to-confirm? | Simple specific confirm · type name | **Simple, specific confirm.** | NN/g: type-to-confirm only for the rarest, most dangerous actions; history is kept (D7). |
| Q8 | Dark mode: follow OS, or add a toggle? | OS only · toggle | **OS only, no toggle.** | HIG: avoid app-specific appearance settings; less code. |
| Q9 | Product name and wordmark? | e.g. "Showroom", "Autovault", your choice | **"Showroom"** (generic, no trademark issues). Never Apple names or marks. | 03 §9. |
| Q10 | Keep `409 EMAIL_TAKEN` on register (reveals that an account exists)? | Keep · generic message | **Keep**, plus rate limiting (B1). Note the trade-off in the README. | Clear UX wins at kata scale; OWASP risk is mitigated by throttling. |
| Q11 | Category filter single or multi-select? | Single (API today) · multi (B8) | **Single now**; multi-select is a Could. | Fits the deadline; the API matches. |
| Q12 | Purchase quantity stepper on the card (DESIGN §5) or in the sheet? | Card · sheet | **Sheet only.** | Cleaner cards, a deliberate decision, one place to show the total (NN/g confirmation). |
| Q13 | Mobile tab bar or top links only? | Tab bar · top links | **Tab bar if time allows (Should)**; top links + account menu are the fallback. | HIG tab bars for top-level sections; mobile majority in India. |
| Q14 | Seed vehicle photos? | Free-licensed photo URLs · category icons only | **Category icons by default**; add 4–6 free-licensed photos (with attribution in the README) only for screenshots. | Avoids copyright issues and broken hotlinks. |
