import { Prisma, type User } from '@prisma/client';
import { conflict } from '../../errors/AppError';
import { signAccessToken } from '../../lib/jwt';
import { hashPassword } from '../../lib/password';
import { prisma } from '../../lib/prisma';
import type { RegisterInput } from './auth.schemas';

/** The user fields that are safe to send to clients (never the password hash). */
export type PublicUser = Pick<User, 'id' | 'name' | 'email' | 'role'>;

export interface AuthResult {
  token: string;
  user: PublicUser;
}

export function toPublicUser(user: User): PublicUser {
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

function issueAuthResult(user: User): AuthResult {
  return { token: signAccessToken({ sub: user.id, role: user.role }), user: toPublicUser(user) };
}

/**
 * Creates a regular USER account and logs it in.
 * Uniqueness is enforced by the database's unique index rather than a
 * check-then-insert, so two simultaneous sign-ups with one email cannot both succeed.
 */
export async function register(input: RegisterInput): Promise<AuthResult> {
  const passwordHash = await hashPassword(input.password);
  try {
    const user = await prisma.user.create({
      data: { name: input.name, email: input.email, passwordHash },
    });
    return issueAuthResult(user);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw conflict('EMAIL_TAKEN', 'An account with this email already exists');
    }
    throw error;
  }
}
