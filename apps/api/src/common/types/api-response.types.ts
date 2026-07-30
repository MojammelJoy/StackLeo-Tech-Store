import type { PaginationMeta } from "./pagination.types";

export interface ResponseMeta {
  requestId: string;
  timestamp: string;
  pagination?: PaginationMeta;
}

/**
 * Envelope every successful response is wrapped in. `meta` carries
 * request-scoped metadata (and pagination, for list endpoints) alongside
 * the actual payload.
 */
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  meta: ResponseMeta;
}

/**
 * Mirrors the shape `errorHandler` (src/middlewares/error-handler.middleware.ts)
 * already sends for thrown errors, so a route that returns an error
 * directly instead of throwing produces an identical response — callers
 * only ever have to handle one error contract.
 */
export interface ApiErrorResponse {
  error: {
    message: string;
    statusCode: number;
    requestId: string;
    details?: unknown;
  };
}
