import type { Vehicle } from './api/types';
import {
  DEFAULT_FILTERS,
  activeFilterChips,
  hasActiveFilters,
  parseFilters,
  removeFilter,
  sortVehicles,
  toApiQuery,
  toSearchParams,
  validateFilters,
} from './filters';

describe('parseFilters', () => {
  it('reads every filter and the sort from the URL', () => {
    const params = new URLSearchParams(
      'make=toy&model=fort&category=SUV&minPrice=100000&maxPrice=5000000&sort=price_asc',
    );

    expect(parseFilters(params)).toEqual({
      make: 'toy',
      model: 'fort',
      category: 'SUV',
      minPrice: '100000',
      maxPrice: '5000000',
      sort: 'price_asc',
    });
  });

  it('falls back to defaults for missing or unknown values', () => {
    expect(parseFilters(new URLSearchParams('category=SPACESHIP&sort=random'))).toEqual(
      DEFAULT_FILTERS,
    );
  });

  it('drops price values that are not whole rupees, so a bad link cannot stall the page', () => {
    const filters = parseFilters(new URLSearchParams('minPrice=abc&maxPrice=12x'));

    expect(filters.minPrice).toBe('');
    expect(filters.maxPrice).toBe('');
  });

  it('swaps an inverted price range from the URL instead of rejecting it', () => {
    const filters = parseFilters(new URLSearchParams('minPrice=500000&maxPrice=100000'));

    expect(filters).toMatchObject({ minPrice: '100000', maxPrice: '500000' });
  });

  it('accepts a lowercase category', () => {
    expect(parseFilters(new URLSearchParams('category=suv')).category).toBe('SUV');
  });
});

describe('toSearchParams', () => {
  it('writes only non-empty values and leaves out the default sort', () => {
    const params = toSearchParams({ ...DEFAULT_FILTERS, make: 'Tata', minPrice: '500000' });

    expect(params.toString()).toBe('make=Tata&minPrice=500000');
  });

  it('round-trips with parseFilters', () => {
    const filters = {
      ...DEFAULT_FILTERS,
      model: 'Creta',
      category: 'SUV' as const,
      sort: 'year_desc' as const,
    };

    expect(parseFilters(toSearchParams(filters))).toEqual(filters);
  });
});

describe('hasActiveFilters', () => {
  it('ignores the sort order', () => {
    expect(hasActiveFilters({ ...DEFAULT_FILTERS, sort: 'price_desc' })).toBe(false);
  });

  it('is true when any filter is set', () => {
    expect(hasActiveFilters({ ...DEFAULT_FILTERS, maxPrice: '900000' })).toBe(true);
  });
});

describe('validateFilters', () => {
  it('accepts empty and valid price bounds', () => {
    expect(validateFilters(DEFAULT_FILTERS)).toEqual({});
    expect(validateFilters({ ...DEFAULT_FILTERS, minPrice: '100', maxPrice: '100' })).toEqual({});
  });

  it('rejects a minimum above the maximum', () => {
    expect(validateFilters({ ...DEFAULT_FILTERS, minPrice: '900', maxPrice: '100' })).toEqual({
      minPrice: 'Min price must be less than max price',
    });
  });

  it('rejects prices that are not whole positive numbers', () => {
    expect(validateFilters({ ...DEFAULT_FILTERS, minPrice: 'abc', maxPrice: '-5' })).toEqual({
      minPrice: 'Enter a price in rupees',
      maxPrice: 'Enter a price in rupees',
    });
  });
});

describe('toApiQuery', () => {
  it('returns null when no filters are set, so the plain list endpoint is used', () => {
    expect(toApiQuery({ ...DEFAULT_FILTERS, sort: 'price_asc' })).toBeNull();
  });

  it('builds the search query without the sort', () => {
    const query = toApiQuery({
      ...DEFAULT_FILTERS,
      make: ' Toyota ',
      category: 'SUV',
      maxPrice: '4000000',
      sort: 'price_desc',
    });

    expect(query?.toString()).toBe('make=Toyota&category=SUV&maxPrice=4000000');
  });
});

describe('activeFilterChips and removeFilter', () => {
  const filters = {
    ...DEFAULT_FILTERS,
    make: 'Toyota',
    category: 'SUV' as const,
    minPrice: '1000000',
    maxPrice: '4000000',
  };

  it('describes each active filter as a removable chip', () => {
    expect(activeFilterChips(filters)).toEqual([
      { key: 'make', label: 'Make: Toyota' },
      { key: 'category', label: 'SUV' },
      { key: 'price', label: '₹10,00,000 – ₹40,00,000' },
    ]);
  });

  it('labels one-sided price ranges', () => {
    expect(activeFilterChips({ ...DEFAULT_FILTERS, minPrice: '500000' })).toEqual([
      { key: 'price', label: 'From ₹5,00,000' },
    ]);
    expect(activeFilterChips({ ...DEFAULT_FILTERS, maxPrice: '500000' })).toEqual([
      { key: 'price', label: 'Up to ₹5,00,000' },
    ]);
  });

  it('removes one filter (both price bounds for the price chip)', () => {
    expect(removeFilter(filters, 'price')).toEqual({ ...filters, minPrice: '', maxPrice: '' });
    expect(removeFilter(filters, 'category')).toEqual({ ...filters, category: '' });
  });
});

describe('sortVehicles', () => {
  const vehicle = (model: string, price: number, year: number, createdAt: string) =>
    ({ model, price, year, createdAt }) as Vehicle;
  const list = [
    vehicle('B', 500, 2023, '2026-01-02'),
    vehicle('A', 900, 2025, '2026-01-01'),
    vehicle('C', 100, 2025, '2026-01-03'),
  ];
  const models = (vehicles: Vehicle[]) => vehicles.map((v) => v.model);

  it.each([
    ['newest', ['C', 'B', 'A']],
    ['price_asc', ['C', 'B', 'A']],
    ['price_desc', ['A', 'B', 'C']],
    ['year_desc', ['C', 'A', 'B']],
  ] as const)('sorts by %s', (sort, expected) => {
    expect(models(sortVehicles(list, sort))).toEqual(expected);
  });

  it('does not mutate the input', () => {
    sortVehicles(list, 'price_asc');
    expect(models(list)).toEqual(['B', 'A', 'C']);
  });
});
