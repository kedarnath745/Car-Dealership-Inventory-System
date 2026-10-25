import { expect, test } from '@playwright/test';
import { registerShopper, signIn } from './helpers';

test.describe('sign-in and sessions (F2)', () => {
  test('a deep link asks for sign-in first, then opens the page that was asked for', async ({
    page,
  }) => {
    const { email } = await registerShopper(page);
    await page.evaluate(() => localStorage.clear());

    await page.goto('/purchases');
    await expect(page).toHaveURL(/\/login/);
    await signIn(page, email, 'a-long-shopper-password');
    await expect(page).toHaveURL(/\/purchases$/);
  });

  test('a wrong password gets one generic message', async ({ page }) => {
    const { email } = await registerShopper(page);
    await page.evaluate(() => localStorage.clear());

    await page.goto('/login');
    await signIn(page, email, 'not-the-right-password');
    await expect(page.getByRole('alert')).toContainText("That email and password don't match");
  });

  test('a tampered session ends cleanly with an explanation', async ({ page }) => {
    await registerShopper(page);
    await page.evaluate(() => localStorage.setItem('showroom.token', 'tampered.token.value'));

    await page.reload();
    await expect(page).toHaveURL(/\/login/);
    await expect(
      page.getByText('Your session has ended. Sign in again to continue.'),
    ).toBeVisible();
  });

  test('an unknown page takes a signed-in user back to the inventory', async ({ page }) => {
    await registerShopper(page);
    await page.goto('/no-such-page');
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole('heading', { name: 'Inventory' })).toBeVisible();
  });
});
