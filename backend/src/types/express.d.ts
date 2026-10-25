import type { PublicUser } from '../modules/auth/publicUser';

declare global {
  namespace Express {
    interface Request {
      /** The authenticated user, set by the requireAuth middleware. */
      user?: PublicUser;
    }
  }
}

export {};
