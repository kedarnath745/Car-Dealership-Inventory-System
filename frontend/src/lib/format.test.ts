import { categoryLabel, formatDateTime, formatINR, formatPriceHint } from './format';

describe('formatINR', () => {
  it.each([
    [1250000, '₹12,50,000'],
    [649000, '₹6,49,000'],
    [10300000, '₹1,03,00,000'],
    [999, '₹999'],
  ])('formats %d with Indian digit grouping and no paise', (value, expected) => {
    expect(formatINR(value)).toBe(expected);
  });

  it('shows paise only when they are not zero', () => {
    expect(formatINR(1249999.99)).toBe('₹12,49,999.99');
    expect(formatINR(845000.5)).toBe('₹8,45,000.50');
  });
});

describe('formatPriceHint', () => {
  it.each([
    [1250000, '≈ ₹12.5 lakh'],
    [649000, '≈ ₹6.49 lakh'],
    [100000, '≈ ₹1 lakh'],
    [10300000, '≈ ₹1.03 crore'],
    [63900000, '≈ ₹6.39 crore'],
  ])('describes %d in lakh or crore', (value, expected) => {
    expect(formatPriceHint(value)).toBe(expected);
  });

  it('returns null below one lakh, where the exact figure is already short', () => {
    expect(formatPriceHint(99999)).toBeNull();
  });
});

describe('formatDateTime', () => {
  it('formats an ISO timestamp for India', () => {
    expect(formatDateTime('2026-10-25T10:12:00.000Z')).toMatch(/^25 Oct 2026, 3:42\s?pm$/i);
  });
});

describe('categoryLabel', () => {
  it.each([
    ['SUV', 'SUV'],
    ['SEDAN', 'Sedan'],
    ['HATCHBACK', 'Hatchback'],
    ['ELECTRIC', 'Electric'],
  ] as const)('labels %s as %s', (category, label) => {
    expect(categoryLabel(category)).toBe(label);
  });
});
