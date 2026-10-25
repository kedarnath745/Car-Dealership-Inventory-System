import type { User } from '@prisma/client';

/** The user fields that are safe to send to clients (never the password hash). */
export type PublicUser = Pick<User, 'id' | 'name' | 'email' | 'role'>;

export function toPublicUser(user: User): PublicUser {
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}
