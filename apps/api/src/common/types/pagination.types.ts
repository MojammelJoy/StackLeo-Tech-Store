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

/**
 * Cursor pagination parameters as parsed from a request's query string.
 * `cursor` is opaque to the parser — it's whatever a previous response's
 * `CursorPaginationMeta.nextCursor` returned (this codebase uses the
 * last item's `id`), never constructed by the client.
 */
export interface CursorPaginationParams {
  cursor?: string;
  limit: number;
}

/**
 * Everything a client needs to fetch the next page, without a total
 * count — cursor pagination deliberately never computes one (that would
 * require a separate `COUNT(*)` query, defeating the point of avoiding
 * offset pagination's cost on a large, frequently-changing table).
 */
export interface CursorPaginationMeta {
  limit: number;
  nextCursor: string | null;
  hasNextPage: boolean;
}

export interface CursorPaginatedResult<T> {
  items: T[];
  meta: CursorPaginationMeta;
}
