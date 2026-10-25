import { expect, test } from '@playwright/test';
import { card, signInAsAdmin } from './helpers';

test('admin adds, edits, restocks and deletes a car (F6)', async ({ page }) => {
  await signInAsAdmin(page);

  await page.getByRole('button', { name: 'Add vehicle' }).click();
  const form = page.getByRole('dialog');
  await form.getByLabel('Make').fill('Kia');
  await form.getByLabel('Model').fill('Seltos');
  await form.getByLabel('Category').selectOption('SUV');
  await form.getByLabel('Year').fill('2025');
  await form.getByLabel('Colour').fill('Glacier White');
  await form.getByLabel('Price').fill('1149000');
  await form.getByLabel('Initial stock').fill('3');
  await form.getByRole('button', { name: 'Save' }).click();
  await expect(page.getByText('Added Kia Seltos')).toBeVisible();
  await expect(card(page, 'Kia Seltos').getByText('₹11,49,000')).toBeVisible();

  await page.getByRole('button', { name: 'Edit Kia Seltos' }).click();
  await page.getByRole('dialog').getByLabel('Price').fill('1199000');
  await page.getByRole('dialog').getByRole('button', { name: 'Save' }).click();
  await expect(card(page, 'Kia Seltos').getByText('₹11,99,000')).toBeVisible();

  await page.getByRole('button', { name: 'Restock Kia Seltos' }).click();
  await page.getByRole('dialog').getByLabel('Units to add', { exact: true }).fill('5');
  await page.getByRole('dialog').getByRole('button', { name: 'Add 5 units' }).click();
  await expect(page.getByText('Restocked Kia Seltos: 8 in stock')).toBeVisible();

  await page.getByRole('button', { name: 'Delete Kia Seltos' }).click();
  await page.getByRole('alertdialog').getByRole('button', { name: 'Delete vehicle' }).click();
  await expect(page.getByText('Deleted Kia Seltos')).toBeVisible();
  await expect(card(page, 'Kia Seltos')).toHaveCount(0);
});
