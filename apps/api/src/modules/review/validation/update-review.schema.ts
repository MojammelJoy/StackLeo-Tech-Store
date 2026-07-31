import { z } from "zod";

import { REVIEW_MAX_MEDIA_ITEMS } from "../constants";
import { bodySchema, ratingSchema, reviewMediaItemSchema, titleSchema } from "../schemas";

/** Mirrors `UpdateReviewInput`'s narrow field set (see
 * `types/review.types.ts`) — `productId`/`userId`/`verifiedPurchase`/
 * `moderationStatus` are deliberately absent. */
export const updateReviewSchema = z
  .object({
    rating: ratingSchema,
    title: titleSchema.nullable(),
    body: bodySchema,
    media: z.array(reviewMediaItemSchema).max(REVIEW_MAX_MEDIA_ITEMS),
  })
  .partial();
