import { QUERY_PARAM_KEYS } from "../constants";

import type { FilterOperator, FilterParams } from "../types";

const RESERVED_QUERY_KEYS: readonly string[] = Object.values(QUERY_PARAM_KEYS);

const OPERATOR_KEY_PATTERN = /^(?<field>.+)\[(?<operator>eq|ne|gt|gte|lt|lte|in|contains)\]$/;
const FILTER_LIST_SEPARATOR = ",";

/**
 * Parses filter conditions out of raw query params, e.g. `status=active`
 * or `price[gte]=10`. Pagination/sort/search keys are always excluded —
 * they are parsed by their own dedicated utilities, never as filters.
 *
 * Unknown fields are dropped silently when `allowedFields` is given, for
 * the same reason as `parseSortParams`: a bad filter key shouldn't 400 an
 * otherwise well-formed list request.
 */
export function parseFilterParams(
  query: Record<string, unknown>,
  allowedFields?: readonly string[],
): FilterParams {
  const filters: FilterParams = {};

  for (const [key, rawValue] of Object.entries(query)) {
    if (RESERVED_QUERY_KEYS.includes(key) || rawValue === undefined) continue;

    const { field, operator } = parseFilterKey(key);
    if (allowedFields && !allowedFields.includes(field)) continue;

    filters[field] = { operator, value: normalizeFilterValue(operator, rawValue) };
  }

  return filters;
}

function parseFilterKey(key: string): { field: string; operator: FilterOperator } {
  const match = OPERATOR_KEY_PATTERN.exec(key);
  if (!match?.groups) {
    return { field: key, operator: "eq" };
  }

  // Both named groups are mandatory in the pattern, so a successful match
  // guarantees they're defined — `noUncheckedIndexedAccess` just can't
  // see that from the regex shape alone.
  return {
    field: match.groups.field!,
    operator: match.groups.operator! as FilterOperator,
  };
}

function normalizeFilterValue(operator: FilterOperator, value: unknown): unknown {
  if (operator === "in") {
    const raw = Array.isArray(value) ? value.join(FILTER_LIST_SEPARATOR) : String(value);
    return raw.split(FILTER_LIST_SEPARATOR).map((entry) => entry.trim());
  }

  return Array.isArray(value) ? value[0] : value;
}
