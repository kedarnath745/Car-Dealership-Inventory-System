import { CATEGORIES, type Category, type Vehicle } from './api/types';
import { categoryLabel, formatINR } from './format';

export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'year_desc', label: 'Year: Newest First' },
] as const;

export type SortOption = (typeof SORT_OPTIONS)[number]['value'];

/**
 * Filter state as the inputs hold it. Prices stay strings so a half-typed value is
 * never lost; they are validated before any request is made.
 */
export interface Filters {
  make: string;
  model: string;
  category: Category | '';
  minPrice: string;
  maxPrice: string;
  sort: SortOption;
}

export type FilterKey = 'make' | 'model' | 'category' | 'price';

export const DEFAULT_FILTERS: Filters = {
  make: '',
  model: '',
  category: '',
  minPrice: '',
  maxPrice: '',
  sort: 'newest',
};

const isCategory = (value: string): value is Category =>
  (CATEGORIES as readonly string[]).includes(value);
const isSort = (value: string): value is SortOption =>
  SORT_OPTIONS.some((option) => option.value === value);

/** Reads filters from the URL; unknown values fall back to defaults. */
export function parseFilters(params: URLSearchParams): Filters {
  const category = (params.get('category') ?? '').toUpperCase();
  const sort = params.get('sort') ?? '';
  return {
    make: params.get('make') ?? '',
    model: params.get('model') ?? '',
    category: isCategory(category) ? category : '',
    minPrice: params.get('minPrice') ?? '',
    maxPrice: params.get('maxPrice') ?? '',
    sort: isSort(sort) ? sort : DEFAULT_FILTERS.sort,
  };
}

/** Writes filters to the URL so results can be shared and survive a reload. */
export function toSearchParams(filters: Filters): URLSearchParams {
  const params = new URLSearchParams();
  for (const key of ['make', 'model', 'category', 'minPrice', 'maxPrice'] as const) {
    if (filters[key]) params.set(key, filters[key]);
  }
  if (filters.sort !== DEFAULT_FILTERS.sort) params.set('sort', filters.sort);
  return params;
}

export function hasActiveFilters(filters: Filters): boolean {
  return Boolean(
    filters.make.trim() ||
    filters.model.trim() ||
    filters.category ||
    filters.minPrice ||
    filters.maxPrice,
  );
}

export type FilterErrors = Partial<Record<'minPrice' | 'maxPrice', string>>;

const isWholeRupees = (value: string) => /^\d+$/.test(value);

/** Client-side checks mirroring the API, so an invalid range never reaches the server. */
export function validateFilters(filters: Filters): FilterErrors {
  const errors: FilterErrors = {};
  if (filters.minPrice && !isWholeRupees(filters.minPrice)) {
    errors.minPrice = 'Enter a price in rupees';
  }
  if (filters.maxPrice && !isWholeRupees(filters.maxPrice)) {
    errors.maxPrice = 'Enter a price in rupees';
  }
  if (
    !errors.minPrice &&
    !errors.maxPrice &&
    filters.minPrice &&
    filters.maxPrice &&
    Number(filters.minPrice) > Number(filters.maxPrice)
  ) {
    errors.minPrice = 'Min price must be less than max price';
  }
  return errors;
}

/** Query for `GET /api/vehicles/search`, or null when the plain list endpoint applies. */
export function toApiQuery(filters: Filters): URLSearchParams | null {
  if (!hasActiveFilters(filters)) return null;
  const query = new URLSearchParams();
  if (filters.make.trim()) query.set('make', filters.make.trim());
  if (filters.model.trim()) query.set('model', filters.model.trim());
  if (filters.category) query.set('category', filters.category);
  if (filters.minPrice) query.set('minPrice', filters.minPrice);
  if (filters.maxPrice) query.set('maxPrice', filters.maxPrice);
  return query;
}

export interface FilterChip {
  key: FilterKey;
  label: string;
}

/** One removable chip per active filter, so users always see what is applied. */
export function activeFilterChips(filters: Filters): FilterChip[] {
  const chips: FilterChip[] = [];
  if (filters.make.trim()) chips.push({ key: 'make', label: `Make: ${filters.make.trim()}` });
  if (filters.model.trim()) chips.push({ key: 'model', label: `Model: ${filters.model.trim()}` });
  if (filters.category) chips.push({ key: 'category', label: categoryLabel(filters.category) });

  const min = filters.minPrice ? formatINR(Number(filters.minPrice)) : '';
  const max = filters.maxPrice ? formatINR(Number(filters.maxPrice)) : '';
  if (min && max) chips.push({ key: 'price', label: `${min} – ${max}` });
  else if (min) chips.push({ key: 'price', label: `From ${min}` });
  else if (max) chips.push({ key: 'price', label: `Up to ${max}` });
  return chips;
}

export function removeFilter(filters: Filters, key: FilterKey): Filters {
  if (key === 'price') return { ...filters, minPrice: '', maxPrice: '' };
  return { ...filters, [key]: '' };
}

const byNewest = (a: Vehicle, b: Vehicle) => b.createdAt.localeCompare(a.createdAt);

const COMPARATORS: Record<SortOption, (a: Vehicle, b: Vehicle) => number> = {
  newest: byNewest,
  price_asc: (a, b) => a.price - b.price || byNewest(a, b),
  price_desc: (a, b) => b.price - a.price || byNewest(a, b),
  year_desc: (a, b) => b.year - a.year || byNewest(a, b),
};

/** Client-side sort (D32). Returns a new array. */
export function sortVehicles(vehicles: readonly Vehicle[], sort: SortOption): Vehicle[] {
  return [...vehicles].sort(COMPARATORS[sort]);
}
