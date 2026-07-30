import { QUERY_PARAM_KEYS } from "../constants";
import { parsePaginationParams } from "../pagination";

import { parseFilterParams } from "./filtering.utils";
import { parseSortParams } from "./sorting.utils";

import type { ParsedQuery, QueryParserOptions } from "../types";

/**
 * Normalizes a raw Express `req.query` object into pagination, sort,
 * filter, and search instructions in one pass, so route handlers never
 * touch `req.query` directly.
 */
export function parseQuery(
  query: Record<string, unknown>,
  options: QueryParserOptions = {},
): ParsedQuery {
  const search = query[QUERY_PARAM_KEYS.SEARCH];
  const sortQuery = query[QUERY_PARAM_KEYS.SORT] as string | string[] | undefined;

  return {
    pagination: parsePaginationParams(query),
    sort: parseSortParams(sortQuery, options.sortableFields),
    filters: parseFilterParams(query, options.filterableFields),
    search: typeof search === "string" && search.length > 0 ? search : undefined,
  };
}
