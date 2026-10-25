import type { Category } from './api/types';

const LAKH = 100_000;
const CRORE = 10_000_000;

const rupees = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});
const rupeesWithPaise = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** `₹12,50,000`: Indian digit grouping, paise only when they are not zero (D28). */
export function formatINR(value: number): string {
  const hasPaise = Math.round(value * 100) % 100 !== 0;
  return (hasPaise ? rupeesWithPaise : rupees).format(value);
}

/** Up to two decimals without trailing zeros: 12.50 → "12.5", 1.00 → "1". */
const compact = (value: number) => String(Number(value.toFixed(2)));

/** `≈ ₹12.5 lakh` / `≈ ₹1.03 crore`: how Indian buyers talk about car prices (D28). */
export function formatPriceHint(value: number): string | null {
  if (value >= CRORE) return `≈ ₹${compact(value / CRORE)} crore`;
  if (value >= LAKH) return `≈ ₹${compact(value / LAKH)} lakh`;
  return null;
}

const dateTime = new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' });

/** `25 Oct 2026, 3:42 pm` in the viewer's time zone. */
export function formatDateTime(iso: string): string {
  return dateTime.format(new Date(iso));
}

const CATEGORY_LABELS: Record<Category, string> = {
  SEDAN: 'Sedan',
  SUV: 'SUV',
  HATCHBACK: 'Hatchback',
  COUPE: 'Coupe',
  CONVERTIBLE: 'Convertible',
  TRUCK: 'Truck',
  VAN: 'Van',
  ELECTRIC: 'Electric',
};

export function categoryLabel(category: Category): string {
  return CATEGORY_LABELS[category];
}
