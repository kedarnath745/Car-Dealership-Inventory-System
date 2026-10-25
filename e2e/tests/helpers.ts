import { type Page, expect } from '@playwright/test';
import { ADMIN } from '../playwright.config';

let counter = 0;

/** Registers a brand-new shopper through the sign-up form and waits for the inventory. */
export async function registerShopper(page: Page, name = 'Asha Verma') {
  const email = `shopper-${Date.now()}-${counter++}@example.com`;
  await page.goto('/register');
  await page.getByLabel('Name').fill(name);
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password', { exact: true }).fill('a-long-shopper-password');
  await page.getByRole('button', { name: 'Create account' }).click();
  await expect(page.getByRole('heading', { name: 'Inventory' })).toBeVisible();
  return { email };
}

export async function signIn(page: Page, email: string, password: string) {
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Sign in' }).click();
}

export async function signInAsAdmin(page: Page) {
  await page.goto('/login');
  await signIn(page, ADMIN.email, ADMIN.password);
  await expect(page.getByRole('button', { name: 'Add vehicle' })).toBeVisible();
}

/** A vehicle card, found by its accessible name ("2025 Hyundai Creta"). */
export const card = (page: Page, makeAndModel: string) =>
  page.getByRole('article', { name: new RegExp(`${makeAndModel}$`) });
