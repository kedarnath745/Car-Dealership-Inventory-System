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

export const badRequest = (code: string, message: string, details?: unknown) =>
  new AppError(400, code, message, details);
export const notFound = (message: string) => new AppError(404, 'NOT_FOUND', message);
export const conflict = (code: string, message: string) => new AppError(409, code, message);
export const unauthorized = (code: string, message: string) => new AppError(401, code, message);
export const forbidden = () =>
  new AppError(403, 'FORBIDDEN', 'You do not have permission to perform this action');
