import { z } from "zod";

import { MEDIA_STATUSES } from "../constants";
import { altTextSchema } from "../schemas";

/**
 * Deliberately excludes everything but `altText`/`status` — see
 * `UpdateMediaAssetInput`'s comment in `types/media.types.ts` for why.
 * `altText` is `.nullable()` (in addition to `.partial()`'s implicit
 * optionality) so a caller can distinguish "clear the alt text"
 * (`null`) from "leave it as-is" (omitted entirely).
 */
export const updateMediaAssetSchema = z
  .object({
    altText: altTextSchema.nullable(),
    status: z.enum([
      MEDIA_STATUSES.PENDING,
      MEDIA_STATUSES.READY,
      MEDIA_STATUSES.FAILED,
      MEDIA_STATUSES.DELETED,
    ]),
  })
  .partial();
