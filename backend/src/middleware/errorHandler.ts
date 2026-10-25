import type { ErrorRequestHandler, RequestHandler } from 'express';
import { AppError, notFound } from '../errors/AppError';

/** Catches requests that matched no route. */
export const notFoundHandler: RequestHandler = (req, _res, next) => {
  next(notFound(`Route ${req.method} ${req.originalUrl} not found`));
};

/** Errors raised by express.json() carry a `type` describing what went wrong. */
function isBodyParserError(err: unknown): err is { type: string; status: number } {
  return typeof err === 'object' && err !== null && 'type' in err && 'status' in err;
}

/** Maps body-parser failures to client errors instead of letting them become 500s. */
function fromBodyParserError(err: { type: string; status: number }): AppError | undefined {
  if (err.type === 'entity.parse.failed') {
    return new AppError(400, 'INVALID_JSON', 'Request body is not valid JSON');
  }
  if (err.type === 'entity.too.large') {
    return new AppError(413, 'PAYLOAD_TOO_LARGE', 'Request body is too large');
  }
  return undefined;
}

/**
 * Single place where errors become HTTP responses.
 * Known AppErrors keep their status and code; anything else is logged and
 * reported as a generic 500 so internals never leak to the client.
 */
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  const appError =
    err instanceof AppError ? err : isBodyParserError(err) ? fromBodyParserError(err) : undefined;

  if (appError) {
    res.status(appError.status).json({
      error: {
        code: appError.code,
        message: appError.message,
        ...(appError.details !== undefined && { details: appError.details }),
      },
    });
    return;
  }

  console.error(err);
  res.status(500).json({
    error: { code: 'INTERNAL_SERVER_ERROR', message: 'Something went wrong' },
  });
};
