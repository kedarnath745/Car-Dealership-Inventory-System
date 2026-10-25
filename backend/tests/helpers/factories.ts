import type { Role, User } from '@prisma/client';
import { hashPassword } from '../../src/lib/password';
import { prisma } from '../../src/lib/prisma';

export const DEFAULT_PASSWORD = 'secret123';

let sequence = 0;

/**
 * Inserts a user straight into the database. Used for setup that the public
 * API deliberately cannot do, such as creating an ADMIN.
 */
export async function createUser(
  overrides: Partial<{ name: string; email: string; password: string; role: Role }> = {},
): Promise<User> {
  sequence += 1;
  return prisma.user.create({
    data: {
      name: overrides.name ?? `Test User ${sequence}`,
      email: overrides.email ?? `user${sequence}@example.com`,
      passwordHash: await hashPassword(overrides.password ?? DEFAULT_PASSWORD),
      role: overrides.role ?? 'USER',
    },
  });
}
