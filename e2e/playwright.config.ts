import { defineConfig, devices } from '@playwright/test';

/**
 * End-to-end suite: starts its own API (port 4100) on a dedicated database that is reset and
 * seeded on every run, and its own Vite dev server (port 5174) proxying /api to that API.
 * Nothing here touches the development database or the servers on 4000/5173.
 */
const DATABASE_URL =
  process.env.E2E_DATABASE_URL ??
  'postgresql://dealership:dealership@localhost:5432/dealership_e2e';
export const ADMIN = { email: 'admin@dealership.com', password: 'e2e-admin-password-2026' };

export default defineConfig({
  testDir: './tests',
  // The tests share one seeded database, so they run one at a time in a fixed order.
  workers: 1,
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: 'http://localhost:5174',
    ...devices['Desktop Chrome'],
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: [
    {
      cwd: '../backend',
      command: 'npx tsx scripts/e2e-prepare.ts && npx tsx src/server.ts',
      url: 'http://localhost:4100/api/health',
      reuseExistingServer: false,
      timeout: 120_000,
      env: {
        DATABASE_URL,
        PORT: '4100',
        NODE_ENV: 'development',
        JWT_SECRET: 'e2e-only-secret-not-used-anywhere-else-0123456789',
        ADMIN_EMAIL: ADMIN.email,
        ADMIN_PASSWORD: ADMIN.password,
        // Every test registers a fresh shopper; the real limit (10 per 15 min) would trip.
        AUTH_RATE_LIMIT_MAX: '1000',
      },
    },
    {
      cwd: '../frontend',
      command: 'npx vite --port 5174 --strictPort',
      url: 'http://localhost:5174',
      reuseExistingServer: false,
      timeout: 120_000,
      env: { API_PROXY_TARGET: 'http://localhost:4100' },
    },
  ],
});
