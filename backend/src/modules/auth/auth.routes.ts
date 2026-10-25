import { type RequestHandler, Router } from 'express';
import { requireAuth } from '../../middleware/requireAuth';
import { validateBody } from '../../middleware/validate';
import * as authController from './auth.controller';
import { loginSchema, registerSchema } from './auth.schemas';

/**
 * Builds the auth routes. The rate limiter is injected so each app instance owns its
 * counters, and so tests can use small limits.
 */
export function createAuthRouter(rateLimiter: RequestHandler): Router {
  const router = Router();

  router.post('/register', rateLimiter, validateBody(registerSchema), authController.register);
  router.post('/login', rateLimiter, validateBody(loginSchema), authController.login);
  router.get('/me', requireAuth, authController.me);

  return router;
}
