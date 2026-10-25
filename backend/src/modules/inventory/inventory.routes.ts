import { Router } from 'express';
import { requireRole } from '../../middleware/requireRole';
import { validateBody } from '../../middleware/validate';
import * as inventoryController from './inventory.controller';
import { purchaseSchema, restockSchema } from './inventory.schemas';

/**
 * Stock-changing actions on one vehicle. Mounted by the vehicle router under
 * `/:id`, which has already authenticated the user and validated the id.
 */
export const inventoryRouter = Router({ mergeParams: true });

inventoryRouter.post('/purchase', validateBody(purchaseSchema), inventoryController.purchase);
inventoryRouter.post(
  '/restock',
  requireRole('ADMIN'),
  validateBody(restockSchema),
  inventoryController.restock,
);
