/**
 * Shared, domain-agnostic API infrastructure: response envelopes,
 * pagination/sorting/filtering utilities, request validation, and the
 * constants/types they all share. Nothing here knows about any specific
 * business domain — future feature modules (products, orders, etc.)
 * depend on this layer, never the other way around.
 */
export { HTTP_STATUS, PAGINATION_DEFAULTS, QUERY_PARAM_KEYS, SORT_DEFAULTS } from "./constants";
export type { HttpStatus } from "./constants";

export { buildPaginationMeta, getPaginationOffset, parsePaginationParams } from "./pagination";

export {
  buildErrorResponse,
  buildSuccessResponse,
  sendError,
  sendPaginatedResponse,
  sendSuccess,
} from "./responses";
export type { SendSuccessOptions } from "./responses";

export type {
  ApiErrorResponse,
  ApiSuccessResponse,
  FilterCondition,
  FilterOperator,
  FilterParams,
  ParsedQuery,
  PaginatedResult,
  PaginationMeta,
  PaginationParams,
  QueryParserOptions,
  ResponseMeta,
  SortOrder,
  SortParam,
} from "./types";

export { parseFilterParams, parseQuery, parseSortParams } from "./utils";

export { validateRequest } from "./validation";
export type { RequestValidationSchemas } from "./validation";
