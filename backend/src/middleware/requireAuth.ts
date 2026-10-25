import type { Request, RequestHandler } from 'express';
import { AppError, unauthorized } from '../errors/AppError';
import { verifyAccessToken } from '../lib/jwt';
import { prisma } from '../lib/prisma';
import { type PublicUser, toPublicUser } from '../modules/auth/publicUser';

const BEARER_PATTERN = /^Bearer (\S+)$/;

/**
 * Requires a valid `Authorization: Bearer <jwt>` header and loads the user it names.
 *
 * The user is re-read from the database on every request (one primary-key lookup),
 * so deleting a user or changing their role takes effect immediately instead of
 * when their token expires. The token only proves identity; the database is the
 * source of truth for the role.
 */
export const requireAuth: RequestHandler = async (req, _res, next) => {
  const match = BEARER_PATTERN.exec(req.headers.authorization ?? '');
  if (!match?.[1]) {
    throw unauthorized('MISSING_TOKEN', 'Authentication required');
  }

  const userId = verifyAccessToken(match[1]);
  const user = userId ? await prisma.user.findUnique({ where: { id: userId } }) : null;
  if (!user) {
    throw unauthorized('INVALID_TOKEN', 'Invalid or expired token');
  }

  req.user = toPublicUser(user);
  next();
};

/** The authenticated user. Only call this in handlers mounted after requireAuth. */
export function currentUser(req: Request): PublicUser {
  if (!req.user) {
    throw new AppError(500, 'AUTH_NOT_CONFIGURED', 'Route is missing requireAuth');
  }
  return req.user;
}
