import cors from 'cors';
import express, { type Express } from 'express';
import helmet from 'helmet';
import { env } from './config/env';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { type RateLimitOptions, createAuthRateLimiter } from './middleware/rateLimit';
import { createAuthRouter } from './modules/auth/auth.routes';
import { purchaseRouter } from './modules/inventory/purchase.routes';
import { vehicleRouter } from './modules/vehicles/vehicle.routes';

export interface AppOptions {
  /** Overrides the auth rate limit from the environment (used by tests). */
  authRateLimit?: RateLimitOptions;
  /** Overrides TRUST_PROXY: how many reverse proxies sit in front of the app. */
  trustProxy?: number;
}

/**
 * Builds the Express application without starting a server,
 * so tests can exercise it in-process with Supertest.
 */
export function createApp(options: AppOptions = {}): Express {
  const app = express();

  // Behind a proxy (Render, Nginx) the client IP comes from X-Forwarded-For; without
  // this setting every user would share the proxy's IP and its rate limit.
  app.set('trust proxy', options.trustProxy ?? env.TRUST_PROXY);

  app.use(helmet());
  app.use(cors({ origin: env.CORS_ORIGIN.split(',').map((origin) => origin.trim()) }));
  app.use(express.json({ limit: '100kb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  const rateLimit = options.authRateLimit ?? {
    limit: env.AUTH_RATE_LIMIT_MAX,
    windowMs: env.AUTH_RATE_LIMIT_WINDOW_MINUTES * 60_000,
  };

  app.use(
    '/api/auth',
    createAuthRouter({
      login: createAuthRateLimiter(rateLimit),
      register: createAuthRateLimiter(rateLimit, { countSuccessful: true }),
    }),
  );
  app.use('/api/vehicles', vehicleRouter);
  app.use('/api/purchases', purchaseRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
