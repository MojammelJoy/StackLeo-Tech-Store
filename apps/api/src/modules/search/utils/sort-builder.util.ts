import { parseSortParams } from "../../../common";
import { SEARCH_SORTABLE_FIELDS_BY_ENTITY } from "../constants";

import type { SortParam } from "../../../common";
import type { SearchEntityType } from "../constants";

/**
 * Builds sort instructions valid across the given entity types, reusing
 * `common/`'s `parseSortParams` with the union of each entity type's own
 * allowed sortable fields. Same rationale as `buildSearchFilters` in
 * `filter-builder.util.ts`.
 */
export function buildSearchSort(
  rawQuery: Record<string, unknown>,
  entityTypes: SearchEntityType[],
): SortParam[] {
  const allowedFields = Array.from(
    new Set(entityTypes.flatMap((entityType) => SEARCH_SORTABLE_FIELDS_BY_ENTITY[entityType])),
  );

  const sortQuery = rawQuery.sort as string | string[] | undefined;
  return parseSortParams(sortQuery, allowedFields);
}
