import { SEARCH_ENTITY_TYPES } from "./search.constants";

import type { SearchEntityType } from "./search.constants";

/**
 * Per-entity sortable/filterable field allow-lists, passed to
 * `common/`'s `parseSortParams`/`parseFilterParams` by this module's own
 * `utils/sort-builder.util.ts`/`filter-builder.util.ts`. Deliberately
 * self-contained rather than importing `PRODUCT_SORTABLE_FIELDS` etc.
 * from `modules/product`/`modules/category`/`modules/brand` — this
 * foundation stays decoupled from those modules' own field vocabularies,
 * consistent with every module in this monorepo never importing a
 * sibling domain module.
 */
export const SEARCH_SORTABLE_FIELDS_BY_ENTITY: Record<SearchEntityType, readonly string[]> = {
  [SEARCH_ENTITY_TYPES.PRODUCT]: ["name", "price", "createdAt", "updatedAt"],
  [SEARCH_ENTITY_TYPES.CATEGORY]: ["name", "createdAt", "updatedAt"],
  [SEARCH_ENTITY_TYPES.BRAND]: ["name", "createdAt", "updatedAt"],
};

export const SEARCH_FILTERABLE_FIELDS_BY_ENTITY: Record<SearchEntityType, readonly string[]> = {
  [SEARCH_ENTITY_TYPES.PRODUCT]: ["categoryId", "status"],
  [SEARCH_ENTITY_TYPES.CATEGORY]: ["parentId", "status"],
  [SEARCH_ENTITY_TYPES.BRAND]: ["status"],
};
