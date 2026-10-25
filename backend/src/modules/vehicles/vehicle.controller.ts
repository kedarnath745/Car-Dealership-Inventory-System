import type { Request, Response } from 'express';
import * as vehicleService from './vehicle.service';

export async function create(req: Request, res: Response): Promise<void> {
  const vehicle = await vehicleService.createVehicle(req.body);
  res.status(201).json({ vehicle });
}
