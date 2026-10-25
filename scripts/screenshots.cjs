/**
 * Captures the README screenshots from a running app (Playwright, real browser).
 *
 *   APP_URL=http://localhost:5173 ADMIN_EMAIL=... ADMIN_PASSWORD=... node scripts/screenshots.cjs
 *
 * Needs the backend (with seeded data) and the frontend running. A demo shopper account
 * is registered through the API on first use. Writes PNGs to docs/screenshots/.
 */
const path = require('node:path');
const { chromium } = require('playwright');

const BASE = process.env.APP_URL ?? 'http://localhost:5173';
const OUT = path.join(__dirname, '..', 'docs', 'screenshots');
const SHOPPER = { name: 'Arjun Mehta', email: 'arjun@example.com', password: 'showroom-demo-user' };
const ADMIN = {
  email: process.env.ADMIN_EMAIL ?? 'admin@dealership.com',
  password: process.env.ADMIN_PASSWORD ?? 'showroom-admin-2026',
};

async function ensureShopper() {
  await fetch(`${BASE}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(SHOPPER),
  }); // 409 when it already exists, which is fine
}

async function main() {
  await ensureShopper();
  const browser = await chromium.launch();

  async function shot(name, { mobile = false, dark = false, as, route = '/' }, act = async () => {}) {
    const context = await browser.newContext({
      viewport: mobile ? { width: 390, height: 844 } : { width: 1280, height: 820 },
      deviceScaleFactor: mobile ? 2 : 1.5,
      colorScheme: dark ? 'dark' : 'light',
      isMobile: mobile,
      hasTouch: mobile,
    });
    const page = await context.newPage();
    if (as) {
      const user = as === 'admin' ? ADMIN : SHOPPER;
      await page.goto(`${BASE}/login`);
      await page.getByLabel('Email').fill(user.email);
      await page.getByLabel('Password', { exact: true }).fill(user.password);
      await page.getByRole('button', { name: 'Sign in' }).click();
      await page.getByRole('heading', { name: 'Inventory' }).waitFor();
      await page.getByRole('article').first().waitFor();
      if (route !== '/') await page.goto(BASE + route);
    } else {
      await page.goto(BASE + route);
    }
    await act(page);
    await page.mouse.move(0, 0);
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(OUT, `${name}.png`) });
    await context.close();
    console.log('saved', name);
  }

  await shot('sign-in', { route: '/login' });
  await shot('register-mobile-dark', { mobile: true, dark: true, route: '/register' });
  await shot('inventory', { as: 'shopper' });
  await shot('inventory-dark', { as: 'shopper', dark: true });
  await shot('inventory-filtered', { as: 'shopper' }, async (page) => {
    await page.getByRole('radiogroup').getByText('SUV', { exact: true }).click();
    await page.getByLabel('Max price').fill('2000000');
    await page.waitForURL(/maxPrice=2000000/);
  });
  await shot('inventory-mobile', { as: 'shopper', mobile: true });
  await shot('purchase-sheet', { as: 'shopper' }, async (page) => {
    await page.getByRole('article', { name: /Mahindra XUV700$/ }).getByRole('button', { name: 'Purchase' }).click();
    await page.getByRole('button', { name: 'Increase quantity' }).click();
  });
  await shot('purchase-sheet-mobile-dark', { as: 'shopper', mobile: true, dark: true }, async (page) => {
    await page.getByRole('button', { name: 'Purchase' }).first().click();
    await page.getByRole('dialog').waitFor();
  });
  await shot('my-purchases', { as: 'shopper', route: '/purchases' }, (page) =>
    page.getByRole('list', { name: 'Purchases' }).waitFor(),
  );
  await shot('admin-inventory', { as: 'admin' });
  await shot('admin-add-vehicle-dark', { as: 'admin', dark: true }, async (page) => {
    await page.getByRole('button', { name: 'Add vehicle' }).click();
    const sheet = page.getByRole('dialog');
    await sheet.getByLabel('Make').fill('Kia');
    await sheet.getByLabel('Model').fill('Seltos');
    await sheet.getByLabel('Category').selectOption('SUV');
  });
  await shot('admin-restock', { as: 'admin' }, async (page) => {
    await page.getByRole('button', { name: /^Restock / }).first().click();
    await page.getByRole('dialog').waitFor();
  });
  await shot('admin-delete-mobile', { as: 'admin', mobile: true }, async (page) => {
    await page.getByRole('button', { name: /^Delete / }).first().click();
    await page.getByRole('alertdialog').waitFor();
  });
  await browser.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
