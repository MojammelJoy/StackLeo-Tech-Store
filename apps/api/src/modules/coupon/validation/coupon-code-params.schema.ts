import { z } from "zod";

/** Deliberately looser than `schemas/code.schema.ts`'s `couponCodeSchema`
 * (which enforces the canonical uppercase format): a path segment may
 * arrive lowercase from a URL a user typed by hand, and
 * `utils/coupon-code.util.ts`'s `normalizeCouponCode` is what actually
 * canonicalizes it before lookup — mirrors `modules/payment`'s
 * `transactionIdParamsSchema`. */
export const couponCodeParamsSchema = z.object({
  code: z.string().min(1),
});
