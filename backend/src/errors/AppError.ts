/**
 * An expected, client-facing error. Services throw these; the error-handling
 * middleware turns them into `{ error: { code, message, details? } }` responses.
 */
export class AppError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const notFound = (message: string) => new AppError(404, 'NOT_FOUND', message);
