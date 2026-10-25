import type { RequestHandler } from 'express';
import type { ZodType, z } from 'zod';
import { badRequest } from '../errors/AppError';

/** One entry per invalid field, e.g. `{ field: 'email', message: 'Invalid email address' }`. */
export interface FieldError {
  field: string;
  message: string;
}

/**
 * Parses `data` with the schema, or throws a 400 VALIDATION_ERROR listing every
 * invalid field. The single place where zod errors become API errors.
 */
export function parseOrThrow<S extends ZodType>(schema: S, data: unknown): z.output<S> {
  const result = schema.safeParse(data);
  if (!result.success) {
    const details: FieldError[] = result.error.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));
    throw badRequest('VALIDATION_ERROR', 'Request validation failed', details);
  }
  return result.data;
}

/**
 * Replaces `req.body` with the parsed result (trimmed, normalised, unknown keys
 * stripped), so controllers only ever see clean data.
 */
export function validateBody(schema: ZodType): RequestHandler {
  return (req, _res, next) => {
    req.body = parseOrThrow(schema, req.body ?? {});
    next();
  };
}

/** Validates route parameters such as `:id` before any database work happens. */
export function validateParams(schema: ZodType<Record<string, string>>): RequestHandler {
  return (req, _res, next) => {
    req.params = parseOrThrow(schema, req.params);
    next();
  };
}
