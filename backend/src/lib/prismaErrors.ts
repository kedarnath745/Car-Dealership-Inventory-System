import { Prisma } from '@prisma/client';
import { notFound } from '../errors/AppError';

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

/** Runs a write against one record, turning Prisma's "record not found" into a 404. */
export async function orNotFound<T>(write: () => Promise<T>, message: string): Promise<T> {
  try {
    return await write();
  } catch (error) {
    if (isPrismaError(error, PrismaErrorCode.RecordNotFound)) throw notFound(message);
    throw error;
  }
}
