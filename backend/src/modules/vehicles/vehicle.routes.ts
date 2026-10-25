import { Router } from 'express';
import { requireAuth } from '../../middleware/requireAuth';
import { requireRole } from '../../middleware/requireRole';
import { validateBody, validateParams } from '../../middleware/validate';
import * as vehicleController from './vehicle.controller';
import { createVehicleSchema, updateVehicleSchema, vehicleIdParamsSchema } from './vehicle.schemas';

export const vehicleRouter = Router();

// Every vehicle endpoint requires a logged-in user.
vehicleRouter.use(requireAuth);

vehicleRouter.get('/', vehicleController.list);
// Registered before '/:id' so "search" is not mistaken for a vehicle id.
vehicleRouter.get('/search', vehicleController.search);
vehicleRouter.get('/:id', validateParams(vehicleIdParamsSchema), vehicleController.getById);

vehicleRouter.post(
  '/',
  requireRole('ADMIN'),
  validateBody(createVehicleSchema),
  vehicleController.create,
);
vehicleRouter.put(
  '/:id',
  requireRole('ADMIN'),
  validateParams(vehicleIdParamsSchema),
  validateBody(updateVehicleSchema),
  vehicleController.update,
);
vehicleRouter.delete(
  '/:id',
  requireRole('ADMIN'),
  validateParams(vehicleIdParamsSchema),
  vehicleController.remove,
);
