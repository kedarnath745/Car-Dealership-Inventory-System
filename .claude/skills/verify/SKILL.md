---
name: verify
description: Run Showroom (API + SPA) and drive it at its real surfaces to verify a change.
---

# Verify Showroom

## Launch locally
Postgres is started by `.claude/hooks/session-start.sh` (role/password `dealership`, DBs
`dealership` and `dealership_test`).

```bash
cd backend && npm run dev            # API on :4000, reads backend/.env
cd frontend && npm run dev           # SPA on :5173, proxies /api to :4000
```
Fresh data: drop and recreate the `dealership` database, then
`npx prisma migrate deploy && npm run db:seed` (admin `admin@dealership.com` /
`showroom-admin-2026`, 18 cars).

## Production
https://car-dealership-inventory-system-gold.vercel.app is public. The `…-git-…-kedarnath745s-projects`
preview URLs need a Vercel login, so they can't be driven from a cloud session.

## Drive
- API: `curl` with `authorization: Bearer <token>` from `POST /api/auth/register` (name ≥ 2 chars,
  password ≥ 15). GET by id returns `{ vehicle }`; list and search return `{ vehicles }`.
- Browser: Playwright (`require('playwright')`, no install needed). Cards are `article`s named by
  the car; card titles are `h2`. Useful names: `Purchase`, `Increase quantity`, `Buy for …`,
  `Add vehicle`, `Edit <Make Model>`, `Restock <Make Model>` → dialog button `Add N units`,
  `Delete <Make Model>` → alertdialog `Delete vehicle`. The `Units to add` and `Quantity` labels
  need `{ exact: true }` because the stepper buttons contain the same words.

## Gotchas
- The register limiter counts every attempt (10 per 15 min per IP); login counts failures only.
- Run concurrency/oversell probes locally, never against production stock.
- Vercel's firewall answers some forged tokens (alg:none) with a plain 403 before the app sees
  them; test token handling locally.
- On Vercel, real files are served first and every other extension-less path (except `/api/`,
  `/assets/`, `/src/`, `/node_modules/`, `/@…`) falls back to `index.html`. Check both `vercel dev -L`
  (Vite module requests must not get HTML) and `vercel build` (`services/frontend/config.json` routes).
- To stop dev servers, use a bracket pattern (`pkill -f '[t]sx watch'`) in a command that doesn't
  otherwise contain the process name, or pkill kills its own shell.
