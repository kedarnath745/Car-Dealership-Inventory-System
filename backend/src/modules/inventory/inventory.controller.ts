import type { Request, Response } from 'express';
import { currentUser } from '../../middleware/requireAuth';
import * as inventoryService from './inventory.service';

export async function purchase(req: Request<{ id: string }>, res: Response): Promise<void> {
  const result = await inventoryService.purchaseVehicle(
    currentUser(req).id,
    req.params.id,
    req.body.quantity,
  );
  res.status(201).json(result);
}
