/**
 * Pagination parameters as parsed from a request's query string — always
 * normalized to a valid page/limit, never the raw (potentially invalid)
 * input.
 */
export interface PaginationParams {
  page: number;
  limit: number;
}

/**
 * Everything a client needs to render pagination controls or fetch the
 * next page, without recomputing anything from the result set itself.
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedResult<T> {
  items: T[];
  meta: PaginationMeta;
}
