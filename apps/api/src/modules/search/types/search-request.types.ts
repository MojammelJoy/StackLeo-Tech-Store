import type { FilterParams, PaginationParams, SortParam } from "../../../common";
import type { SearchEntityType } from "../constants";

/** Forces a single entity type's results down to the given
 * `status`/`visibility` pair — how `SearchService` enforces that an
 * unprivileged/anonymous caller only ever sees public, active rows,
 * regardless of what `filters.status`/`filters.visibility` the request
 * asked for. See `SearchQuery.visibilityScope`'s doc comment. */
export interface EntityVisibilityScope {
  status: string;
  visibility: string;
}

/**
 * A fully normalized search request — the output of
 * `utils/query-parser.util.ts`'s `buildSearchQuery`, and what
 * `repository/`/`providers/` actually operate on. Pagination/sort/
 * filters reuse `common/`'s own types directly rather than search
 * reinventing near-identical shapes.
 */
export interface SearchQuery {
  keyword: string;
  entityTypes: SearchEntityType[];
  pagination: PaginationParams;
  sort: SortParam[];
  filters: FilterParams;
  /**
   * Product-only price range, in the same minor-currency-unit as
   * `Product.price`. Kept outside `filters` for the same reason
   * `modules/product`'s `ProductFilterOptions.priceMin`/`priceMax`
   * are: a range needs two bounds, and `FilterParams` can only carry
   * one operator per field name. Ignored for category/brand results.
   */
  priceMin?: number;
  priceMax?: number;
  /**
   * Product-only stock filter: `true` matches products with any
   * available quantity (`quantity - reservedQuantity > 0`, summed
   * across every warehouse) per `modules/inventory`'s `InventoryItem`;
   * `false` matches products with none, including products with no
   * `InventoryItem` row at all. `undefined` applies no stock filter.
   * Ignored for category/brand results.
   */
  inStock?: boolean;
  /**
   * Per-entity-type visibility enforcement — set only by
   * `SearchService`, never by `utils/query-parser.util.ts` or a
   * controller, so a caller can never smuggle a bypass in through raw
   * query params. An entity type mapped to an `EntityVisibilityScope`
   * has its `status`/`visibility` forced to that scope, overriding
   * whatever `filters.status`/`filters.visibility` the request asked
   * for; mapped to `null` means the actor holds that entity type's own
   * `*_READ` permission and may see every status/visibility. An entity
   * type missing from this map entirely is treated the same as an
   * explicit scope-forcing entry (fail-closed) — `repository/` never
   * assumes unscoped access.
   */
  visibilityScope?: Partial<Record<SearchEntityType, EntityVisibilityScope | null>>;
}

export interface AutocompleteQuery {
  keyword: string;
  entityTypes: SearchEntityType[];
  limit: number;
  /** Same fail-closed per-entity visibility enforcement as
   * `SearchQuery.visibilityScope` — autocomplete suggestions must never
   * leak the existence of a non-public/inactive row either. */
  visibilityScope?: Partial<Record<SearchEntityType, EntityVisibilityScope | null>>;
}
