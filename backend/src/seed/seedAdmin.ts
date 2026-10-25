import { hashPassword } from '../lib/password';
import { prisma } from '../lib/prisma';

export interface AdminCredentials {
  email: string;
  password: string;
}

/**
 * Ensures an ADMIN account exists for the given email (decision D1: admins are
 * seeded, never self-registered). Safe to run on every deploy: an existing admin is
 * left untouched, password included. If the email already belongs to a regular user
 * (for example someone registered it through the public API first), the seed fails
 * instead of promoting that account, which would hand admin rights to whoever
 * registered it (D22).
 */
export async function seedAdmin({ email, password }: AdminCredentials): Promise<void> {
  const normalisedEmail = email.trim().toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email: normalisedEmail } });
  if (existing) {
    if (existing.role !== 'ADMIN') {
      throw new Error(
        `${normalisedEmail} is already registered as a regular user; refusing to promote it. ` +
          'Choose a different ADMIN_EMAIL or remove that account first.',
      );
    }
    return;
  }
  await prisma.user.create({
    data: {
      name: 'Administrator',
      email: normalisedEmail,
      passwordHash: await hashPassword(password),
      role: 'ADMIN',
    },
  });
}
