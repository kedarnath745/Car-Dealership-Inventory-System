import { hashPassword } from '../lib/password';
import { prisma } from '../lib/prisma';

export interface AdminCredentials {
  email: string;
  password: string;
}

/**
 * Ensures an ADMIN account exists for the given email (decision D1: admins are
 * seeded, never self-registered). Safe to run on every deploy: an existing
 * account is promoted to ADMIN but keeps its current password.
 */
export async function seedAdmin({ email, password }: AdminCredentials): Promise<void> {
  const normalisedEmail = email.trim().toLowerCase();
  await prisma.user.upsert({
    where: { email: normalisedEmail },
    update: { role: 'ADMIN' },
    create: {
      name: 'Administrator',
      email: normalisedEmail,
      passwordHash: await hashPassword(password),
      role: 'ADMIN',
    },
  });
}
