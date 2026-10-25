# Test report

Generated on 25 Oct 2026 from the commit `09175e3` on branch `claude/brave-pasteur-4fmup1`.
Both suites also run on every push in GitHub Actions (`.github/workflows/ci.yml`).

## Summary

| Suite | Tool | Tests | Statements | Branches | Functions | Lines |
|-------|------|-------|-----------|----------|-----------|-------|
| Backend | Jest + Supertest against a real PostgreSQL test database | **166 / 166 passed** (19 files) | 99.21% | 94.84% | 100% | 99.17% |
| Frontend | Vitest + React Testing Library + MSW | **131 / 131 passed** (16 files) | 98.05% | 92.53% | 94.89% | 98.05% |

How to reproduce:

```bash
cd backend && npm run test:coverage    # needs the test database, see README
cd frontend && npm run test:coverage
```

## How the tests were written (TDD)

- Features, and the bugs found in the code review, were developed test-first: a failing
  `test:` commit (red), then a `feat:` or `fix:` commit that makes it pass (green);
  `git log --oneline` shows the pairs. Visual fixes found while reviewing screenshots, tooling
  (`chore:`), styling (`style:`) and documentation (`docs:`) commits have no red step, and one
  `test: cover …` commit added tests for error paths after the code existed. Each commit message
  says which kind it is. On this branch: 29 `test:` commits, 32 `feat:`/`fix:` commits, 85 in total.
- Backend tests are integration tests through the real HTTP stack and a real PostgreSQL
  database (tables are truncated between tests; the harness refuses to run against a database
  whose name does not contain `_test`). Pure helpers have unit tests.
- Frontend tests render the whole app (router, providers, real components) against a mocked
  API (MSW), and assert what users see and do: roles, labels and accessible names.
- **Concurrency check that proves itself:** five simultaneous purchases of the last car must
  produce exactly one sale. To make sure the test can fail, the atomic update was temporarily
  replaced by a naive read-check-write version; the test caught the oversell, and the real
  version then passed 8 out of 8 repeated runs.
- **Audit:** a code review (Phase 6) found 10 issues; each was first reproduced by a failing
  test, then fixed (see commits `test: reproduce … findings` and `fix: close the … gaps`).

## Backend coverage

```text
--------------------------|---------|----------|---------|---------|-------------------
File                      | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
--------------------------|---------|----------|---------|---------|-------------------
All files                 |   99.21 |    94.84 |     100 |   99.17 |                   
 src                      |     100 |      100 |     100 |     100 |                   
  app.ts                  |     100 |      100 |     100 |     100 |                   
 src/config               |     100 |      100 |     100 |     100 |                   
  env.ts                  |     100 |      100 |     100 |     100 |                   
 src/errors               |     100 |      100 |     100 |     100 |                   
  AppError.ts             |     100 |      100 |     100 |     100 |                   
 src/lib                  |   96.55 |       75 |     100 |   96.42 |                   
  jwt.ts                  |     100 |       75 |     100 |     100 | 29                
  password.ts             |     100 |      100 |     100 |     100 |                   
  prisma.ts               |     100 |      100 |     100 |     100 |                   
  prismaErrors.ts         |    90.9 |       75 |     100 |      90 | 26                
 src/middleware           |   98.52 |    97.36 |     100 |   98.43 |                   
  errorHandler.ts         |     100 |      100 |     100 |     100 |                   
  rateLimit.ts            |     100 |      100 |     100 |     100 |                   
  requireAuth.ts          |      95 |       90 |     100 |   94.73 | 36                
  requireRole.ts          |     100 |      100 |     100 |     100 |                   
  validate.ts             |     100 |      100 |     100 |     100 |                   
 src/modules/auth         |   98.03 |     87.5 |     100 |   98.03 |                   
  auth.controller.ts      |     100 |      100 |     100 |     100 |                   
  auth.routes.ts          |     100 |      100 |     100 |     100 |                   
  auth.schemas.ts         |     100 |      100 |     100 |     100 |                   
  auth.service.ts         |   95.45 |     87.5 |     100 |   95.45 | 42                
  publicUser.ts           |     100 |      100 |     100 |     100 |                   
 src/modules/inventory    |     100 |      100 |     100 |     100 |                   
  inventory.controller.ts |     100 |      100 |     100 |     100 |                   
  inventory.routes.ts     |     100 |      100 |     100 |     100 |                   
  inventory.schemas.ts    |     100 |      100 |     100 |     100 |                   
  inventory.service.ts    |     100 |      100 |     100 |     100 |                   
  purchase.dto.ts         |     100 |      100 |     100 |     100 |                   
  purchase.routes.ts      |     100 |      100 |     100 |     100 |                   
 src/modules/vehicles     |     100 |    95.83 |     100 |     100 |                   
  vehicle.controller.ts   |     100 |      100 |     100 |     100 |                   
  vehicle.dto.ts          |     100 |      100 |     100 |     100 |                   
  vehicle.routes.ts       |     100 |      100 |     100 |     100 |                   
  vehicle.schemas.ts      |     100 |     90.9 |     100 |     100 | 39                
  vehicle.service.ts      |     100 |      100 |     100 |     100 |                   
 src/seed                 |     100 |      100 |     100 |     100 |                   
  seedAdmin.ts            |     100 |      100 |     100 |     100 |                   
  seedVehicles.ts         |     100 |      100 |     100 |     100 |                   
--------------------------|---------|----------|---------|---------|-------------------

=============================== Coverage summary ===============================
Statements   : 99.21% ( 380/383 )
Branches     : 94.84% ( 92/97 )
Functions    : 100% ( 82/82 )
Lines        : 99.17% ( 360/363 )
================================================================================
Test Suites: 19 passed, 19 total
Tests:       166 passed, 166 total
Snapshots:   0 total
Time:        28.873 s
Ran all test suites.
```

## Frontend coverage

```text
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-------------------|---------|----------|---------|---------|-------------------
All files          |   98.05 |    92.53 |   94.89 |   98.05 |                   
 src               |     100 |      100 |     100 |     100 |                   
  App.tsx          |     100 |      100 |     100 |     100 |                   
 src/components    |     100 |      100 |     100 |     100 |                   
  Wordmark.tsx     |     100 |      100 |     100 |     100 |                   
 ...mponents/icons |     100 |      100 |     100 |     100 |                   
  index.tsx        |     100 |      100 |     100 |     100 |                   
 ...ponents/layout |   88.95 |    82.14 |   81.81 |   88.95 |                   
  AccountMenu.tsx  |   81.63 |       75 |   71.42 |   81.63 | 46-48,51-65       
  AppShell.tsx     |     100 |      100 |     100 |     100 |                   
 src/components/ui |   98.39 |    93.61 |      95 |   98.39 |                   
  Alert.tsx        |     100 |      100 |     100 |     100 |                   
  Badge.tsx        |     100 |      100 |     100 |     100 |                   
  Button.tsx       |     100 |      100 |     100 |     100 |                   
  EmptyState.tsx   |     100 |      100 |     100 |     100 |                   
  ...wordField.tsx |     100 |      100 |     100 |     100 |                   
  SelectField.tsx  |     100 |      100 |     100 |     100 |                   
  Sheet.tsx        |   94.16 |       80 |     100 |   94.16 | ...52-154,162-164 
  Spinner.tsx      |     100 |      100 |     100 |     100 |                   
  Stepper.tsx      |     100 |      100 |   83.33 |     100 |                   
  TextField.tsx    |     100 |    94.44 |     100 |     100 | 42                
 src/features/auth |   98.67 |    84.93 |     100 |   98.67 |                   
  AuthLayout.tsx   |     100 |      100 |     100 |     100 |                   
  AuthProvider.tsx |     100 |     90.9 |     100 |     100 | 35,40             
  LoginPage.tsx    |     100 |    91.66 |     100 |     100 | 43                
  RegisterPage.tsx |   95.57 |    72.22 |     100 |   95.57 | 40-42,59-60       
  authContext.ts   |     100 |       50 |     100 |     100 | 24                
  guards.tsx       |     100 |    88.88 |     100 |     100 | 57,59             
  schemas.ts       |     100 |      100 |     100 |     100 |                   
 ...ures/inventory |   99.64 |    96.38 |    92.3 |   99.64 |                   
  CategoryArt.tsx  |     100 |      100 |     100 |     100 |                   
  FilterBar.tsx    |     100 |      100 |   86.66 |     100 |                   
  ...ntoryPage.tsx |     100 |      100 |   94.73 |     100 |                   
  PriceSheet.tsx   |     100 |      100 |     100 |     100 |                   
  ...haseSheet.tsx |   97.76 |       75 |   85.71 |   97.76 | 79,83-84          
  ResultsBar.tsx   |     100 |      100 |     100 |     100 |                   
  StockBadge.tsx   |     100 |      100 |     100 |     100 |                   
  VehicleCard.tsx  |     100 |      100 |     100 |     100 |                   
  ...dSkeleton.tsx |     100 |      100 |     100 |     100 |                   
  VehicleMedia.tsx |     100 |    66.66 |      50 |     100 | 24-26             
  carProfiles.ts   |     100 |      100 |     100 |     100 |                   
  useVehicles.ts   |     100 |      100 |     100 |     100 |                   
  vehicleCache.ts  |     100 |      100 |     100 |     100 |                   
 ...nventory/admin |   95.84 |    89.47 |      92 |   95.84 |                   
  ...cleDialog.tsx |    89.7 |    81.81 |   85.71 |    89.7 | 28-29,56-60       
  RestockSheet.tsx |   92.53 |    88.88 |     100 |   92.53 | 63-67             
  ...FormSheet.tsx |   97.39 |    89.79 |   85.71 |   97.39 | 136-138,143-145   
  vehicleForm.ts   |   98.27 |     92.3 |     100 |   98.27 | 22-23             
 ...ures/purchases |     100 |    94.11 |     100 |     100 |                   
  ...hasesPage.tsx |     100 |    94.11 |     100 |     100 | 79                
 src/hooks         |     100 |      100 |     100 |     100 |                   
  ...uncedValue.ts |     100 |      100 |     100 |     100 |                   
  ...elayedFlag.ts |     100 |      100 |     100 |     100 |                   
 src/lib           |     100 |    95.41 |     100 |     100 |                   
  cn.ts            |     100 |      100 |     100 |     100 |                   
  filters.ts       |     100 |    95.18 |     100 |     100 | 114,130,150-151   
  format.ts        |     100 |      100 |     100 |     100 |                   
  queryClient.ts   |     100 |    66.66 |     100 |     100 | 9                 
  stock.ts         |     100 |      100 |     100 |     100 |                   
 src/lib/api       |   96.85 |    91.07 |     100 |   96.85 |                   
  client.ts        |     100 |    92.85 |     100 |     100 | 68-69             
  endpoints.ts     |     100 |      100 |     100 |     100 |                   
  index.ts         |     100 |      100 |     100 |     100 |                   
  tokenStore.ts    |   81.81 |       50 |     100 |   81.81 | 14-15,22,29       
  types.ts         |     100 |      100 |     100 |     100 |                   
-------------------|---------|----------|---------|---------|-------------------
```

## Every test

### Backend (Jest + Supertest, real PostgreSQL): 166/166 tests passed in 19 files

<details><summary><code>tests/integration/auth.login.test.ts</code>: 7/7 passed</summary>

- ✅ POST /api/auth/login › returns 200 with a token and the public user fields for valid credentials
- ✅ POST /api/auth/login › matches the email case-insensitively
- ✅ POST /api/auth/login › puts the ADMIN role in the token for an admin
- ✅ POST /api/auth/login › returns the same generic 401 when the password is wrong
- ✅ POST /api/auth/login › returns the same generic 401 when the email is not registered
- ✅ POST /api/auth/login › returns 400 when email is missing
- ✅ POST /api/auth/login › returns 400 when password is missing

</details>

<details><summary><code>tests/integration/auth.me.test.ts</code>: 10/10 passed</summary>

- ✅ GET /api/auth/me (requireAuth) › returns the current user for a valid bearer token
- ✅ GET /api/auth/me (requireAuth) › returns 401 MISSING_TOKEN when there is no Authorization header
- ✅ GET /api/auth/me (requireAuth) › returns 401 MISSING_TOKEN for a malformed header "Token abc.def.ghi"
- ✅ GET /api/auth/me (requireAuth) › returns 401 MISSING_TOKEN for a malformed header "Bearer"
- ✅ GET /api/auth/me (requireAuth) › returns 401 MISSING_TOKEN for a malformed header "Bearer "
- ✅ GET /api/auth/me (requireAuth) › returns 401 INVALID_TOKEN when the token › is not a JWT
- ✅ GET /api/auth/me (requireAuth) › returns 401 INVALID_TOKEN when the token › is signed with a different secret
- ✅ GET /api/auth/me (requireAuth) › returns 401 INVALID_TOKEN when the token › is unsigned (alg "none")
- ✅ GET /api/auth/me (requireAuth) › returns 401 INVALID_TOKEN when the token › has expired
- ✅ GET /api/auth/me (requireAuth) › returns 401 INVALID_TOKEN when the token › belongs to a user who no longer exists

</details>

<details><summary><code>tests/integration/auth.rateLimit.test.ts</code>: 6/6 passed</summary>

- ✅ auth rate limiting (D24) › returns 429 with Retry-After once the failed-attempt limit is reached
- ✅ auth rate limiting (D24) › does not count successful logins towards the limit
- ✅ auth rate limiting (D24) › also limits registration attempts
- ✅ auth rate limiting (D24) › counts successful registrations too, so accounts cannot be mass-created
- ✅ auth rate limiting (D24) › leaves non-auth routes unaffected
- ✅ auth rate limiting (D24) › tells clients apart by X-Forwarded-For when running behind a trusted proxy

</details>

<details><summary><code>tests/integration/auth.register.test.ts</code>: 14/14 passed</summary>

- ✅ POST /api/auth/register › creates a user and returns 201 with a token and the public user fields
- ✅ POST /api/auth/register › issues a JWT whose subject is the new user id and carries the role
- ✅ POST /api/auth/register › stores a bcrypt hash, never the plain password
- ✅ POST /api/auth/register › normalises the email to trimmed lowercase
- ✅ POST /api/auth/register › ignores a role in the request body so users cannot make themselves admin
- ✅ POST /api/auth/register › rejects an email that is already registered, ignoring case, with 409
- ✅ POST /api/auth/register › returns 400 with field details when name is missing
- ✅ POST /api/auth/register › returns 400 with field details when name is too short
- ✅ POST /api/auth/register › returns 400 with field details when email is invalid
- ✅ POST /api/auth/register › returns 400 with field details when password is shorter than 15 characters
- ✅ POST /api/auth/register › returns 400 with field details when password exceeds 72 characters
- ✅ POST /api/auth/register › accepts a password of exactly 15 characters
- ✅ POST /api/auth/register › explains the 15-character rule in the error message (NIST SP 800-63B-4)
- ✅ POST /api/auth/register › returns 400 for a malformed JSON body

</details>

<details><summary><code>tests/integration/health.test.ts</code>: 2/2 passed</summary>

- ✅ GET /api/health › responds 200 with status ok
- ✅ unknown routes › responds 404 with the standard error shape

</details>

<details><summary><code>tests/integration/inventory.purchase.test.ts</code>: 16/16 passed</summary>

- ✅ POST /api/vehicles/:id/purchase › buys one unit by default and returns 201 with the purchase and updated vehicle
- ✅ POST /api/vehicles/:id/purchase › buys several units and computes an exact total
- ✅ POST /api/vehicles/:id/purchase › can buy the last units, leaving the stock at exactly zero
- ✅ POST /api/vehicles/:id/purchase › lets admins purchase too
- ✅ POST /api/vehicles/:id/purchase › returns 409 OUT_OF_STOCK when the stock is zero, changing nothing
- ✅ POST /api/vehicles/:id/purchase › returns 409 INSUFFICIENT_STOCK when asking for more than is left, changing nothing
- ✅ POST /api/vehicles/:id/purchase › never oversells under concurrent purchases of the last unit (D5)
- ✅ POST /api/vehicles/:id/purchase › keeps the purchase record, unlinked, when the vehicle is later deleted (D7)
- ✅ POST /api/vehicles/:id/purchase › returns 400 when quantity is zero
- ✅ POST /api/vehicles/:id/purchase › returns 400 when quantity is negative
- ✅ POST /api/vehicles/:id/purchase › returns 400 when quantity is fractional
- ✅ POST /api/vehicles/:id/purchase › returns 400 when quantity is above the per-order limit
- ✅ POST /api/vehicles/:id/purchase › returns 400 when quantity is a string
- ✅ POST /api/vehicles/:id/purchase › returns 404 for a vehicle that does not exist
- ✅ POST /api/vehicles/:id/purchase › returns 400 for an id that is not a UUID
- ✅ POST /api/vehicles/:id/purchase › returns 401 without a token

</details>

<details><summary><code>tests/integration/inventory.restock.test.ts</code>: 11/11 passed</summary>

- ✅ POST /api/vehicles/:id/restock › lets an admin add stock and returns 200 with the updated vehicle
- ✅ POST /api/vehicles/:id/restock › makes a sold-out vehicle purchasable again
- ✅ POST /api/vehicles/:id/restock › applies concurrent restocks atomically without losing any
- ✅ POST /api/vehicles/:id/restock › returns 400 when quantity is missing
- ✅ POST /api/vehicles/:id/restock › returns 400 when quantity is zero
- ✅ POST /api/vehicles/:id/restock › returns 400 when quantity is negative
- ✅ POST /api/vehicles/:id/restock › returns 400 when quantity is fractional
- ✅ POST /api/vehicles/:id/restock › returns 400 when quantity is above the limit
- ✅ POST /api/vehicles/:id/restock › returns 403 for a regular user and leaves the stock alone
- ✅ POST /api/vehicles/:id/restock › returns 404 for a vehicle that does not exist
- ✅ POST /api/vehicles/:id/restock › returns 401 without a token

</details>

<details><summary><code>tests/integration/middleware.requireRole.test.ts</code>: 4/4 passed</summary>

- ✅ requireRole("ADMIN") › lets an admin through
- ✅ requireRole("ADMIN") › returns 403 FORBIDDEN for a regular user
- ✅ requireRole("ADMIN") › returns 401 when no token is sent
- ✅ requireRole("ADMIN") › uses the role stored in the database, not the role claimed in the token

</details>

<details><summary><code>tests/integration/purchases.history.test.ts</code>: 5/5 passed</summary>

- ✅ GET /api/purchases/me › returns only the caller's purchases, newest first
- ✅ GET /api/purchases/me › keeps the price paid even after the vehicle price changes (D6)
- ✅ GET /api/purchases/me › still lists purchases of vehicles that were deleted (D7)
- ✅ GET /api/purchases/me › returns an empty list for a user with no purchases
- ✅ GET /api/purchases/me › returns 401 without a token

</details>

<details><summary><code>tests/integration/seed.admin.test.ts</code>: 4/4 passed</summary>

- ✅ seedAdmin › creates an ADMIN with a hashed password when none exists
- ✅ seedAdmin › is idempotent: running it twice leaves a single admin
- ✅ seedAdmin › refuses to promote an account someone registered with the admin email
- ✅ seedAdmin › leaves an existing admin, and its password, untouched

</details>

<details><summary><code>tests/integration/seed.vehicles.test.ts</code>: 4/4 passed</summary>

- ✅ seedVehicles › inserts the sample inventory into an empty table and reports how many
- ✅ seedVehicles › does nothing when vehicles already exist, so admin edits are never overwritten
- ✅ seedVehicles › only contains vehicles the API itself would accept
- ✅ seedVehicles › covers every category plus sold-out and low-stock cars for the stock badges

</details>

<details><summary><code>tests/integration/vehicles.create.test.ts</code>: 23/23 passed</summary>

- ✅ POST /api/vehicles › lets an admin create a vehicle and returns 201 with it
- ✅ POST /api/vehicles › returns the price as a JSON number and keeps paise exact
- ✅ POST /api/vehicles › accepts the valid two-decimal price 141813588.33 (no floating-point false rejections)
- ✅ POST /api/vehicles › accepts the valid two-decimal price 275544454.04 (no floating-point false rejections)
- ✅ POST /api/vehicles › accepts the valid two-decimal price 9999999999.99 (no floating-point false rejections)
- ✅ POST /api/vehicles › trims text fields and treats a missing imageUrl as null
- ✅ POST /api/vehicles › returns 403 for a regular user
- ✅ POST /api/vehicles › returns 401 without a token
- ✅ POST /api/vehicles › returns 400 when make is missing
- ✅ POST /api/vehicles › returns 400 when model is blank
- ✅ POST /api/vehicles › returns 400 when category is not in the list
- ✅ POST /api/vehicles › returns 400 when price is zero
- ✅ POST /api/vehicles › returns 400 when price is negative
- ✅ POST /api/vehicles › returns 400 when price has more than 2 decimals
- ✅ POST /api/vehicles › returns 400 when price is a string
- ✅ POST /api/vehicles › returns 400 when price exceeds the column limit
- ✅ POST /api/vehicles › returns 400 when quantity is negative
- ✅ POST /api/vehicles › returns 400 when quantity is fractional
- ✅ POST /api/vehicles › returns 400 when year is before the first car
- ✅ POST /api/vehicles › returns 400 when year is too far in the future
- ✅ POST /api/vehicles › returns 400 when color is missing
- ✅ POST /api/vehicles › returns 400 when imageUrl is not a URL
- ✅ POST /api/vehicles › returns 400 when imageUrl uses a javascript: scheme

</details>

<details><summary><code>tests/integration/vehicles.delete.test.ts</code>: 5/5 passed</summary>

- ✅ DELETE /api/vehicles/:id › lets an admin delete a vehicle and returns 204 with no body
- ✅ DELETE /api/vehicles/:id › returns 404 for a vehicle that does not exist
- ✅ DELETE /api/vehicles/:id › returns 400 for an id that is not a UUID
- ✅ DELETE /api/vehicles/:id › returns 403 for a regular user and keeps the vehicle
- ✅ DELETE /api/vehicles/:id › returns 401 without a token

</details>

<details><summary><code>tests/integration/vehicles.read.test.ts</code>: 7/7 passed</summary>

- ✅ reading vehicles › GET /api/vehicles › returns every vehicle, newest first, including out-of-stock ones
- ✅ reading vehicles › GET /api/vehicles › returns prices as numbers
- ✅ reading vehicles › GET /api/vehicles › returns an empty list when there are no vehicles
- ✅ reading vehicles › GET /api/vehicles › returns 401 without a token
- ✅ reading vehicles › GET /api/vehicles/:id › returns the vehicle
- ✅ reading vehicles › GET /api/vehicles/:id › returns 404 for an id that does not exist
- ✅ reading vehicles › GET /api/vehicles/:id › returns 400 for an id that is not a UUID

</details>

<details><summary><code>tests/integration/vehicles.search.test.ts</code>: 16/16 passed</summary>

- ✅ GET /api/vehicles/search › matches make case-insensitively on part of the name
- ✅ GET /api/vehicles/search › matches model case-insensitively on part of the name
- ✅ GET /api/vehicles/search › matches category exactly, accepting any letter case
- ✅ GET /api/vehicles/search › filters by an inclusive price range
- ✅ GET /api/vehicles/search › supports only a minimum or only a maximum price
- ✅ GET /api/vehicles/search › combines every filter with AND
- ✅ GET /api/vehicles/search › includes out-of-stock vehicles in results
- ✅ GET /api/vehicles/search › returns everything, newest first, when no filters (or only empty ones) are given
- ✅ GET /api/vehicles/search › returns an empty list when nothing matches
- ✅ GET /api/vehicles/search › treats "%" as a literal character, not a wildcard
- ✅ GET /api/vehicles/search › treats "_" as a literal character, not a wildcard
- ✅ GET /api/vehicles/search › returns 400 when minPrice is greater than maxPrice
- ✅ GET /api/vehicles/search › returns 400 when minPrice is not a number
- ✅ GET /api/vehicles/search › returns 400 when maxPrice is negative
- ✅ GET /api/vehicles/search › returns 400 when category is not in the list
- ✅ GET /api/vehicles/search › returns 401 without a token

</details>

<details><summary><code>tests/integration/vehicles.update.test.ts</code>: 12/12 passed</summary>

- ✅ PUT /api/vehicles/:id › applies a partial update and leaves other fields unchanged
- ✅ PUT /api/vehicles/:id › clears the image when imageUrl is null
- ✅ PUT /api/vehicles/:id › rejects quantity changes: stock only moves through purchase and restock (D19)
- ✅ PUT /api/vehicles/:id › returns 400 when the body has no updatable fields
- ✅ PUT /api/vehicles/:id › returns 400 when price is negative
- ✅ PUT /api/vehicles/:id › returns 400 when category is not in the list
- ✅ PUT /api/vehicles/:id › returns 400 when make is blank
- ✅ PUT /api/vehicles/:id › returns 400 when imageUrl uses a javascript: scheme
- ✅ PUT /api/vehicles/:id › returns 404 for a vehicle that does not exist
- ✅ PUT /api/vehicles/:id › returns 400 for an id that is not a UUID
- ✅ PUT /api/vehicles/:id › returns 403 for a regular user and changes nothing
- ✅ PUT /api/vehicles/:id › returns 401 without a token

</details>

<details><summary><code>tests/unit/env.test.ts</code>: 7/7 passed</summary>

- ✅ parseEnv › applies defaults for optional settings
- ✅ parseEnv › fails fast with a readable list of every problem
- ✅ parseEnv › accepts JWT_EXPIRES_IN "15m" with a unit
- ✅ parseEnv › accepts JWT_EXPIRES_IN "1d" with a unit
- ✅ parseEnv › accepts JWT_EXPIRES_IN "3600s" with a unit
- ✅ parseEnv › accepts JWT_EXPIRES_IN "12h" with a unit
- ✅ parseEnv › rejects a JWT_EXPIRES_IN without a unit, which jsonwebtoken would read as milliseconds

</details>

<details><summary><code>tests/unit/errorHandler.test.ts</code>: 6/6 passed</summary>

- ✅ errorHandler › turns unexpected errors into a generic 500 without leaking details
- ✅ errorHandler › returns 413 PAYLOAD_TOO_LARGE for an oversized JSON body
- ✅ errorHandler › passes through the client status of the "charset.unsupported" body-parser error
- ✅ errorHandler › passes through the client status of the "encoding.unsupported" body-parser error
- ✅ errorHandler › passes through the client status of the "request.aborted" body-parser error
- ✅ errorHandler › still treats a body-parser error with a server status as a 500

</details>

<details><summary><code>tests/unit/vehicle.search.test.ts</code>: 7/7 passed</summary>

- ✅ escapeLikePattern › escapes plain text
- ✅ escapeLikePattern › escapes percent
- ✅ escapeLikePattern › escapes underscore
- ✅ escapeLikePattern › escapes backslash
- ✅ buildSearchWhere › returns an empty filter when no criteria are given
- ✅ buildSearchWhere › builds a one-sided price range
- ✅ buildSearchWhere › combines text, category and price criteria

</details>

### Frontend (Vitest + Testing Library + MSW): 131/131 tests passed in 53 files

<details><summary><code>src/App.test.tsx</code>: 1/1 passed</summary>

- ✅ App › renders without crashing

</details>

<details><summary><code>src/components/ui/Button.test.tsx</code>: 3/3 passed</summary>

- ✅ Button › renders a button that calls onClick
- ✅ Button › defaults to type="button" so it never submits a form by accident
- ✅ Button › while loading: shows the loading label, is busy and ignores clicks

</details>

<details><summary><code>src/components/ui/Sheet.test.tsx</code>: 5/5 passed</summary>

- ✅ Sheet › renders nothing while closed
- ✅ Sheet › opens as a dialog named by its title and moves focus inside
- ✅ Sheet › closes on Escape and returns focus to the trigger
- ✅ Sheet › closes from its Cancel button
- ✅ Sheet › cannot be dismissed while an action is pending

</details>

<details><summary><code>src/components/ui/Stepper.test.tsx</code>: 2/2 passed</summary>

- ✅ Stepper › shows the clamped value at once when a number above the maximum is typed
- ✅ Stepper › accepts a typed value within range

</details>

<details><summary><code>src/components/ui/TextField.test.tsx</code>: 6/6 passed</summary>

- ✅ TextField › links its visible label to the input
- ✅ TextField › describes the input with its hint
- ✅ TextField › marks the input invalid and announces the error
- ✅ TextField › is not marked invalid without an error
- ✅ PasswordField › hides the password until Show is pressed
- ✅ TextField hint and error › shows the error instead of the hint, never both

</details>

<details><summary><code>src/features/auth/LoginPage.test.tsx</code>: 6/6 passed</summary>

- ✅ Login page › signs in, stores the token and opens the inventory
- ✅ Login page › shows one clear message for wrong credentials, clears the password and focuses it
- ✅ Login page › shows the API message when sign-in is rate limited
- ✅ Login page › validates on the client before sending anything
- ✅ Login page › disables the button and shows progress while signing in
- ✅ Login page › links to registration

</details>

<details><summary><code>src/features/auth/RegisterPage.test.tsx</code>: 5/5 passed</summary>

- ✅ Register page › explains the 15-character password rule up front
- ✅ Register page › creates the account, signs in and welcomes the user by first name
- ✅ Register page › rejects a short password on the client without calling the API
- ✅ Register page › explains a taken email under the field and offers to sign in instead
- ✅ Register page › maps server validation details onto the matching fields

</details>

<details><summary><code>src/features/auth/session.test.tsx</code>: 7/7 passed</summary>

- ✅ session and route guards › sends signed-out visitors to the sign-in page
- ✅ session and route guards › restores a stored session and shows who is signed in
- ✅ session and route guards › marks administrators with an Admin badge
- ✅ session and route guards › discards an invalid stored token and asks the user to sign in
- ✅ session and route guards › keeps signed-in users away from the sign-in page
- ✅ session and route guards › signs out from the account menu
- ✅ session and route guards › keeps the session when the server cannot be reached at start-up, and retries

</details>

<details><summary><code>src/features/inventory/AdminTools.test.tsx</code>: 14/14 passed</summary>

- ✅ admin controls visibility (US-A6, F6) › hides every admin control from shoppers
- ✅ admin controls visibility (US-A6, F6) › shows the admin tools on every card for admins
- ✅ admin controls visibility (US-A6, F6) › makes Restock the main action on a sold-out card for admins
- ✅ adding a vehicle (US-A2) › creates the vehicle, shows it and confirms
- ✅ adding a vehicle (US-A2) › validates every field before sending
- ✅ adding a vehicle (US-A2) › rejects an image URL that is not http(s)
- ✅ adding a vehicle (US-A2) › shows server validation errors on the matching field
- ✅ editing a vehicle (US-A3) › edits details without a stock field and sends only what changed
- ✅ restocking (US-A4) › previews the new stock and updates the card
- ✅ deleting (US-A5) › asks a specific question, defaults to Cancel and removes the card on confirm
- ✅ deleting (US-A5) › cancelling keeps the vehicle
- ✅ admin empty state › invites the admin to add the first vehicle
- ✅ discarding unsaved changes (Should) › closes at once when nothing was changed
- ✅ discarding unsaved changes (Should) › asks before throwing edits away, and can keep editing

</details>

<details><summary><code>src/features/inventory/InventoryPage.test.tsx</code>: 19/19 passed</summary>

- ✅ Inventory: browsing (US-S3) › shows every vehicle, newest first, with a result count
- ✅ Inventory: browsing (US-S3) › shows price in rupees, details and stock on each card
- ✅ Inventory: browsing (US-S3) › disables purchasing a sold-out vehicle and says why (F5)
- ✅ Inventory: browsing (US-S3) › offers a retry when vehicles fail to load
- ✅ Inventory: browsing (US-S3) › explains an empty showroom
- ✅ Inventory: browsing (US-S3) › sends the user back to sign in when the session has expired
- ✅ Inventory: filtering and sorting (US-S4, US-S5) › filters by category chip through the search endpoint
- ✅ Inventory: filtering and sorting (US-S4, US-S5) › searches by make after the user stops typing
- ✅ Inventory: filtering and sorting (US-S4, US-S5) › applies filters from the URL, so filtered links can be shared
- ✅ Inventory: filtering and sorting (US-S4, US-S5) › shows applied filters as removable chips and clears them all
- ✅ Inventory: filtering and sorting (US-S4, US-S5) › keeps what the user is typing when the page re-renders before it is applied
- ✅ Inventory: filtering and sorting (US-S4, US-S5) › opens a shared link with an inverted price range instead of hanging
- ✅ Inventory: filtering and sorting (US-S4, US-S5) › blocks an inverted price range without calling the API
- ✅ Inventory: filtering and sorting (US-S4, US-S5) › explains when no vehicle matches and offers to clear the filters
- ✅ Inventory: filtering and sorting (US-S4, US-S5) › sorts by price
- ✅ Inventory: purchasing (US-S6) › opens a confirmation sheet with a quantity stepper and a live total
- ✅ Inventory: purchasing (US-S6) › buys, updates the card from the response and confirms with a toast
- ✅ Inventory: purchasing (US-S6) › keeps the sheet open and explains when someone else bought the stock first
- ✅ Inventory: purchasing (US-S6) › closes the sheet and explains when the vehicle no longer exists

</details>

<details><summary><code>src/features/inventory/MobileFilters.test.tsx</code>: 4/4 passed</summary>

- ✅ compact price filter for small screens › opens a Price sheet and applies the range on Show Results
- ✅ compact price filter for small screens › will not apply an inverted range
- ✅ compact price filter for small screens › Reset clears the price range
- ✅ tab bar for small screens › links to the top-level sections and marks the current one

</details>

<details><summary><code>src/features/purchases/PurchasesPage.test.tsx</code>: 5/5 passed</summary>

- ✅ My Purchases (US-S7) › lists purchases newest first with quantity, date and total
- ✅ My Purchases (US-S7) › summarises the number of purchases and the amount spent
- ✅ My Purchases (US-S7) › keeps purchases of vehicles that were removed, marked as no longer listed (D7)
- ✅ My Purchases (US-S7) › explains an empty history and links back to the inventory
- ✅ My Purchases (US-S7) › offers a retry when the history fails to load

</details>

<details><summary><code>src/lib/api/client.test.ts</code>: 7/7 passed</summary>

- ✅ createApiClient › sends JSON with the bearer token and returns the parsed body
- ✅ createApiClient › omits the Authorization header when there is no token
- ✅ createApiClient › returns undefined for 204 No Content
- ✅ createApiClient › throws an ApiError carrying the API error code, message and field details
- ✅ createApiClient › reports unreachable servers as a NETWORK_ERROR with a helpful message
- ✅ createApiClient › calls onUnauthorized when an authenticated request gets a 401
- ✅ createApiClient › does not call onUnauthorized for a failed sign-in (no token was sent)

</details>

<details><summary><code>src/lib/filters.test.ts</code>: 22/22 passed</summary>

- ✅ parseFilters › reads every filter and the sort from the URL
- ✅ parseFilters › falls back to defaults for missing or unknown values
- ✅ parseFilters › drops price values that are not whole rupees, so a bad link cannot stall the page
- ✅ parseFilters › swaps an inverted price range from the URL instead of rejecting it
- ✅ parseFilters › accepts a lowercase category
- ✅ toSearchParams › writes only non-empty values and leaves out the default sort
- ✅ toSearchParams › round-trips with parseFilters
- ✅ hasActiveFilters › ignores the sort order
- ✅ hasActiveFilters › is true when any filter is set
- ✅ validateFilters › accepts empty and valid price bounds
- ✅ validateFilters › rejects a minimum above the maximum
- ✅ validateFilters › rejects prices that are not whole positive numbers
- ✅ toApiQuery › returns null when no filters are set, so the plain list endpoint is used
- ✅ toApiQuery › builds the search query without the sort
- ✅ activeFilterChips and removeFilter › describes each active filter as a removable chip
- ✅ activeFilterChips and removeFilter › labels one-sided price ranges
- ✅ activeFilterChips and removeFilter › removes one filter (both price bounds for the price chip)
- ✅ sortVehicles › sorts by newest
- ✅ sortVehicles › sorts by price_asc
- ✅ sortVehicles › sorts by price_desc
- ✅ sortVehicles › sorts by year_desc
- ✅ sortVehicles › does not mutate the input

</details>

<details><summary><code>src/lib/format.test.ts</code>: 16/16 passed</summary>

- ✅ formatINR › formats 1250000 with Indian digit grouping and no paise
- ✅ formatINR › formats 649000 with Indian digit grouping and no paise
- ✅ formatINR › formats 10300000 with Indian digit grouping and no paise
- ✅ formatINR › formats 999 with Indian digit grouping and no paise
- ✅ formatINR › shows paise only when they are not zero
- ✅ formatPriceHint › describes 1250000 in lakh or crore
- ✅ formatPriceHint › describes 649000 in lakh or crore
- ✅ formatPriceHint › describes 100000 in lakh or crore
- ✅ formatPriceHint › describes 10300000 in lakh or crore
- ✅ formatPriceHint › describes 63900000 in lakh or crore
- ✅ formatPriceHint › returns null below one lakh, where the exact figure is already short
- ✅ formatDateTime › formats an ISO timestamp for India
- ✅ categoryLabel › labels SUV as SUV
- ✅ categoryLabel › labels SEDAN as Sedan
- ✅ categoryLabel › labels HATCHBACK as Hatchback
- ✅ categoryLabel › labels ELECTRIC as Electric

</details>

<details><summary><code>src/lib/stock.test.ts</code>: 9/9 passed</summary>

- ✅ stockStatus (D27) › treats 0 as sold out
- ✅ stockStatus (D27) › treats 1 as low stock
- ✅ stockStatus (D27) › treats 2 as low stock
- ✅ stockStatus (D27) › treats 3 as low stock
- ✅ stockStatus (D27) › treats more than the threshold as in stock
- ✅ stockLabel › labels 0 as "Sold out"
- ✅ stockLabel › labels 1 as "Only 1 left"
- ✅ stockLabel › labels 3 as "Only 3 left"
- ✅ stockLabel › labels 12 as "12 in stock"

</details>
