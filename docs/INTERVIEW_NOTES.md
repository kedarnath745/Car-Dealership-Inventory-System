# Interview notes

Talking points for walking an interviewer through Showroom. Every answer points to the code or
document that backs it up, so you can open the file and show it.

## 1. A five-minute demo

1. **Sign-in page.** "One generic error for any failed login, and the password needs 15+
   characters because NIST SP 800-63B-4 requires it for password-only logins." (D23)
2. **Register a shopper** and land on the inventory. Point out:
   - prices in ₹ with Indian grouping and the lakh hint;
   - the stock line: dot plus text, never colour alone;
   - the hand-drawn car drawings.
3. **Filter:** pick SUV, set a max price, sort by price. "Filters live in the URL, so this view is
   shareable. A bad link is cleaned up instead of hanging the page."
4. **Buy two units.** "The quantity and total are confirmed in a sheet, because buying a car is a
   high-value action (NN/g)."
5. **Sign in as admin:**
   - add a car;
   - edit its price ("only changed fields are sent");
   - restock ("8 → 13" preview);
   - delete it ("the confirmation names the car; past purchases are kept").
6. **Resize to phone width and switch to dark mode:** tab bar, price sheet, and the line art follows the theme.

## 2. Architecture in one breath

React SPA → `/api` on the same origin → Express app (`createApp()` builds it without listening,
so Supertest can test it) → middleware (`requireAuth` → `requireRole` → `validateBody`) →
controllers (HTTP only) → services (business rules) → Prisma → PostgreSQL. One error handler turns
everything into `{ error: { code, message, details? } }`. (`docs/DESIGN.md`)

## 3. Decisions worth explaining (from `docs/REQUIREMENTS.md`)

| Question | Answer | Where |
|----------|--------|-------|
| How does someone become admin? | Seeded from env vars; registration ignores any `role` field. The seed refuses to promote an existing user, so registering the admin email first doesn't work. | D1, D22, `seedAdmin.ts` |
| Why are add/edit admin-only when the brief only says delete/restock? | The brief puts the add/edit UI under admin. The server must enforce what the UI implies, because hiding a button isn't authorisation. | D2 |
| How do you stop two people buying the last car? | One conditional `UPDATE … SET quantity = quantity - n WHERE id = ? AND quantity >= n` inside a transaction that also writes the purchase. If no row matched, re-read only to choose 404 / OUT_OF_STOCK / INSUFFICIENT_STOCK. Plus a DB `CHECK (quantity >= 0)`. | D5, `inventory.service.ts` |
| How do you know the race test works? | It was run against a naive read-then-write version and caught the oversell; then it passed 8 of 8 runs on the real one. | `TEST_REPORT.md` |
| Why re-read the user on every request? | So a deleted user or a changed role takes effect immediately, not at token expiry. Cost: one primary-key lookup. | D21, `requireAuth.ts` |
| Why can't PUT change quantity? | Stock has exactly two paths: purchase (−) and restock (+), so every change has a cause. | D19 |
| Why Decimal for price? | Floats can't represent money exactly. The review also found a float-tolerance bug in validation, now fixed with an exact paise check. | D11 |
| Why is the JWT in localStorage? | It's simple Bearer auth that matches the brief's "token-based". An httpOnly cookie is safer but needs CSRF protection. React escapes output and there's no `dangerouslySetInnerHTML`. | DESIGN §5 |
| Why PostgreSQL + Prisma? | The data is relational (users, vehicles, purchases), with transactions and constraints. Prisma gives typed queries and migrations. | Phase 0 |

## 4. Questions they may ask

- **"Walk me through a request."** Use `POST /api/vehicles/:id/purchase`:
  1. `requireAuth` verifies the JWT (HS256 pinned) and loads the user.
  2. `validateParams` checks the UUID and `validateBody` checks the quantity.
  3. The controller calls `purchaseVehicle(userId, id, qty)`.
  4. The transaction runs the conditional update and the purchase insert.
  5. The response is `201 { purchase, vehicle }`.
- **"How did you test the frontend?"** The whole app is rendered (router + providers) against a
  mocked API (MSW), and the tests assert what users see: roles, labels and accessible names. No
  implementation details. (`frontend/src/**/*.test.tsx`)
- **"What does red → green look like in your history?"** Show a `test:` commit followed by its
  `feat:`/`fix:` commit with `git log --oneline`. Be clear that tooling, style, docs and visual
  screenshot fixes had no red step.
- **"What would you do next?"**
  - Pagination.
  - A shared rate-limit store (Redis).
  - An idempotency key on purchase before real payments.
  - An httpOnly-cookie session.
  - Playwright end-to-end tests in CI.

## 5. AI usage: what to say (be specific and honest)

- **Tool:** Claude Code (Anthropic), one long session with checkpoints. `PROMPTS.md` has the
  full conversation, word for word.
- **What I decided:**
  - the stack;
  - every ambiguity in the brief (D1–D37, each approved at a checkpoint);
  - that research should come before screens;
  - that the first UI looked AI-generated and needed its own identity;
  - hand-drawn icons and monochrome car art;
  - deploying with Vercel.
- **What the AI did:**
  - wrote the tests and the code;
  - ran research agents and the code and security reviews;
  - captured screenshots;
  - drafted the docs.
  Every AI-assisted commit has a co-author trailer.
- **Where it went wrong, and how that was caught:**
  - commit messages that claimed reviews I hadn't done (reworded before review);
  - a pushed failing test (commits are now gated on `npm run verify`);
  - a mechanical class rename that broke the chip borders and dark-mode contrast (caught in screenshots);
  - a Vercel entrypoint mix-up (debugged by reading the runtime's own source).
- **Takeaway:** AI made me faster, but it needed fast feedback loops to stay correct: tests, CI,
  screenshots and my review at every checkpoint. The research in
  `docs/research/05-engineering-evidence.md` says the same: gains on small, well-specified tasks,
  with costs when work isn't checked.

## 6. Numbers to remember

- 171 backend tests (~99% statements), 131 frontend tests (~98%).
- 37 recorded decisions.
- 18 seeded cars across 8 categories.
- 10 code-review findings fixed test-first, 0 high/medium security findings.
