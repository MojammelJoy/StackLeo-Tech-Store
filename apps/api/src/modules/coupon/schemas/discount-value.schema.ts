import { z } from "zod";

/** Non-negative so `FREE_SHIPPING` (always `0`) is representable;
 * `validation/create-coupon.schema.ts` enforces the positive-value rule
 * for `FIXED_AMOUNT`/`PERCENTAGE` and the percentage bounds. */
export const discountValueSchema = z.number().int().nonnegative();
