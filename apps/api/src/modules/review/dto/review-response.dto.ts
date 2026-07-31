import type { ModerationStatus, RatingValue } from "../constants";
import type { ReviewMediaItem } from "../interfaces";

/**
 * The public-facing shape of a Review. Collapses the internal
 * `VerifiedPurchaseReference | null` (see `types/review.types.ts`) down
 * to a plain `verifiedPurchase: boolean`, and adds `helpfulnessRatio` —
 * both computed by `mapper/` (via `utils/`), never stored.
 */
export interface ReviewResponseDto {
  id: string;
  productId: string;
  userId: string;
  rating: RatingValue;
  title: string | null;
  body: string;
  media: ReviewMediaItem[];
  verifiedPurchase: boolean;
  moderationStatus: ModerationStatus;
  helpfulCount: number;
  unhelpfulCount: number;
  helpfulnessRatio: number | null;
  createdAt: Date;
  updatedAt: Date;
}
