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
} as const;
