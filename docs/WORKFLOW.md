# Project Workflow — Car Dealership Inventory System (TDD Kata)

This is the working plan we follow from the first commit to submission. Every phase
ends with a **checkpoint**: open questions get answered and the phase gets approved
before the next one starts.

Status legend: `[ ]` todo · `[~]` in progress · `[x]` done

---

## Phase 0 — Setup & conventions  `[x]`

- [x] Stack: **Node.js + TypeScript + Express**, **PostgreSQL** via **Prisma**,
      Jest + Supertest (backend), Vite + React + TypeScript + Tailwind, Vitest + React Testing Library (frontend)
- [x] Git author: `Kedarnath <kedarnath1157@gmail.com>`; AI co-author: `Claude <noreply@anthropic.com>`
- [x] Commit convention (see "Commit rules" below)
- [x] Monorepo layout: `backend/`, `frontend/`, `docs/`, `README.md`, `PROMPTS.md`
- [x] PROMPTS.md: raw session transcripts converted to markdown word for word, never summarised
- [x] **Checkpoint 0**: stack and conventions approved

## Phase 1 — Requirements & doubts  `[x]`

- [x] Requirement traceability matrix (`docs/REQUIREMENTS.md`): every line of the brief
      gets an ID (R1…Rn) and is mapped to an endpoint or screen, a test and a status
- [x] Ambiguity log: each unclear point, the decision taken and why (to discuss in the interview)
- [x] **Checkpoint 1**: matrix and ambiguity decisions approved

## Phase 2 — Design  `[x]`

- [x] Architecture: layered backend (routes → controllers → services → repositories)
- [x] Data model: `User` (id, name, email, passwordHash, role), `Vehicle` (id, make, model,
      category, price, quantity, timestamps), optional `Purchase` record
- [x] API contract (`docs/API.md`): request and response shapes, status codes, error format
- [x] Auth design: bcrypt password hashing, JWT (expiry, secret from env), role guard for admin
- [x] Frontend: pages, component tree, state and auth handling, routing
- [x] **Checkpoint 2**: design approved

## Phase 3 — Backend (strict TDD)  `[~]`

Each slice is committed as **Red → Green → Refactor** (refactor only when needed):

| # | Slice | Endpoint |
|---|-------|----------|
| 3.1 | App skeleton, health check, test DB harness | `GET /api/health` |
| 3.2 | Register (validation, duplicate email, hashing) | `POST /api/auth/register` |
| 3.3 | Login (JWT issued, bad credentials) | `POST /api/auth/login` |
| 3.4 | Auth middleware + admin guard | — |
| 3.5 | Create vehicle | `POST /api/vehicles` |
| 3.6 | List vehicles | `GET /api/vehicles` |
| 3.7 | Search (make, model, category, min/max price) | `GET /api/vehicles/search` |
| 3.8 | Update vehicle | `PUT /api/vehicles/:id` |
| 3.9 | Delete vehicle (admin only) | `DELETE /api/vehicles/:id` |
| 3.10 | Purchase (atomic decrement, out-of-stock) | `POST /api/vehicles/:id/purchase` |
| 3.11 | Restock (admin only) | `POST /api/vehicles/:id/restock` |
| 3.12 | Central error handling, seed script (admin and sample cars) | — (admin seed done early for Checkpoint 3a) |

- [x] Slices 3.1–3.4 done (auth), admin seed done
- [x] **Checkpoint 3a**: auth review (try register/login/me)
- [x] Slices 3.5–3.11 + purchase history (`GET /api/purchases/me`)
- [ ] 3.12: sample-vehicle seed (after research)
- [x] CI: GitHub Actions runs typecheck, lint and tests against Postgres
- [x] Coverage target: ≥ 90% backend (98.9% statements, 92.7% branches)
- [ ] **Checkpoint 3b**: you run the full API yourself (Postman/curl) and give feedback

## Phase 3.5 — User-centric research  `[x]`

- [x] Desk research (surveys, papers, UX research, Apple HIG, WCAG, NIST) → `docs/research/`
- [x] Fold findings into requirements, design and the frontend spec (D23–D33)
- [x] **Checkpoint R**: approved (15-character passwords + rate limiting, name "Showroom", Must then Should)
- [ ] Backend follow-ups: password minimum 15 (D23), auth rate limiting (D24), sample-vehicle seed

## Phase 4 — Frontend (React + Tailwind)  `[ ]`

- [ ] Scaffold (Vite + React + TypeScript + Tailwind), typed API client, auth context
- [ ] Register and login pages (validation, error states)
- [ ] Dashboard: vehicle grid, loading, empty and error states
- [ ] Search and filter bar (make, model, category, price range)
- [ ] Purchase button (disabled at quantity 0) with feedback
- [ ] Admin: add, edit, delete and restock UI, admin-only routes
- [ ] Component tests (Vitest + React Testing Library), written test-first for logic
- [ ] Responsive pass (mobile, tablet, desktop)
- [ ] **Checkpoint 4**: you click through the app and give UX feedback

## Phase 5 — Integration & end-to-end  `[ ]`

- [ ] Run backend and frontend together against the real DB
- [ ] Playwright end-to-end happy paths (register → login → search → purchase; admin CRUD)
- [ ] **Checkpoint 5**: feedback round, change requests logged

## Phase 6 — Bug & quality audit  `[ ]`

- [ ] Code review pass (correctness, SOLID, naming, comments)
- [ ] Re-check backend dependency versions against the two-week rule
- [ ] Security pass: input validation, auth on every protected route, no secrets committed,
      password never returned, JWT handling, CORS
- [ ] Concurrency: two purchases on the last car must not drive stock below 0
- [ ] Edge cases: invalid IDs, negative price or quantity, empty search, expired token
- [ ] Coverage gaps closed
- [ ] **Checkpoint 6**: audit findings reviewed

## Phase 7 — Polish & docs  `[ ]`

- [ ] UI polish, accessibility (labels, focus, contrast)
- [ ] README: overview, tech stack, setup (backend and frontend), env vars, API table,
      screenshots, **My AI Usage**, test report
- [ ] `docs/TEST_REPORT.md`: test and coverage output
- [ ] Screenshots captured (Playwright)
- [ ] PROMPTS.md: raw transcripts exported
- [ ] **Checkpoint 7**: docs approved

## Phase 8 — Deployment (optional brownie points)  `[ ]`

- [ ] Hosted Postgres, backend host, frontend on Vercel
- [ ] Live URL in the README

## Phase 9 — Submission checklist  `[ ]`

- [ ] Repo is public, final code on `main`
- [ ] Commit history shows Red → Green → Refactor, every AI-assisted commit has the co-author trailer
- [ ] README has every mandatory section
- [ ] PROMPTS.md at the repo root
- [ ] Fresh-clone test: follow the README from zero on a clean checkout and it works
- [ ] Interview prep notes (`docs/INTERVIEW_NOTES.md`): design decisions and how AI was used

---

## Skills used per phase

| Phase | Skill |
|-------|-------|
| 3 (setup) | `session-start-hook`: new cloud sessions install deps and start Postgres automatically |
| 6 | `code-review`, `security-review` |
| 7 | `run` (launch app, screenshots), `design:accessibility-review`, `engineering:documentation` |

## Commit rules

- Conventional prefixes: `test:` (red), `feat:` (green), `refactor:`, `chore:`, `docs:`, `fix:`, `style:`
- Red commits contain only the failing tests; green commits contain the minimum code that passes them
- Messages narrate the work: what changed and why, plus how AI helped
- Every message ends with a factual "AI assistance:" line saying what the AI did. Never claim a
  human review that has not happened.
- AI co-author trailer at the end of every AI-assisted commit, after two blank lines:
  `Co-authored-by: Claude <noreply@anthropic.com>`
