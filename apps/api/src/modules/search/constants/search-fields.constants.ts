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

/**
 * `brandId` was added once `Product.brandId` (a bare FK-shaped field,
 * same convention as `categoryId`) existed to query against — see
 * `prisma/schema.prisma`'s `Product` model. `status`/`visibility` are
 * still accepted here so a privileged caller (one who passes
 * `SearchService`'s per-entity visibility scope) can narrow further,
 * e.g. to only draft products — an unprivileged/anonymous caller's
 * values for these two fields are always overridden by `SearchService`
 * regardless of what it requests, so exposing them here is never a
 * visibility leak.
 */
export const SEARCH_FILTERABLE_FIELDS_BY_ENTITY: Record<SearchEntityType, readonly string[]> = {
  [SEARCH_ENTITY_TYPES.PRODUCT]: ["categoryId", "brandId", "status", "visibility"],
  [SEARCH_ENTITY_TYPES.CATEGORY]: ["parentId", "status", "visibility"],
  [SEARCH_ENTITY_TYPES.BRAND]: ["status", "visibility"],
};
