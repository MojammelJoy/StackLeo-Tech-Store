import { AppError } from "../../errors";
import { HTTP_STATUS } from "../constants";

import type { ApiErrorResponse } from "../types";
import type { Response } from "express";

/**
 * Builds the same error envelope `errorHandler`
 * (src/middlewares/error-handler.middleware.ts) already sends for thrown
 * errors, so a handler that returns an error directly instead of
 * throwing produces an identical response — callers only ever have to
 * handle one error contract. Intentionally duplicated rather than
 * shared, so the global error middleware stays free of a dependency on
 * this module.
 */
export function buildErrorResponse(error: Error | AppError, requestId: string): ApiErrorResponse {
  const isAppError = error instanceof AppError;

  return {
    error: {
      message: error.message,
      statusCode: isAppError ? error.statusCode : HTTP_STATUS.INTERNAL_SERVER_ERROR,
      requestId,
      ...(isAppError && error.details !== undefined ? { details: error.details } : {}),
    },
  };
}

/**
 * Sends an error response directly, for handlers that have already
 * caught a failure and chosen not to re-throw it. Prefer throwing an
 * `AppError` and letting the global error middleware handle it whenever
 * that's an option — this exists for the cases where it isn't.
 */
export function sendError(res: Response, error: Error | AppError): void {
  const isAppError = error instanceof AppError;
  const statusCode = isAppError ? error.statusCode : HTTP_STATUS.INTERNAL_SERVER_ERROR;

  res.status(statusCode).json(buildErrorResponse(error, res.req.id));
}
