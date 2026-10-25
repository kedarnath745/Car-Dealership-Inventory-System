import { Router } from 'express';
import { requireAuth } from '../../middleware/requireAuth';
import { requireRole } from '../../middleware/requireRole';
import { validateBody } from '../../middleware/validate';
import * as vehicleController from './vehicle.controller';
import { createVehicleSchema } from './vehicle.schemas';

export const vehicleRouter = Router();

// Every vehicle endpoint requires a logged-in user.
vehicleRouter.use(requireAuth);

vehicleRouter.post(
  '/',
  requireRole('ADMIN'),
  validateBody(createVehicleSchema),
  vehicleController.create,
);
