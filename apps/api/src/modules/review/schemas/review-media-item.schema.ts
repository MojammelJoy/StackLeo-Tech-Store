import { z } from "zod";

import { REVIEW_MEDIA_TYPES } from "../constants";

export const reviewMediaItemSchema = z.object({
  mediaId: z.string().min(1),
  type: z.enum([REVIEW_MEDIA_TYPES.IMAGE, REVIEW_MEDIA_TYPES.VIDEO]),
});
