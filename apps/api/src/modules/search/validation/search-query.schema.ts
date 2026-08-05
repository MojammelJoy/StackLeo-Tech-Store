import { z } from "zod";

import { entityTypeSchema, keywordSchema } from "../schemas";

/**
 * Express (via `qs`) parses a single repeated query key as a plain
 * string (`?entityTypes=product`) but as an array once it appears more
 * than once (`?entityTypes=product&entityTypes=brand`) — this accepts
 * both shapes and always normalizes to an array, so
 * `utils/query-parser.util.ts`'s `buildSearchQuery` never has to.
 */
const entityTypesQuerySchema = z
  .union([entityTypeSchema, z.array(entityTypeSchema)])
  .optional()
  .transform((value) => (value === undefined ? undefined : Array.isArray(value) ? value : [value]));

/**
 * Validates only the search-specific core of a request — the keyword
 * (which drives what gets matched, so it's worth rejecting outright when
 * missing/empty/too long) and which entities to search across.
 * Pagination/sort/generic filters are deliberately NOT validated here:
 * `common/`'s `parsePaginationParams`/`parseSortParams`/`parseFilterParams`
 * already handle those permissively (falling back to sane defaults
 * instead of throwing on a malformed `sort=`), and this module's own
 * `utils/` builders apply that same permissive treatment — a bad sort
 * field shouldn't 400 an otherwise valid search.
 *
 * `.passthrough()` is required, not cosmetic: `common/`'s
 * `validateRequest` replaces `req.query` with this schema's *parsed*
 * result, and a plain `z.object` strips every key it doesn't know
 * about — without `.passthrough()`, validating `keyword`/`entityTypes`
 * here would silently erase `page`/`limit`/`sort`/`priceMin`/
 * `priceMax`/`inStock`/every generic filter key before
 * `buildSearchQuery` ever sees them.
 */
export const searchQuerySchema = z
  .object({
    keyword: keywordSchema,
    entityTypes: entityTypesQuerySchema,
  })
  .passthrough();
