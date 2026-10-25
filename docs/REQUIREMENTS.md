# Requirements Traceability & Decision Log

Every line of the brief is listed here with an ID, the place it is implemented, and how
it is verified. Status is updated as work lands. Anything the brief leaves open is
recorded in the **Decision Log**, with the reasoning, so it can be defended in review.

Status: `todo` · `wip` · `done`

## 1. Backend

| ID | Requirement (from brief) | Implementation | Verified by | Status |
|----|--------------------------|----------------|-------------|--------|
| R1 | Backend in Node.js/TypeScript (Express) | `backend/` | — | done |
| R2 | Persistent database (not in-memory) | PostgreSQL via Prisma | Integration tests against a real test DB | done |
| R3 | Users can register | `POST /api/auth/register` | `auth.register.test.ts` | done |
| R4 | Users can log in | `POST /api/auth/login` | `auth.login.test.ts` | done |
| R5 | Token-based auth (JWT) secures endpoints | `requireAuth` middleware | `auth.me.test.ts`, `middleware.requireRole.test.ts` | done |
| R6 | Add a vehicle | `POST /api/vehicles` (admin, see D2) | `vehicles.create.test.ts` | done |
| R7 | List vehicles | `GET /api/vehicles` | `vehicles.read.test.ts` | done |
| R8 | Search by make, model, category, price range | `GET /api/vehicles/search` | `vehicles.search.test.ts`, `unit/vehicle.search.test.ts` | done |
| R9 | Update a vehicle | `PUT /api/vehicles/:id` (admin, see D2) | `vehicles.update.test.ts` | done |
| R10 | Delete a vehicle (admin only) | `DELETE /api/vehicles/:id` | `vehicles.delete.test.ts` | done |
| R11 | Purchase decreases quantity | `POST /api/vehicles/:id/purchase` | `inventory.purchase.test.ts` | done |
| R12 | Restock increases quantity (admin only) | `POST /api/vehicles/:id/restock` | `inventory.restock.test.ts` | done |
| R13 | Vehicle has unique ID, make, model, category, price, quantity | Prisma `Vehicle` model | `vehicles.create.test.ts` (validation) | done |

## 2. Frontend

| ID | Requirement (from brief) | Implementation | Verified by | Status |
|----|--------------------------|----------------|-------------|--------|
| F1 | SPA with React, Tailwind, HTML5, CSS3 | `frontend/` (Vite, React 19, Tailwind 4, React Router) | Build in CI; `App.test.tsx` | done |
| F2 | Registration and login forms | `/register`, `/login` | `LoginPage.test.tsx`, `RegisterPage.test.tsx`, `session.test.tsx`; e2e `auth.spec.ts`, `shopper.spec.ts` | done |
| F3 | Dashboard listing vehicles | `/` (`InventoryPage`) | `InventoryPage.test.tsx`; e2e `shopper.spec.ts` | done |
| F4 | Search and filter vehicles | Filter bar on the dashboard, synced to the URL | `InventoryPage.test.tsx`, `MobileFilters.test.tsx`, `filters.test.ts`; e2e `shopper.spec.ts` | done |
| F5 | Purchase button, disabled at quantity 0 | `VehicleCard`, `PurchaseSheet` | `InventoryPage.test.tsx`; e2e `shopper.spec.ts` (sold-out car, buying two) | done |
| F6 | Admin forms to add, update and delete | Admin-only sheets and actions, plus restock | `AdminTools.test.tsx`; e2e `admin.spec.ts` | done |
| F7 | Visually appealing, responsive, good UX | Own visual identity (D35–D37), mobile tab bar and sheets | Screenshots (`docs/screenshots/`), research pack, e2e `accessibility.spec.ts` (axe, light and dark, phone width) | done |

## 3. Process & deliverables

| ID | Requirement | How | Status |
|----|-------------|-----|--------|
| P1 | TDD with a visible Red → Green → Refactor history | Separate `test:` / `feat:` / `fix:` commits; 30 red → green pairs in `git log` | done |
| P2 | High, meaningful test coverage | Backend 99% statements, frontend 94%, plus 17 e2e tests (`docs/TEST_REPORT.md`) | done |
| P3 | Clean code, SOLID, documented | Layered architecture (routes → controllers → services → Prisma), TSDoc on public functions, lint in CI | done |
| P4 | Frequent, descriptive commits | Commit rules in `WORKFLOW.md`; 100+ commits, each saying what changed and why | done |
| P5 | AI co-author trailer on AI-assisted commits | `Co-authored-by: Claude <noreply@anthropic.com>` on every AI-assisted commit. Six commits from the deployment session carry the equivalent `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>` (same address, so GitHub credits the same co-author); they are on `main` and are not rewritten | done |
| P6 | README: overview, setup, screenshots, My AI Usage, test report | `README.md` ("My AI Usage" still to be personalised by the author) | done |
| P7 | PROMPTS.md with raw chat logs | Word-for-word transcript export (`scripts/export_prompts.py`) | done |
| P8 | Public repository | GitHub (public) | done |
| P9 | (Optional) Deployed live app | https://car-dealership-inventory-system-gold.vercel.app (Vercel + Neon) | done |

## 4. Decision Log

| ID | Open question in the brief | Decision | Reasoning |
|----|----------------------------|----------|-----------|
| D1 | How does someone become an admin? | All sign-ups get role `USER`. One admin is created by the seed script from `ADMIN_EMAIL` / `ADMIN_PASSWORD`. Register ignores any `role` in the request body. | Letting users choose their own role is privilege escalation. A seeded admin is the usual pattern. |
| D2 | Only DELETE and restock are marked "Admin only", but the brief says the add/update UI is for admins | `POST` and `PUT /api/vehicles` are admin-only too | The server must enforce what the UI implies. Hiding a button is not authorisation. |
| D3 | Does "all available vehicles" mean only in-stock ones? | `GET /api/vehicles` returns every vehicle, out-of-stock included | The brief wants a Purchase button that is *disabled* at quantity 0, so out-of-stock cars must be visible. |
| D4 | How much does one purchase buy? | Optional body `{ "quantity": n }`, default 1, positive integer | Flexible, and the default keeps the simple case simple. |
| D5 | What stops stock going negative when two people buy at the same time? | One atomic conditional update (`quantity = quantity - n WHERE id = ? AND quantity >= n`) in a transaction that also writes the purchase record. If no row updates, return `409 Conflict`. | A read-then-write would let two buyers take the last car. The database must guarantee the stock rule. |
| D6 | Is a purchase recorded? | Yes: a `Purchase` table (user, vehicle, quantity, unit price at purchase time, total, timestamp). Powers a "My Purchases" page. | Inventory changes should leave an audit trail. Storing the price at purchase time keeps history correct after later price edits. |
| D7 | What happens to purchases when a vehicle is deleted? | Purchase keeps snapshot fields (make, model, unit price), and its vehicle link is set to `NULL` | Deleting stock must not erase sales history. |
| D8 | Vehicle fields beyond the required five | Adds `year`, `color`, optional `imageUrl` | Makes the UI look like a real dealership without changing the required contract. |
| D9 | Is category free text? | Fixed list: Sedan, SUV, Truck, Coupe, Hatchback, Convertible, Van, Electric | Keeps data clean, gives a reliable filter dropdown, and invalid values are rejected. |
| D10 | Search semantics | Query params `make`, `model`, `category`, `minPrice`, `maxPrice`, all optional and combined with AND. Make and model match case-insensitively on a substring; category matches exactly. `minPrice > maxPrice` → `400`. No params → everything. | Predictable behaviour that is straightforward to test. |
| D11 | How is money stored? | `Decimal(12,2)` in PostgreSQL, never a float | Floating point cannot represent money exactly. |
| D12 | ID format | UUID | Non-sequential IDs don't reveal how many vehicles or users exist, and can't be enumerated by counting up. |
| D13 | Error response shape | Always `{ "error": { "code", "message", "details?" } }` with correct HTTP status (400, 401, 403, 404, 409, 500) | The client can handle every error the same way, and no stack traces leak. |
| D14 | Auth details | bcrypt-hashed passwords, JWT (HS256, 1-day expiry) sent as `Authorization: Bearer`. Login failure gives the same generic message for wrong email or wrong password. The password hash is never returned. | Standard practice that doesn't reveal which emails are registered. |
| D15 | Input validation | zod schemas at the request boundary. Emails are normalised to lowercase. Password must be at least 8 characters. | One validation layer, and the error details come from the schema itself. |
| D16 | Does register log the user in? | Yes, `201` returns `{ token, user }` | One less step for the user in the UI. |
| D17 | Currency | INR (₹), formatted with Indian digit grouping (`en-IN`, e.g. ₹12,50,000) | Matches the target market. Only affects display; the API stores plain decimal amounts. |
| D18 | Deployment | **Vercel Services**: one Vercel project serves the Vite frontend and the Express API (`/api/*`) from the repo root, with Neon Postgres from the Vercel Marketplace. Replaces the earlier Neon + Render + Vercel plan. | The product owner imported the repo into Vercel. One project means one URL, no CORS, atomic deployments of both halves and previews where frontend and API always match. |
| D19 | Can PUT change stock? | No. `PUT` edits details only; stock changes only through purchase (−) and restock (+). Initial stock is set on create. | One controlled path per stock change, so every change is explained by a purchase or a restock. |
| D20 | How does the work reach `main`? | Pull request merged with a merge commit, never squashed | Squashing would erase the Red → Green → Refactor history reviewers look for. |
| D21 | Stateless JWT or DB check per request? | `requireAuth` verifies the token, then loads the user by primary key on every request. Role checks use the database role, not the token claim. | Deleting a user or changing a role takes effect immediately instead of at token expiry, and a deleted user gets a clean 401 instead of a foreign-key error. Cost: one indexed lookup per request. |
| D22 | Does re-running the seed reset the admin password? | No. The seed creates the admin if missing and leaves an existing admin untouched. If the email belongs to a regular user it **fails** instead of promoting it (audit fix). | Safe to run on every deploy, and nobody can gain admin rights by registering the admin email before the seed runs. |
| D23 | Password minimum (research: NIST SP 800-63B-4) | 15 characters for every password, including the seeded admin. Login never checks length, so existing accounts keep working. | NIST "SHALL require" 15 characters when the password is the only factor. Length beats composition rules. |
| D24 | Brute-force protection | Rate limiting per IP per 15 minutes: login counts failed attempts (10), registration counts every attempt (10) so accounts cannot be mass-created, returning `429` with a `Retry-After` header. `trust proxy` is configurable for deployment behind Render's proxy. | NIST "SHALL implement a rate-limiting mechanism". Without `trust proxy` every user behind the host's proxy would share one IP and one limit. |
| D25 | Can admins buy? | Yes (already the behaviour) | Admins are also staff who may record a sale. |
| D26 | Browse without signing in? | No: the brief marks vehicle endpoints as protected | Keeps the brief's contract. |
| D27 | Low stock | 1–3 units shows "Only N left"; 0 shows "Sold out" | Text, icon and colour together, so the state never relies on colour alone (WCAG 1.4.1). |
| D28 | Price format | Exact `₹12,50,000` (en-IN), with "≈ ₹12.5 lakh" as a secondary hint | Indian buyers think in lakh; the exact figure avoids ambiguity. |
| D29 | Purchase UX | Confirmation sheet with a quantity stepper (1 to min(stock, 100)) and a "Buy for ₹X" button. The stepper lives in the sheet, not on the card. | Confirm actions that cost large amounts of money (NN/g); keeps cards simple. |
| D30 | Delete UX | A confirmation that names the vehicle, with a red "Delete vehicle" button and no default focus on it | Specific labels prevent accidental destructive actions (NN/g). |
| D31 | Theme | Follows the operating system's light/dark setting, with no in-app toggle | Apple behaviour, and less UI to maintain. |
| D32 | Sorting and filters | Sort (Newest, Price ↑, Price ↓, Year) runs in the browser; single-select category; filters and sort kept in the URL | No API change needed for the current inventory size. |
| D33 | Name & visual language | App name **Showroom**. Apple-HIG-inspired design system (`docs/research/03-design-system.md`): system font stack, Lucide icons, WCAG-checked tokens. No Apple fonts, icons, names or marks. | The user asked for an Apple-quality look; SF Pro and SF Symbols are licensed for Apple platforms only. |
| D34 | Frontend `npm audit` reported Vitest 3.2 advisories (GHSA-82fw-gwwq-j7x9, GHSA-qxg6-89mg-rqv8, two critical tinypool advisories) | **Resolved in part:** upgraded to Vitest 4.1.11, the newest release that is outside the vulnerable range and meets the two-week rule. That removes tinypool and both critical advisories. One moderate advisory remains (`@vitest/mocker` ≤ 4.1.11, GHSA-xp26-3454-mjgp, Windows-only path handling in mock registration); its fix is in 4.1.12, released 2026-10-15, which meets the rule on 2026-10-29. | It affects only the local test runner, never the built SPA or the API. npm 10.9 crashes resolving Vitest 4's optional peers ("reading 'edgesOut'"), so the lockfile was regenerated once with npm 11.21.0; CI's `npm ci` on npm 10 installs from it unchanged. |
| D35 | Visual identity (supersedes the Apple-imitation parts of D33) | Applied `research/07-visual-identity.md`: Mona Sans, one Petrol hue with ink neutrals, four radii, hairline cards, rectangular buttons, painted "studio plate" car profiles, sentence-case copy. Accessibility rules from D33 still hold. | The product owner found the first UI looked AI-generated; research showed the defaults it used (system font, one radius, soft shadows, pastel tiles, the most common icon set) are the recognised tells. |
| D36 | Icon set | Original hand-drawn icons (`frontend/src/components/icons`), replacing Lucide and the researched Phosphor option | The product owner asked for hand-drawn icons in the spirit of the Claude desktop app. Drawing our own removes the most common icon set, avoids licence questions and gives the app its own character. |
| D37 | Car illustrations | Monochrome hand-drawn line art per body style (same stroke language as the icons, `currentColor`), replacing the painted silhouettes | The product owner asked for car drawings in the icon style without colour so they sit well in dark mode; single-colour strokes follow the theme automatically. |
