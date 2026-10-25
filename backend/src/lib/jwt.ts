import jwt, { type SignOptions } from 'jsonwebtoken';
import type { Role } from '@prisma/client';
import { env } from '../config/env';

/** Claims carried in an access token. `sub` is the user id. */
export interface AccessTokenClaims {
  sub: string;
  role: Role;
}

/** Only this algorithm is accepted, which blocks "alg: none" and algorithm-confusion attacks. */
const ALGORITHM = 'HS256';

export function signAccessToken(claims: AccessTokenClaims): string {
  return jwt.sign({ role: claims.role }, env.JWT_SECRET, {
    subject: claims.sub,
    algorithm: ALGORITHM,
    expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'],
  });
}

/**
 * Returns the user id from a valid token, or `null` if the token is malformed,
 * badly signed or expired. Callers decide how to report the failure.
 */
export function verifyAccessToken(token: string): string | null {
  try {
    const payload = jwt.verify(token, env.JWT_SECRET, { algorithms: [ALGORITHM] });
    return typeof payload === 'object' && typeof payload.sub === 'string' ? payload.sub : null;
  } catch {
    return null;
  }
}
