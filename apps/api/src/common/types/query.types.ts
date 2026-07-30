import type { PaginationParams } from "./pagination.types";

export type SortOrder = "asc" | "desc";

export interface SortParam {
  field: string;
  order: SortOrder;
}

export type FilterOperator = "eq" | "ne" | "gt" | "gte" | "lt" | "lte" | "in" | "contains";

export interface FilterCondition {
  operator: FilterOperator;
  value: unknown;
}

export type FilterParams = Record<string, FilterCondition>;

/**
 * Restricts which fields a query may sort or filter by. Passed by each
 * route handler, since the set of safe fields is inherently
 * domain-specific even though the parsing logic is not.
 */
export interface QueryParserOptions {
  sortableFields?: readonly string[];
  filterableFields?: readonly string[];
}

/**
 * The fully normalized shape the query parser produces from raw
 * `req.query`. Downstream code (repositories, services) consumes this
 * instead of touching `req.query` itself.
 */
export interface ParsedQuery {
  pagination: PaginationParams;
  sort: SortParam[];
  filters: FilterParams;
  search?: string;
}
