import { type RequestHandler, Router } from 'express';
import { requireAuth } from '../../middleware/requireAuth';
import { validateBody } from '../../middleware/validate';
import * as authController from './auth.controller';
import { loginSchema, registerSchema } from './auth.schemas';

/**
 * Builds the auth routes. Rate limiters are injected so each app instance owns its
 * counters, and so tests can use small limits.
 */
export function createAuthRouter(limiters: {
  login: RequestHandler;
  register: RequestHandler;
}): Router {
  const router = Router();

  router.post(
    '/register',
    limiters.register,
    validateBody(registerSchema),
    authController.register,
  );
  router.post('/login', limiters.login, validateBody(loginSchema), authController.login);
  router.get('/me', requireAuth, authController.me);

  return router;
}
