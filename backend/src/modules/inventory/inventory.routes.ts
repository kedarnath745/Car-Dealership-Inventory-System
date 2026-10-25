import { Router } from 'express';
import { validateBody } from '../../middleware/validate';
import * as inventoryController from './inventory.controller';
import { purchaseSchema } from './inventory.schemas';

/**
 * Stock-changing actions on one vehicle. Mounted by the vehicle router under
 * `/:id`, which has already authenticated the user and validated the id.
 */
export const inventoryRouter = Router({ mergeParams: true });

inventoryRouter.post('/purchase', validateBody(purchaseSchema), inventoryController.purchase);
