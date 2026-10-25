import { Router } from 'express';
import { requireAuth } from '../../middleware/requireAuth';
import * as inventoryController from './inventory.controller';

export const purchaseRouter = Router();

purchaseRouter.get('/me', requireAuth, inventoryController.myPurchases);
