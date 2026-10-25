import { expect, test } from '@playwright/test';
import { card, registerShopper } from './helpers';

test.describe('shopper journey (F2–F5)', () => {
  test('registers, filters with a shareable link, buys two cars and sees the purchase', async ({
    page,
  }) => {
    await registerShopper(page);
    await expect(page.getByText('18 cars')).toBeVisible();

    // Filter: SUVs up to ₹15 lakh (Creta and XUV700; the Fortuner is too expensive).
    await page.getByRole('radiogroup').getByText('SUV', { exact: true }).click();
    await page.getByLabel('Max price').fill('1500000');
    await expect(page.getByText('2 cars')).toBeVisible();
    await expect(page).toHaveURL(/category=SUV/);
    await expect(page).toHaveURL(/maxPrice=1500000/);

    // The link is shareable: a reload shows the same results.
    await page.reload();
    await expect(page.getByText('2 cars')).toBeVisible();
    await expect(page.getByRole('radio', { name: 'SUV' })).toBeChecked();

    // Buy two Cretas (6 in stock, ₹11,10,900 each).
    await card(page, 'Hyundai Creta').getByRole('button', { name: 'Purchase' }).click();
    const sheet = page.getByRole('dialog');
    await sheet.getByRole('button', { name: 'Increase quantity' }).click();
    await sheet.getByRole('button', { name: 'Buy for ₹22,21,800' }).click();
    await expect(page.getByText('Bought 2 × Hyundai Creta')).toBeVisible();
    await expect(card(page, 'Hyundai Creta').getByText('4 in stock')).toBeVisible();

    await page.getByRole('link', { name: 'My purchases' }).click();
    await expect(page.getByRole('list', { name: 'Purchases' })).toContainText('Hyundai Creta');
    await expect(page.getByRole('list', { name: 'Purchases' })).toContainText('× 2');
  });

  test('cannot buy a sold-out car', async ({ page }) => {
    await registerShopper(page);
    const hilux = card(page, 'Toyota Hilux');
    await expect(hilux.getByText('Sold out').first()).toBeVisible();
    await expect(hilux.getByRole('button', { name: 'Sold out' })).toBeDisabled();
  });

  test('cleans a hand-edited link to the filters it applied', async ({ page }) => {
    await registerShopper(page);
    await page.goto('/?minPrice=abc&maxPrice=-5&category=SPACESHIP&make=Hyundai');
    await expect(page).toHaveURL(/\/\?make=Hyundai$/);
    await expect(page.getByRole('article').first()).toBeVisible();
  });

  test('sees no admin tools', async ({ page }) => {
    await registerShopper(page);
    await expect(page.getByRole('article').first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'Add vehicle' })).toHaveCount(0);
    await expect(page.getByRole('button', { name: /^(Edit|Restock|Delete) / })).toHaveCount(0);
  });
});
