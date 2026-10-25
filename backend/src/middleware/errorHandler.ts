import type { ErrorRequestHandler, RequestHandler } from 'express';
import { AppError, notFound } from '../errors/AppError';

/** Catches requests that matched no route. */
export const notFoundHandler: RequestHandler = (req, _res, next) => {
  next(notFound(`Route ${req.method} ${req.originalUrl} not found`));
};

/**
 * Single place where errors become HTTP responses.
 * Known AppErrors keep their status and code; anything else is logged and
 * reported as a generic 500 so internals never leak to the client.
 */
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof AppError) {
    res.status(err.status).json({
      error: {
        code: err.code,
        message: err.message,
        ...(err.details !== undefined && { details: err.details }),
      },
    });
    return;
  }

  console.error(err);
  res.status(500).json({
    error: { code: 'INTERNAL_SERVER_ERROR', message: 'Something went wrong' },
  });
};
