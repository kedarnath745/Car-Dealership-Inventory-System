import type { Role } from '@prisma/client';
import type { RequestHandler } from 'express';
import { forbidden } from '../errors/AppError';
import { currentUser } from './requireAuth';

/** Allows the request only if the authenticated user has one of the given roles. Use after requireAuth. */
export function requireRole(...allowed: Role[]): RequestHandler {
  return (req, _res, next) => {
    if (!allowed.includes(currentUser(req).role)) {
      throw forbidden();
    }
    next();
  };
}
