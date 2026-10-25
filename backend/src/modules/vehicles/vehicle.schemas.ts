import { Category } from '@prisma/client';
import { z } from 'zod';

/** The first petrol car (Benz Patent-Motorwagen) was built in 1886. */
const FIRST_CAR_YEAR = 1886;
/** Largest value a Decimal(12,2) column can hold. */
const MAX_PRICE = 9_999_999_999.99;
const MAX_STOCK = 10_000;

const requiredText = (label: string) =>
  z
    .string(`${label} is required`)
    .trim()
    .min(1, `${label} is required`)
    .max(50, `${label} must be at most 50 characters`);

/** True when the number has no more than two decimal places (paise). */
const hasAtMostTwoDecimals = (value: number) =>
  Math.abs(value * 100 - Math.round(value * 100)) < 1e-6;

const price = z
  .number('Price must be a number')
  .positive('Price must be greater than 0')
  .max(MAX_PRICE, 'Price is too large')
  .refine(hasAtMostTwoDecimals, 'Price can have at most 2 decimal places');

const year = z
  .number('Year must be a number')
  .int('Year must be a whole number')
  .min(FIRST_CAR_YEAR, `Year must be ${FIRST_CAR_YEAR} or later`)
  // Checked at request time so the upper bound moves with the calendar.
  .refine((value) => value <= new Date().getFullYear() + 1, 'Year is too far in the future');

/** Only http(s) URLs: blocks javascript: and data: URLs that would run in the browser. */
const imageUrl = z.preprocess(
  (value) => (value === '' ? null : value),
  z
    .url({ protocol: /^https?$/, error: 'Image URL must be a valid http(s) URL' })
    .max(500, 'Image URL must be at most 500 characters')
    .nullable()
    .optional(),
);

export const createVehicleSchema = z.object({
  make: requiredText('Make'),
  model: requiredText('Model'),
  category: z.enum(Category, 'Category is not valid'),
  price,
  quantity: z
    .number('Quantity must be a number')
    .int('Quantity must be a whole number')
    .min(0, 'Quantity cannot be negative')
    .max(MAX_STOCK, `Quantity must be at most ${MAX_STOCK}`),
  year,
  color: requiredText('Color'),
  imageUrl,
});

export type CreateVehicleInput = z.infer<typeof createVehicleSchema>;
