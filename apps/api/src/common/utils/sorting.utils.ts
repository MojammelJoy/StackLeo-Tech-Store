import { SORT_DEFAULTS } from "../constants";

import type { SortParam } from "../types";

const SORT_SEPARATOR = ",";
const FIELD_ORDER_SEPARATOR = ":";

/**
 * Parses a `sort` query value into structured sort instructions. Accepts
 * both `field:asc,other:desc` and the JSON:API-style `-field`/`+field`
 * shorthand for descending/ascending order, comma-separated for
 * multi-field sorts.
 *
 * Unknown fields are dropped silently when `allowedFields` is given,
 * rather than throwing — an invalid sort key should never break an
 * otherwise-valid list request.
 */
export function parseSortParams(
  sortQuery: string | string[] | undefined,
  allowedFields?: readonly string[],
): SortParam[] {
  if (!sortQuery) return [];

  const raw = Array.isArray(sortQuery) ? sortQuery.join(SORT_SEPARATOR) : sortQuery;

  return raw
    .split(SORT_SEPARATOR)
    .map((token) => token.trim())
    .filter((token) => token.length > 0)
    .map(parseSortToken)
    .filter(
      (sortParam) =>
        sortParam.field.length > 0 && (!allowedFields || allowedFields.includes(sortParam.field)),
    );
}

function parseSortToken(token: string): SortParam {
  if (token.startsWith("-")) {
    return { field: token.slice(1), order: "desc" };
  }

  if (token.startsWith("+")) {
    return { field: token.slice(1), order: SORT_DEFAULTS.ORDER };
  }

  const [field, order] = token.split(FIELD_ORDER_SEPARATOR);

  // `token` is always non-empty (filtered above), so `split` always
  // yields a defined first element; the fallback only satisfies
  // `noUncheckedIndexedAccess` and is never actually reached.
  return {
    field: field ?? "",
    order: order?.trim().toLowerCase() === "desc" ? "desc" : SORT_DEFAULTS.ORDER,
  };
}
