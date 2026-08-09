export interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Mirrors apps/api's `ApiSuccessResponse<T>` envelope exactly
 * (src/common/types/api-response.types.ts) — every list/read endpoint
 * wraps its payload this way. `pagination` is only present on list
 * endpoints (`sendPaginatedResponse`); absent on single-resource reads
 * (`sendSuccess`).
 */
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  meta: {
    requestId: string;
    timestamp: string;
    pagination?: PaginationMeta;
  };
}
