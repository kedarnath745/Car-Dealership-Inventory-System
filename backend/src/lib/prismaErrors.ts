import { Prisma } from '@prisma/client';

/**
 * Prisma error codes the API reacts to.
 * @see https://www.prisma.io/docs/orm/reference/error-reference
 */
export const PrismaErrorCode = {
  UniqueConstraintFailed: 'P2002',
  RecordNotFound: 'P2025',
} as const;

export function isPrismaError(
  error: unknown,
  code: (typeof PrismaErrorCode)[keyof typeof PrismaErrorCode],
): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === code;
}
