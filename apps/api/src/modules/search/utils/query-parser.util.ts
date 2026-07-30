import { parsePaginationParams } from "../../../common";
import { SEARCH_DEFAULT_ENTITY_TYPES } from "../constants";

import { buildSearchFilters } from "./filter-builder.util";
import { buildSearchSort } from "./sort-builder.util";

import type { SearchEntityType } from "../constants";
import type { SearchQuery } from "../types";

/**
 * Builds a full, normalized `SearchQuery` from an already-validated
 * keyword (see `validation/search-query.schema.ts`) plus raw
 * `req.query` for everything else. Pagination reuses `common/`'s
 * `parsePaginationParams` directly; sort/filters go through this
 * module's own entity-aware builders above.
 */
export function buildSearchQuery(
  rawQuery: Record<string, unknown>,
  keyword: string,
  entityTypes: SearchEntityType[] = [...SEARCH_DEFAULT_ENTITY_TYPES],
): SearchQuery {
  return {
    keyword,
    entityTypes,
    pagination: parsePaginationParams(rawQuery),
    sort: buildSearchSort(rawQuery, entityTypes),
    filters: buildSearchFilters(rawQuery, entityTypes),
  };
}
