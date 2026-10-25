import type { RequestHandler } from 'express';
import { rateLimit } from 'express-rate-limit';
import { AppError } from '../errors/AppError';

export interface RateLimitOptions {
  /** Failed attempts allowed per client within the window. */
  limit: number;
  windowMs: number;
}

/**
 * Brute-force protection for credential endpoints (decision D24, NIST SP 800-63B-4).
 * Only failed requests count, so a user who signs in correctly is never locked out.
 * Counters live in memory, which suits a single API instance; several instances
 * would need a shared store such as Redis.
 */
export function createAuthRateLimiter({ limit, windowMs }: RateLimitOptions): RequestHandler {
  return rateLimit({
    windowMs,
    limit,
    skipSuccessfulRequests: true,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    handler: (_req, _res, next) => {
      next(
        new AppError(
          429,
          'RATE_LIMITED',
          'Too many attempts. Please wait a few minutes and try again.',
        ),
      );
    },
  });
}
