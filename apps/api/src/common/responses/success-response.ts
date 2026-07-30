import { HTTP_STATUS } from "../constants";

import type { ApiSuccessResponse, PaginationMeta } from "../types";
import type { Response } from "express";

export interface SendSuccessOptions {
  statusCode?: number;
  pagination?: PaginationMeta;
}

/**
 * Builds the standard success envelope. Kept separate from `sendSuccess`
 * so callers that need the raw body (tests, or any non-Express context)
 * don't have to construct a fake `Response` just to get it.
 */
export function buildSuccessResponse<T>(
  data: T,
  requestId: string,
  pagination?: PaginationMeta,
): ApiSuccessResponse<T> {
  return {
    success: true,
    data,
    meta: {
      requestId,
      timestamp: new Date().toISOString(),
      ...(pagination ? { pagination } : {}),
    },
  };
}

/**
 * Sends a successful JSON response in the standard envelope. Reads the
 * request ID the `requestId` middleware already attached to `req.id`
 * rather than requiring every call site to pass it through explicitly.
 */
export function sendSuccess<T>(res: Response, data: T, options: SendSuccessOptions = {}): void {
  const { statusCode = HTTP_STATUS.OK, pagination } = options;
  res.status(statusCode).json(buildSuccessResponse(data, res.req.id, pagination));
}
