import type { User } from '@prisma/client';
import { signAccessToken } from '../../src/lib/jwt';

/** A valid `Authorization` header value for the given user. */
export function bearerFor(user: Pick<User, 'id' | 'role'>): string {
  return `Bearer ${signAccessToken({ sub: user.id, role: user.role })}`;
}
