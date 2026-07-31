import { RATING_VALUES } from "../constants";

import type { RatingBreakdown, Review } from "../types";

/** Pure arithmetic over an already-loaded review list — no database
 * access. Returns `0` for an empty list rather than `NaN`. */
export function calculateAverageRating(reviews: Review[]): number {
  if (reviews.length === 0) {
    return 0;
  }
  const total = reviews.reduce((sum, review) => sum + review.rating, 0);
  return total / reviews.length;
}

/** An exhaustive breakdown — every star value is present, even at `0`,
 * so a caller never has to guard against a missing key. */
export function buildRatingBreakdown(reviews: Review[]): RatingBreakdown {
  const breakdown: RatingBreakdown = {
    [RATING_VALUES.ONE]: 0,
    [RATING_VALUES.TWO]: 0,
    [RATING_VALUES.THREE]: 0,
    [RATING_VALUES.FOUR]: 0,
    [RATING_VALUES.FIVE]: 0,
  };
  for (const review of reviews) {
    breakdown[review.rating] += 1;
  }
  return breakdown;
}
