# Design

## 1. Scope for the 1–2 day deadline

| Tier | Contents |
|------|----------|
| **Must** | Every R/F/P item in `REQUIREMENTS.md`: auth, vehicle CRUD, search, purchase, restock, React UI with admin tools, tests, README (screenshots, My AI Usage, test report), PROMPTS.md |
| **Should** | Purchase history page, GitHub Actions CI, live deployment (Neon + Render + Vercel) |
| **Could** | Playwright end-to-end suite, dark mode, pagination |

## 2. Architecture

```
React SPA (Vite) ──HTTP/JSON + Bearer JWT──▶ Express API ──Prisma──▶ PostgreSQL
```

Backend layers. Each layer depends only on the one below it:

```
routes      → URL + HTTP method → middleware chain → controller
middleware  → requireAuth, requireRole('ADMIN'), validate(zodSchema), errorHandler
controllers → read the request, call a service, shape the HTTP response (no business rules)
services    → business rules (stock rules, hashing, token issuing); throw typed AppErrors
prisma      → data access
```

- `createApp()` builds the Express app without listening on a port, so Supertest can
  drive it in tests. `server.ts` is the only file that calls `listen`.
- Config is read once from `process.env` and validated with zod (`config/env.ts`). The
  app refuses to start if `JWT_SECRET` or `DATABASE_URL` is missing.
- Errors: services throw `AppError(status, code, message)`. One error-handling middleware
  turns them (and zod and Prisma errors) into the standard error shape. Unknown errors
  become `500` with no stack trace in the response.

### Backend folder layout

```
backend/
  prisma/            schema.prisma, migrations/, seed.ts
  src/
    app.ts           createApp()
    server.ts        entry point
    config/env.ts
    lib/             prisma client, password (bcrypt), jwt helpers
    errors/          AppError + factories (badRequest, notFound, conflict…)
    middleware/      auth, role, validate, errorHandler
    modules/
      auth/          routes, controller, service, schemas
      vehicles/      routes, controller, service, schemas (CRUD + search)
      inventory/     routes, controller, service, schemas (purchase, restock, history)
  tests/
    integration/     Supertest against a real Postgres test DB
    unit/            pure logic (jwt, password, search filter builder)
    helpers/         DB reset, user/token factories
```

## 3. Data model (Prisma)

```prisma
enum Role     { USER ADMIN }
enum Category { SEDAN SUV TRUCK COUPE HATCHBACK CONVERTIBLE VAN ELECTRIC }

model User {
  id           String     @id @default(uuid())
  name         String
  email        String     @unique          // stored lowercase
  passwordHash String
  role         Role       @default(USER)
  purchases    Purchase[]
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt
}

model Vehicle {
  id        String     @id @default(uuid())
  make      String
  model     String
  category  Category
  price     Decimal    @db.Decimal(12, 2)
  quantity  Int        @default(0)          // + DB CHECK (quantity >= 0)
  year      Int
  color     String
  imageUrl  String?
  purchases Purchase[]
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt
  @@index([category])
  @@index([price])
}

model Purchase {
  id         String   @id @default(uuid())
  userId     String
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  vehicleId  String?
  vehicle    Vehicle? @relation(fields: [vehicleId], references: [id], onDelete: SetNull)
  make       String                          // snapshot (D7)
  model      String                          // snapshot (D7)
  quantity   Int
  unitPrice  Decimal  @db.Decimal(12, 2)     // price at purchase time (D6)
  totalPrice Decimal  @db.Decimal(12, 2)
  createdAt  DateTime @default(now())
}
```

A raw-SQL migration adds `CHECK (quantity >= 0)` on `Vehicle`. That makes non-negative
stock a rule the database itself enforces, as a second line of defence behind the
atomic update (D5).

## 4. API contract

All responses are JSON. Every endpoint except `health`, `register` and `login` needs an
`Authorization: Bearer <token>` header. Prices go out as JSON numbers, e.g. `2450000.5`.

| Method | Path | Auth | Body / Query | Success | Errors |
|--------|------|------|--------------|---------|--------|
| GET | `/api/health` | — | — | `200 {status:"ok"}` | — |
| POST | `/api/auth/register` | — | `{name, email, password}` | `201 {token, user}` | 400, 409 email taken |
| POST | `/api/auth/login` | — | `{email, password}` | `200 {token, user}` | 400, 401 |
| GET | `/api/auth/me` | user | — | `200 {user}` | 401 |
| GET | `/api/vehicles` | user | — | `200 {vehicles: [...]}` newest first | 401 |
| GET | `/api/vehicles/search` | user | `?make&model&category&minPrice&maxPrice` | `200 {vehicles: [...]}` | 400, 401 |
| GET | `/api/vehicles/:id` | user | — | `200 {vehicle}` | 400 bad id, 401, 404 |
| POST | `/api/vehicles` | admin | vehicle fields | `201 {vehicle}` | 400, 401, 403 |
| PUT | `/api/vehicles/:id` | admin | any subset of detail fields | `200 {vehicle}` | 400, 401, 403, 404 |
| DELETE | `/api/vehicles/:id` | admin | — | `204` | 401, 403, 404 |
| POST | `/api/vehicles/:id/purchase` | user | `{quantity?}` (default 1) | `201 {purchase, vehicle}` | 400, 401, 404, 409 insufficient stock |
| POST | `/api/vehicles/:id/restock` | admin | `{quantity}` | `200 {vehicle}` | 400, 401, 403, 404 |
| GET | `/api/purchases/me` | user | — | `200 {purchases: [...]}` | 401 |

`user` object returned by the API: `{id, name, email, role}`. The password hash is never included.

Validation rules:

| Field | Rule |
|-------|------|
| name | trimmed, 2–60 characters |
| email | valid email, normalised to lowercase |
| password | 8–72 characters (72 is bcrypt's input limit) |
| make, model, color | trimmed, 1–50 characters |
| category | one of the `Category` enum values |
| year | integer, 1886 (first car) to next year |
| price | > 0, ≤ 9,999,999,999.99, at most 2 decimals |
| quantity (create) | integer, 0–10,000. Not accepted by PUT (D19) |
| purchase / restock quantity | integer, 1–100 / 1–10,000 |
| imageUrl | optional `http(s)` URL |

## 5. Frontend design

Stack: Vite, React, TypeScript, Tailwind CSS, React Router, TanStack Query (server state:
caching, refetching after mutations), react-hook-form + zod (forms), sonner (toasts),
lucide-react (icons). Tests use Vitest + React Testing Library + MSW (mocked API).

| Route | Access | Contents |
|-------|--------|----------|
| `/login`, `/register` | guests | Validated forms, server errors shown inline |
| `/` | user | Header (user menu, role badge), filter bar, responsive vehicle grid |
| `/purchases` | user | Purchase history table (Should tier) |

- **Vehicle card**: category image placeholder (or `imageUrl`), make/model/year, colour,
  price in ₹ with Indian digit grouping, stock badge (In stock / Low / Sold out), and a
  quantity picker + **Purchase** button that is disabled at quantity 0.
- **Admin tools** (only rendered for admins, and enforced by the API regardless):
  "Add vehicle" button, plus Edit / Restock / Delete on each card. Add and edit share one
  form modal; delete asks for confirmation.
- **Search**: filter bar (make, model, category dropdown, min/max price). Inputs are
  debounced by 300 ms. With no filters set it calls `GET /api/vehicles`; with any filter
  it calls `/search`. Filters are mirrored in the URL query string so results can be
  shared and survive a reload.
- **Auth**: the token is kept in `localStorage` and attached by a single API client. On
  load the app calls `/api/auth/me` to restore the session; any `401` logs the user out.
  Trade-off: an httpOnly cookie is safer against XSS but needs CSRF protection and
  cross-site cookie setup between Vercel and Render. For this scope, Bearer tokens
  follow the brief's "token-based" wording and keep deployment simple.
- **UX states**: skeleton loaders, empty state ("No vehicles match"), error state with
  retry, optimistic disabled buttons while requests are in flight.

## 6. Testing strategy

| Layer | Tool | What |
|-------|------|------|
| Backend integration | Jest + Supertest + real Postgres test DB | Every endpoint: success path, validation, 401/403/404/409, concurrency (parallel purchases on the last unit) |
| Backend unit | Jest | JWT helper, password helper, search-filter builder |
| Frontend | Vitest + RTL + MSW | Auth forms, VehicleCard (disabled at 0, admin controls hidden for users), filter bar, API client 401 handling |
| End-to-end (Could) | Playwright | Register → search → purchase; admin add → edit → restock → delete |

Tables are truncated between tests so every test starts from a known state. Tests run
serially (`--runInBand`) because they share one database.

## 7. Environments & deployment

- **Local**: `docker-compose.yml` runs Postgres with two databases (`dealership`, `dealership_test`).
- **Env vars (backend)**: `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `CORS_ORIGIN`,
  `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `PORT`. `.env.example` is committed; `.env` never is.
- **Env vars (frontend)**: `VITE_API_URL`.
- **CI**: GitHub Actions with a Postgres service, running lint, typecheck and tests for both apps.
- **Production**: Neon (Postgres) + Render (API, runs `prisma migrate deploy` on start) + Vercel (SPA).
