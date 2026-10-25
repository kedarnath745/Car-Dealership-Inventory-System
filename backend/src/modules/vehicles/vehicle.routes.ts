import { Router } from 'express';
import { requireAuth } from '../../middleware/requireAuth';
import { requireRole } from '../../middleware/requireRole';
import { validateBody, validateParams } from '../../middleware/validate';
import * as vehicleController from './vehicle.controller';
import { createVehicleSchema, vehicleIdParamsSchema } from './vehicle.schemas';

export const vehicleRouter = Router();

// Every vehicle endpoint requires a logged-in user.
vehicleRouter.use(requireAuth);

vehicleRouter.get('/', vehicleController.list);
vehicleRouter.get('/:id', validateParams(vehicleIdParamsSchema), vehicleController.getById);

vehicleRouter.post(
  '/',
  requireRole('ADMIN'),
  validateBody(createVehicleSchema),
  vehicleController.create,
);
