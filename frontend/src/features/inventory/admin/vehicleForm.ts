import { z } from 'zod';
import type { VehicleInput } from '../../../lib/api/endpoints';
import { CATEGORIES, type Category, type Vehicle } from '../../../lib/api/types';

/**
 * Form values are strings (what inputs hold); they are converted to API numbers on
 * submit. Rules mirror the API's create/update schemas (DESIGN §4).
 */
const FIRST_CAR_YEAR = 1886;
const MAX_PRICE = 9_999_999_999.99;
const MAX_STOCK = 10_000;
const nextYear = () => new Date().getFullYear() + 1;

const text = (field: string, label: string) =>
  z.string().trim().min(1, `Enter the ${field}`).max(50, `${label} must be at most 50 characters`);

const isHttpUrl = (value: string) => {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

const baseSchema = z.object({
  make: text('make', 'Make'),
  model: text('model', 'Model'),
  category: z
    .string()
    .refine((value) => (CATEGORIES as readonly string[]).includes(value), 'Choose a category'),
  year: z
    .string()
    .trim()
    .min(1, 'Enter the year')
    .refine(
      (value) =>
        /^\d{4}$/.test(value) && Number(value) >= FIRST_CAR_YEAR && Number(value) <= nextYear(),
      // Computed per check so the upper bound moves with the calendar.
      { error: () => `Enter a year between ${FIRST_CAR_YEAR} and ${nextYear()}` },
    ),
  color: text('colour', 'Colour'),
  price: z
    .string()
    .trim()
    .min(1, 'Enter the price in rupees')
    .refine(
      (value) => /^\d+(\.\d{1,2})?$/.test(value) && Number(value) > 0 && Number(value) <= MAX_PRICE,
      'Enter a price above ₹0, with at most 2 decimal places',
    ),
  imageUrl: z
    .string()
    .trim()
    .max(500, 'Image URL must be at most 500 characters')
    .refine(
      (value) => value === '' || isHttpUrl(value),
      'Enter a link starting with http:// or https://',
    ),
});

export const createVehicleFormSchema = baseSchema.extend({
  quantity: z
    .string()
    .trim()
    .min(1, 'Enter the initial stock')
    .refine(
      (value) => /^\d+$/.test(value) && Number(value) <= MAX_STOCK,
      `Enter a whole number from 0 to ${MAX_STOCK.toLocaleString('en-IN')}`,
    ),
});

/** Editing never touches stock (D19), so the field does not exist there. */
export const editVehicleFormSchema = baseSchema.extend({ quantity: z.string() });

export type VehicleFormValues = z.infer<typeof createVehicleFormSchema>;
export type VehicleFormField = keyof VehicleFormValues;

export const EMPTY_VEHICLE_FORM: VehicleFormValues = {
  make: '',
  model: '',
  category: '',
  year: '',
  color: '',
  price: '',
  quantity: '',
  imageUrl: '',
};

export function toFormValues(vehicle: Vehicle): VehicleFormValues {
  return {
    make: vehicle.make,
    model: vehicle.model,
    category: vehicle.category,
    year: String(vehicle.year),
    color: vehicle.color,
    price: String(vehicle.price),
    quantity: String(vehicle.quantity),
    imageUrl: vehicle.imageUrl ?? '',
  };
}

/** Converts form strings to the API payload for the given fields. */
export function toVehicleInput(
  values: VehicleFormValues,
  fields: readonly VehicleFormField[],
): Partial<VehicleInput> {
  const payload: Partial<VehicleInput> = {};
  for (const field of fields) {
    switch (field) {
      case 'year':
      case 'price':
      case 'quantity':
        payload[field] = Number(values[field]);
        break;
      case 'category':
        payload.category = values.category as Category;
        break;
      case 'imageUrl':
        payload.imageUrl = values.imageUrl.trim() === '' ? null : values.imageUrl.trim();
        break;
      default:
        payload[field] = values[field].trim();
    }
  }
  return payload;
}

export const CREATE_FIELDS: readonly VehicleFormField[] = [
  'make',
  'model',
  'category',
  'year',
  'color',
  'price',
  'quantity',
  'imageUrl',
];
