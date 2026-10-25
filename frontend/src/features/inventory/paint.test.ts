import { FALLBACK_PAINT, paintFor } from './paint';

describe('paintFor', () => {
  it.each([
    ['Pristine White', '#F2F2EF'],
    ['Platinum White Pearl', '#F2F2EF'],
    ['Abyss Black', '#1D1F21'],
    ['Titan Grey', '#7D858A'],
    ['Galena Gray', '#7D858A'],
    ['Sizzling Red', '#B3261E'],
    ['Lava Blue', '#2B4C7E'],
    ['Wine Red', '#6D1F2A'],
    ['Champagne Gold', '#CDBB9B'],
  ])('maps "%s" to a paint colour', (color, paint) => {
    expect(paintFor(color)).toBe(paint);
  });

  it('matches case-insensitively', () => {
    expect(paintFor('SILVER')).toBe(paintFor('silver'));
  });

  it('falls back to a neutral paint for names it does not know', () => {
    expect(paintFor('Zandvoort')).toBe(FALLBACK_PAINT);
  });
});
