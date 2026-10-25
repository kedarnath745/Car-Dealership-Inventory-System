/** 1–3 units shows "Only N left" (decision D27). */
export const LOW_STOCK_THRESHOLD = 3;

export type StockStatus = 'in-stock' | 'low' | 'sold-out';

export function stockStatus(quantity: number): StockStatus {
  if (quantity <= 0) return 'sold-out';
  if (quantity <= LOW_STOCK_THRESHOLD) return 'low';
  return 'in-stock';
}

/** Text that always accompanies the badge colour, so status never relies on colour alone. */
export function stockLabel(quantity: number): string {
  switch (stockStatus(quantity)) {
    case 'sold-out':
      return 'Sold out';
    case 'low':
      return `Only ${quantity} left`;
    default:
      return `${quantity} in stock`;
  }
}
