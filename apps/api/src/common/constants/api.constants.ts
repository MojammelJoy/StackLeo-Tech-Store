/**
 * Defaults and bounds for list endpoints. Centralized so every
 * paginated/sortable/filterable route agrees on the same behavior
 * instead of each handler picking its own numbers.
 */
export const PAGINATION_DEFAULTS = {
  PAGE: 1,
  LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

export const SORT_DEFAULTS = {
  ORDER: "asc",
} as const;

/**
 * Query string parameter names the query parser recognizes. Centralized
 * so a future rename doesn't require hunting through every handler, and
 * so the filter parser knows which keys are reserved and must never be
 * treated as filter fields.
 */
export const QUERY_PARAM_KEYS = {
  PAGE: "page",
  LIMIT: "limit",
  SORT: "sort",
  SEARCH: "search",
  CURSOR: "cursor",
  /** Selects which pagination style a list endpoint uses for this
   * request — `"page"` (the default) or `"cursor"`. Explicit rather than
   * inferred from the presence of `cursor` alone, since a cursor-mode
   * client's very first request (no `cursor` yet) would otherwise be
   * indistinguishable from a page-mode request. */
  PAGINATION_TYPE: "paginationType",
} as const;
