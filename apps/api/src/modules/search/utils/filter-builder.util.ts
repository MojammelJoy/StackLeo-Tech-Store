import { parseFilterParams } from "../../../common";
import { SEARCH_FILTERABLE_FIELDS_BY_ENTITY } from "../constants";

import type { FilterParams } from "../../../common";
import type { SearchEntityType } from "../constants";

/**
 * Builds filter conditions valid across the given entity types, reusing
 * `common/`'s `parseFilterParams` with the union of each entity type's
 * own allowed filter fields. A field valid for any of the searched
 * entities is accepted; anything else is silently dropped — the same
 * permissive behavior every other module's list endpoint already relies
 * on, so an unrecognized filter key never 400s an otherwise valid search.
 */
export function buildSearchFilters(
  rawQuery: Record<string, unknown>,
  entityTypes: SearchEntityType[],
): FilterParams {
  const allowedFields = Array.from(
    new Set(entityTypes.flatMap((entityType) => SEARCH_FILTERABLE_FIELDS_BY_ENTITY[entityType])),
  );

  return parseFilterParams(rawQuery, allowedFields);
}
