/** A star rating — modeled as a numeric enum (rather than a plain
 * `1..5` range) so the exact set of allowed values is a single source
 * of truth for `schemas/rating.schema.ts` and `types/review-summary.types.ts`'s
 * `RatingBreakdown`. */
export const RATING_VALUES = {
  ONE: 1,
  TWO: 2,
  THREE: 3,
  FOUR: 4,
  FIVE: 5,
} as const;

export type RatingValue = (typeof RATING_VALUES)[keyof typeof RATING_VALUES];

export const RATING_MIN = RATING_VALUES.ONE;
export const RATING_MAX = RATING_VALUES.FIVE;
