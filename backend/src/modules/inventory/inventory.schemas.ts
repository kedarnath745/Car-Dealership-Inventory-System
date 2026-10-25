import { z } from 'zod';

/** Upper bound per order: blocks typos like 1000 and keeps totals within Decimal(14,2). */
export const MAX_PURCHASE_QUANTITY = 100;
/** Upper bound per restock, matching the stock limit on vehicle creation. */
export const MAX_RESTOCK_QUANTITY = 10_000;

export const purchaseSchema = z.object({
  quantity: z
    .number('Quantity must be a number')
    .int('Quantity must be a whole number')
    .min(1, 'Quantity must be at least 1')
    .max(MAX_PURCHASE_QUANTITY, `You can buy at most ${MAX_PURCHASE_QUANTITY} at once`)
    .default(1),
});

export type PurchaseInput = z.infer<typeof purchaseSchema>;

export const restockSchema = z.object({
  quantity: z
    .number('Quantity is required')
    .int('Quantity must be a whole number')
    .min(1, 'Quantity must be at least 1')
    .max(MAX_RESTOCK_QUANTITY, `You can restock at most ${MAX_RESTOCK_QUANTITY} at once`),
});

export type RestockInput = z.infer<typeof restockSchema>;
