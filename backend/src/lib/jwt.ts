import jwt, { type SignOptions } from 'jsonwebtoken';
import type { Role } from '@prisma/client';
import { env } from '../config/env';

/** Claims carried in an access token. `sub` is the user id. */
export interface AccessTokenClaims {
  sub: string;
  role: Role;
}

export function signAccessToken(claims: AccessTokenClaims): string {
  return jwt.sign({ role: claims.role }, env.JWT_SECRET, {
    subject: claims.sub,
    algorithm: 'HS256',
    expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'],
  });
}
