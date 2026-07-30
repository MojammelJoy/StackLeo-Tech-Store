import { z } from "zod";

import {
  AUTOCOMPLETE_KEYWORD_MIN_LENGTH,
  AUTOCOMPLETE_MAX_SUGGESTIONS,
  SEARCH_KEYWORD_MAX_LENGTH,
} from "../constants";
import { entityTypeSchema } from "../schemas";

/**
 * Autocomplete's keyword floor is higher than a full search's
 * (`AUTOCOMPLETE_KEYWORD_MIN_LENGTH` vs `keywordSchema`'s
 * `SEARCH_KEYWORD_MIN_LENGTH`) — a one-character prefix has too little
 * signal to suggest anything useful, so it's rejected here rather than
 * silently returning a low-quality (or empty) suggestion list.
 */
export const autocompleteQuerySchema = z.object({
  keyword: z.string().trim().min(AUTOCOMPLETE_KEYWORD_MIN_LENGTH).max(SEARCH_KEYWORD_MAX_LENGTH),
  entityTypes: z.array(entityTypeSchema).optional(),
  limit: z.coerce.number().int().positive().max(AUTOCOMPLETE_MAX_SUGGESTIONS).optional(),
});
