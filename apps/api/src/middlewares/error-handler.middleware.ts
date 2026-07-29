import type { NextFunction, Request, Response } from "express";

import { AppError } from "../errors";
import { logger } from "../logger";

interface ErrorResponseBody {
  error: {
    message: string;
    statusCode: number;
    requestId: string;
    details?: unknown;
  };
}

/**
 * Final error-handling middleware. Must be registered last in app.ts.
 * Normalizes both operational (AppError) and unexpected errors into a
 * single, consistent JSON shape and never leaks internals in production.
 *
 * Express only recognizes this as an error handler because it declares
 * all four parameters — `next` must stay, even though it is unused.
 */
export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction): void {
  const isAppError = err instanceof AppError;
  const statusCode = isAppError ? err.statusCode : 500;
  const message = isAppError || err instanceof Error ? err.message : "Unexpected error";

  logger.error(
    {
      err,
      requestId: req.id,
      statusCode,
      path: req.originalUrl,
      method: req.method,
    },
    "Request failed",
  );

  const body: ErrorResponseBody = {
    error: {
      message: isAppError ? message : "Internal server error",
      statusCode,
      requestId: req.id,
      ...(isAppError && err.details !== undefined ? { details: err.details } : {}),
    },
  };

  res.status(statusCode).json(body);
}
