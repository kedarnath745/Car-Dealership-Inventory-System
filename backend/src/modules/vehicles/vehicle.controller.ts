import type { Request, Response } from 'express';
import * as vehicleService from './vehicle.service';

export async function create(req: Request, res: Response): Promise<void> {
  const vehicle = await vehicleService.createVehicle(req.body);
  res.status(201).json({ vehicle });
}

export async function list(_req: Request, res: Response): Promise<void> {
  const vehicles = await vehicleService.listVehicles();
  res.status(200).json({ vehicles });
}

export async function getById(req: Request<{ id: string }>, res: Response): Promise<void> {
  const vehicle = await vehicleService.getVehicle(req.params.id);
  res.status(200).json({ vehicle });
}
