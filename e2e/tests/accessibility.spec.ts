import AxeBuilder from '@axe-core/playwright';
import { type Page, expect, test } from '@playwright/test';
import { registerShopper, signInAsAdmin } from './helpers';

/**
 * Automated WCAG 2.2 A/AA checks (axe-core) on every main screen, in light and dark mode.
 * axe catches labels, names, roles and colour contrast; it can't judge everything
 * (focus order, wording), which the component tests and manual checks cover.
 */
async function expectNoViolations(page: Page, screen: string) {
  const { violations } = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze();
  const summary = violations.map(
    (v) => `${v.id} (${v.impact}): ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`,
  );
  expect(summary, `${screen} has accessibility violations`).toEqual([]);
}

for (const colorScheme of ['light', 'dark'] as const) {
  test.describe(`accessibility in ${colorScheme} mode`, () => {
    test.use({ colorScheme });

    test('sign-in and registration pages', async ({ page }) => {
      await page.goto('/login');
      await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
      await expectNoViolations(page, 'Sign-in page');

      await page.goto('/register');
      await expect(page.getByRole('button', { name: 'Create account' })).toBeVisible();
      await expectNoViolations(page, 'Registration page');
    });

    test('inventory, purchase sheet and purchase history for a shopper', async ({ page }) => {
      await registerShopper(page);
      await expect(page.getByRole('article').first()).toBeVisible();
      await expectNoViolations(page, 'Inventory');

      await page.getByRole('button', { name: 'Purchase' }).first().click();
      await expect(page.getByRole('dialog')).toBeVisible();
      await expectNoViolations(page, 'Purchase sheet');
      await page.keyboard.press('Escape');

      await page.goto('/purchases');
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      await expectNoViolations(page, 'Purchase history');
    });

    test('admin tools', async ({ page }) => {
      await signInAsAdmin(page);
      await expectNoViolations(page, 'Inventory as admin');

      await page.getByRole('button', { name: 'Add vehicle' }).click();
      await expect(page.getByRole('dialog')).toBeVisible();
      await expectNoViolations(page, 'Add vehicle form');
    });

    test('phone layout with the tab bar', async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await registerShopper(page);
      await expect(page.getByRole('navigation', { name: 'Tabs' })).toBeVisible();
      await expectNoViolations(page, 'Inventory on a phone');
    });
  });
}
