import { LOW_STOCK_THRESHOLD, stockLabel, stockStatus } from './stock';

describe('stockStatus (D27)', () => {
  it('treats 0 as sold out', () => {
    expect(stockStatus(0)).toBe('sold-out');
  });

  it.each([1, 2, LOW_STOCK_THRESHOLD])('treats %d as low stock', (quantity) => {
    expect(stockStatus(quantity)).toBe('low');
  });

  it('treats more than the threshold as in stock', () => {
    expect(stockStatus(LOW_STOCK_THRESHOLD + 1)).toBe('in-stock');
  });
});

describe('stockLabel', () => {
  it.each([
    [0, 'Sold out'],
    [1, 'Only 1 left'],
    [3, 'Only 3 left'],
    [12, '12 in stock'],
  ])('labels %d as "%s"', (quantity, label) => {
    expect(stockLabel(quantity)).toBe(label);
  });
});
