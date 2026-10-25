import type { User } from '@prisma/client';
import { conflict, unauthorized } from '../../errors/AppError';
import { signAccessToken } from '../../lib/jwt';
import { hashPassword, verifyPassword } from '../../lib/password';
import { prisma } from '../../lib/prisma';
import { PrismaErrorCode, isPrismaError } from '../../lib/prismaErrors';
import type { LoginInput, RegisterInput } from './auth.schemas';
import { type PublicUser, toPublicUser } from './publicUser';

export interface AuthResult {
  token: string;
  user: PublicUser;
}

/**
 * A valid bcrypt hash that matches no real password. Comparing against it when the
 * email is unknown makes both failure paths take the same time, so response timing
 * does not reveal which emails are registered.
 */
const DUMMY_PASSWORD_HASH = '$2b$10$CwTycUXWue0Thq9StjUM0uJ8.Pd9V1rM2s5nYdNlCZuo2dU0dB9dO';

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
    if (isPrismaError(error, PrismaErrorCode.UniqueConstraintFailed)) {
      throw conflict('EMAIL_TAKEN', 'An account with this email already exists');
    }
    throw error;
  }
}

/** Verifies credentials. Every failure gives the same 401 so callers cannot probe for accounts. */
export async function login(input: LoginInput): Promise<AuthResult> {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  const passwordMatches = await verifyPassword(
    input.password,
    user?.passwordHash ?? DUMMY_PASSWORD_HASH,
  );

  if (!user || !passwordMatches) {
    throw unauthorized('INVALID_CREDENTIALS', 'Invalid email or password');
  }
  return issueAuthResult(user);
}
