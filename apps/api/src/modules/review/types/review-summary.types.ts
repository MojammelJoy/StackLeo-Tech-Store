import type { RatingValue } from "../constants";

/** A count of reviews per star rating — an exhaustive `Record` (not a
 * partial map), so every rating value is always present, even at `0`. */
export type RatingBreakdown = Record<RatingValue, number>;

export interface ReviewSummary {
  productId: string;
  averageRating: number;
  totalReviews: number;
  ratingBreakdown: RatingBreakdown;
}
