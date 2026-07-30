import { z } from "zod";

import { entityTypeSchema, keywordSchema } from "../schemas";

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
 */
export const searchQuerySchema = z.object({
  keyword: keywordSchema,
  entityTypes: z.array(entityTypeSchema).optional(),
});
