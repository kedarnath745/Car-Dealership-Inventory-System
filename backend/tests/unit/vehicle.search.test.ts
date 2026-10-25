import { buildSearchWhere, escapeLikePattern } from '../../src/modules/vehicles/vehicle.service';

describe('escapeLikePattern', () => {
  it.each([
    ['plain text', 'Toyota', 'Toyota'],
    ['percent', '50%', '50\\%'],
    ['underscore', 'XUV_700', 'XUV\\_700'],
    ['backslash', 'a\\b', 'a\\\\b'],
  ])('escapes %s', (_case, input, expected) => {
    expect(escapeLikePattern(input)).toBe(expected);
  });
});

describe('buildSearchWhere', () => {
  it('returns an empty filter when no criteria are given', () => {
    expect(buildSearchWhere({})).toEqual({});
  });

  it('builds a one-sided price range', () => {
    expect(buildSearchWhere({ minPrice: 100 })).toEqual({
      price: { gte: 100, lte: undefined },
    });
  });

  it('combines text, category and price criteria', () => {
    expect(buildSearchWhere({ make: 'toy', category: 'SUV', minPrice: 1, maxPrice: 2 })).toEqual({
      make: { contains: 'toy', mode: 'insensitive' },
      category: 'SUV',
      price: { gte: 1, lte: 2 },
    });
  });
});
