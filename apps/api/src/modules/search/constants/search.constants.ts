/**
 * The entities a search request can span. Scoped to the three modules
 * this task explicitly asks search to support — deliberately not an
 * import of `modules/product`/`modules/category`/`modules/brand`
 * themselves (this foundation stays decoupled from them, the same way
 * every other module in this monorepo stays decoupled from its
 * siblings), just a label vocabulary describing what a result belongs to.
 */
export const SEARCH_ENTITY_TYPES = {
  PRODUCT: "product",
  CATEGORY: "category",
  BRAND: "brand",
} as const;

export type SearchEntityType = (typeof SEARCH_ENTITY_TYPES)[keyof typeof SEARCH_ENTITY_TYPES];

export const SEARCH_DEFAULT_ENTITY_TYPES = [
  SEARCH_ENTITY_TYPES.PRODUCT,
  SEARCH_ENTITY_TYPES.CATEGORY,
  SEARCH_ENTITY_TYPES.BRAND,
] as const;

/**
 * Search backends this foundation can select between. Both query the
 * existing Postgres database (see `providers/`) — `FULL_TEXT` via
 * Postgres's native `tsvector`/`tsquery`, `DATABASE` via simple
 * pattern matching. A future Meilisearch/Elasticsearch integration
 * would add its own entry here and implement `providers/`'s
 * `SearchProvider` interface, without changing anything else in this
 * foundation; building that integration is explicitly out of scope.
 */
export const SEARCH_PROVIDERS = {
  DATABASE: "database",
  FULL_TEXT: "full_text",
} as const;

export type SearchProviderName = (typeof SEARCH_PROVIDERS)[keyof typeof SEARCH_PROVIDERS];

export const SEARCH_KEYWORD_MIN_LENGTH = 1;
export const SEARCH_KEYWORD_MAX_LENGTH = 200;

/**
 * The literal `status`/`visibility` values that make a Product/Category/
 * Brand row publicly visible — identical strings across all three
 * modules (`PRODUCT_STATUSES.ACTIVE`/`PRODUCT_VISIBILITIES.PUBLIC`,
 * `CATEGORY_STATUSES.ACTIVE`/`CATEGORY_VISIBILITIES.PUBLIC`,
 * `BRAND_STATUSES.ACTIVE`/`BRAND_VISIBILITIES.PUBLIC`). Duplicated here
 * as bare strings rather than importing those modules' constants, the
 * same decoupling this foundation applies everywhere else (see this
 * file's own doc comment on `SEARCH_ENTITY_TYPES`) — `SearchService`
 * uses these to force non-bypassing callers down to only public,
 * active rows.
 */
export const SEARCH_VISIBLE_STATUS = "active";
export const SEARCH_VISIBLE_VISIBILITY = "public";

/** Below this length, autocomplete has too little signal to suggest anything useful. */
export const AUTOCOMPLETE_KEYWORD_MIN_LENGTH = 2;
export const AUTOCOMPLETE_MAX_SUGGESTIONS = 10;
