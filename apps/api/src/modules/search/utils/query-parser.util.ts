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
 * module's own entity-aware builders above. `priceMin`/`priceMax`/
 * `inStock` are read directly off `rawQuery` (never validated with the
 * rest, same permissive treatment as everything else here) — mirrors
 * `modules/product`'s `ProductController` reading `priceMin`/`priceMax`
 * directly off `req.query` rather than through the generic
 * `field[operator]=value` filter mechanism.
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
    priceMin: toFiniteNumber(rawQuery.priceMin),
    priceMax: toFiniteNumber(rawQuery.priceMax),
    inStock: toBoolean(rawQuery.inStock),
  };
}

function toFiniteNumber(value: unknown): number | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function toBoolean(value: unknown): boolean | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  if (raw === "true") return true;
  if (raw === "false") return false;
  return undefined;
}
