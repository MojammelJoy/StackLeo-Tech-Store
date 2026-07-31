import { z } from "zod";

import { RATING_VALUES } from "../constants";

/** A union of literals (rather than `z.number().min().max()`) so the
 * inferred type is exactly `1 | 2 | 3 | 4 | 5` — matching `RatingValue`
 * — instead of widening to `number`. */
export const ratingSchema = z.union([
  z.literal(RATING_VALUES.ONE),
  z.literal(RATING_VALUES.TWO),
  z.literal(RATING_VALUES.THREE),
  z.literal(RATING_VALUES.FOUR),
  z.literal(RATING_VALUES.FIVE),
]);
