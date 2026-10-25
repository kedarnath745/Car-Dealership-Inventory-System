import cors from 'cors';
import express, { type Express } from 'express';
import helmet from 'helmet';
import { env } from './config/env';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { authRouter } from './modules/auth/auth.routes';
import { purchaseRouter } from './modules/inventory/purchase.routes';
import { vehicleRouter } from './modules/vehicles/vehicle.routes';

/**
 * Builds the Express application without starting a server,
 * so tests can exercise it in-process with Supertest.
 */
export function createApp(): Express {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: env.CORS_ORIGIN.split(',').map((origin) => origin.trim()) }));
  app.use(express.json({ limit: '100kb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.use('/api/auth', authRouter);
  app.use('/api/vehicles', vehicleRouter);
  app.use('/api/purchases', purchaseRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
