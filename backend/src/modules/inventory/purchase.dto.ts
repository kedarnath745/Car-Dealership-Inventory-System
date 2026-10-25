import type { Purchase } from '@prisma/client';

/** A purchase as sent to clients: money as numbers, buyer id omitted (it is always the caller). */
export type PurchaseResponse = Omit<Purchase, 'userId' | 'unitPrice' | 'totalPrice'> & {
  unitPrice: number;
  totalPrice: number;
};

export function toPurchaseResponse({ userId: _userId, ...purchase }: Purchase): PurchaseResponse {
  return {
    ...purchase,
    unitPrice: purchase.unitPrice.toNumber(),
    totalPrice: purchase.totalPrice.toNumber(),
  };
}
