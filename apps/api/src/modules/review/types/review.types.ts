import type { ModerationStatus, RatingValue } from "../constants";
import type { ReviewMediaItem, VerifiedPurchaseReference } from "../interfaces";

/**
 * `productId` is a bare FK-shaped string — this module never imports
 * `modules/product`. `verifiedPurchase` is `null` when the reviewer's
 * purchase was never confirmed (see
 * `interfaces/verified-purchase.interface.ts`).
 */
export interface Review {
  id: string;
  productId: string;
  userId: string;
  rating: RatingValue;
  title: string | null;
  body: string;
  media: ReviewMediaItem[];
  verifiedPurchase: VerifiedPurchaseReference | null;
  moderationStatus: ModerationStatus;
  helpfulCount: number;
  unhelpfulCount: number;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * `userId` and `verifiedPurchase` are deliberately absent — both are
 * derived server-side (from `actor`, and from cross-referencing
 * `modules/order`, respectively) rather than accepted from a client
 * payload; see `validation/create-review.schema.ts`.
 */
export interface CreateReviewInput {
  productId: string;
  userId: string;
  rating: RatingValue;
  title?: string | null;
  body: string;
  media?: ReviewMediaItem[];
  verifiedPurchase?: VerifiedPurchaseReference | null;
  moderationStatus?: ModerationStatus;
}

/** Deliberately excludes `productId`/`userId`/`verifiedPurchase`/
 * `moderationStatus` — a review's authorship and moderation state are
 * never edited through the same path a reviewer updates their own
 * content through. */
export interface UpdateReviewInput {
  rating?: RatingValue;
  title?: string | null;
  body?: string;
  media?: ReviewMediaItem[];
}
