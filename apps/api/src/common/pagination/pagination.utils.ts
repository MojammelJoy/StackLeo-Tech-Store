import { PAGINATION_DEFAULTS, QUERY_PARAM_KEYS } from "../constants";

import type {
  CursorPaginatedResult,
  CursorPaginationParams,
  PaginationMeta,
  PaginationParams,
} from "../types";

/**
 * Parses `page`/`limit` from raw query values, silently falling back to
 * defaults for anything missing or non-numeric rather than rejecting the
 * request — pagination is a UX nicety, not something worth a 400 over.
 * `limit` is always clamped to `MAX_LIMIT` so a client can never force an
 * unbounded query.
 */
export function parsePaginationParams(query: Record<string, unknown>): PaginationParams {
  const page = toPositiveInteger(query[QUERY_PARAM_KEYS.PAGE]) ?? PAGINATION_DEFAULTS.PAGE;
  const limit = Math.min(
    toPositiveInteger(query[QUERY_PARAM_KEYS.LIMIT]) ?? PAGINATION_DEFAULTS.LIMIT,
    PAGINATION_DEFAULTS.MAX_LIMIT,
  );

  return { page, limit };
}

/**
 * Converts a page/limit pair into the `skip`/`take` values a database
 * query expects (e.g. Prisma's `findMany`), without this module — or
 * anything else in `common/` — depending on Prisma itself.
 */
export function getPaginationOffset({ page, limit }: PaginationParams): {
  skip: number;
  take: number;
} {
  return { skip: (page - 1) * limit, take: limit };
}

export function buildPaginationMeta(
  { page, limit }: PaginationParams,
  totalItems: number,
): PaginationMeta {
  const totalPages = totalItems === 0 ? 0 : Math.ceil(totalItems / limit);

  return {
    page,
    limit,
    totalItems,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
}

/**
 * Parses `cursor`/`limit` from raw query values. Unlike
 * `parsePaginationParams`, an invalid/missing `cursor` is simply
 * treated as "start from the beginning" rather than falling back to a
 * default — there is no meaningful default cursor.
 */
export function parseCursorPaginationParams(
  query: Record<string, unknown>,
): CursorPaginationParams {
  const rawCursor = query[QUERY_PARAM_KEYS.CURSOR];
  const cursor = typeof rawCursor === "string" && rawCursor.length > 0 ? rawCursor : undefined;
  const limit = Math.min(
    toPositiveInteger(query[QUERY_PARAM_KEYS.LIMIT]) ?? PAGINATION_DEFAULTS.LIMIT,
    PAGINATION_DEFAULTS.MAX_LIMIT,
  );

  return { cursor, limit };
}

/**
 * Turns a repository's raw result (fetched with `take: limit + 1`, the
 * standard "fetch one extra row" cursor-pagination trick) into the page
 * actually returned to the caller plus its metadata. The extra row is
 * never included in `items` — it exists only to answer `hasNextPage`
 * without a separate count query.
 */
export function buildCursorPaginationMeta<T extends { id: string }>(
  rows: T[],
  limit: number,
): CursorPaginatedResult<T> {
  const hasNextPage = rows.length > limit;
  const items = hasNextPage ? rows.slice(0, limit) : rows;
  const lastItem = items[items.length - 1];

  return {
    items,
    meta: {
      limit,
      hasNextPage,
      nextCursor: hasNextPage && lastItem ? lastItem.id : null,
    },
  };
}

function toPositiveInteger(value: unknown): number | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  const parsed = Number(raw);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined;
}
