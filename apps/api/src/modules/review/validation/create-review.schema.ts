import { z } from "zod";

import { REVIEW_MAX_MEDIA_ITEMS } from "../constants";
import { bodySchema, ratingSchema, reviewMediaItemSchema, titleSchema } from "../schemas";

/**
 * `productId` is a bare string reference; this module never imports
 * `modules/product`. Never a `userId`/`verifiedPurchase`/
 * `moderationStatus` a client submits directly — those are derived
 * server-side from `actor` and cross-referenced order/moderation state
 * (see `types/review.types.ts`'s `CreateReviewInput`).
 */
export const createReviewSchema = z.object({
  productId: z.string().min(1),
  rating: ratingSchema,
  title: titleSchema.optional(),
  body: bodySchema,
  media: z.array(reviewMediaItemSchema).max(REVIEW_MAX_MEDIA_ITEMS).optional(),
});
