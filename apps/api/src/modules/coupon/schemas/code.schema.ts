import { z } from "zod";

import { COUPON_CODE_MAX_LENGTH, COUPON_CODE_MIN_LENGTH } from "../constants";

/** Uppercase letters, digits, hyphens, and underscores only — a flat
 * character class, not a nested-quantifier shape, so it never trips
 * `security/detect-unsafe-regex`. */
export const couponCodeSchema = z
  .string()
  .min(COUPON_CODE_MIN_LENGTH)
  .max(COUPON_CODE_MAX_LENGTH)
  .regex(/^[A-Z0-9_-]+$/, "Coupon code must contain only uppercase letters, digits, - and _");
