import type { RequestHandler } from 'express';
import type { ZodType } from 'zod';
import { badRequest } from '../errors/AppError';

/** One entry per invalid field, e.g. `{ field: 'email', message: 'Invalid email address' }`. */
export interface FieldError {
  field: string;
  message: string;
}

/**
 * Validates `req.body` against a zod schema and replaces it with the parsed
 * (trimmed, normalised, unknown-keys-stripped) result, so controllers only ever
 * see clean data. Invalid input becomes a 400 VALIDATION_ERROR with field details.
 */
export function validateBody(schema: ZodType): RequestHandler {
  return (req, _res, next) => {
    const result = schema.safeParse(req.body ?? {});
    if (!result.success) {
      const details: FieldError[] = result.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));
      next(badRequest('VALIDATION_ERROR', 'Request validation failed', details));
      return;
    }
    req.body = result.data;
    next();
  };
}
