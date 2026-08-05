import { z } from "zod";

import {
  AUTOCOMPLETE_KEYWORD_MIN_LENGTH,
  AUTOCOMPLETE_MAX_SUGGESTIONS,
  SEARCH_KEYWORD_MAX_LENGTH,
} from "../constants";
import { entityTypeSchema } from "../schemas";

/** See `search-query.schema.ts`'s identical `entityTypesQuerySchema` for
 * why both the single-value and array shapes must be accepted. */
const entityTypesQuerySchema = z
  .union([entityTypeSchema, z.array(entityTypeSchema)])
  .optional()
  .transform((value) => (value === undefined ? undefined : Array.isArray(value) ? value : [value]));

/**
 * Autocomplete's keyword floor is higher than a full search's
 * (`AUTOCOMPLETE_KEYWORD_MIN_LENGTH` vs `keywordSchema`'s
 * `SEARCH_KEYWORD_MIN_LENGTH`) — a one-character prefix has too little
 * signal to suggest anything useful, so it's rejected here rather than
 * silently returning a low-quality (or empty) suggestion list.
 *
 * `.passthrough()` for the same reason as `search-query.schema.ts`'s
 * `searchQuerySchema` — `validateRequest` replaces `req.query` with
 * this schema's parsed result, so anything not listed here would
 * otherwise be silently stripped before reaching the controller.
 */
export const autocompleteQuerySchema = z
  .object({
    keyword: z.string().trim().min(AUTOCOMPLETE_KEYWORD_MIN_LENGTH).max(SEARCH_KEYWORD_MAX_LENGTH),
    entityTypes: entityTypesQuerySchema,
    limit: z.coerce.number().int().positive().max(AUTOCOMPLETE_MAX_SUGGESTIONS).optional(),
  })
  .passthrough();
