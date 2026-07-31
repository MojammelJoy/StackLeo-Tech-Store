import { z } from "zod";

import { COUPON_STATUSES } from "../constants";
import { amountSchema, descriptionSchema } from "../schemas";

/**
 * Mirrors `UpdateCouponInput`'s narrow field set (see
 * `types/coupon.types.ts`) — `code`/`discountType`/`discountValue`/
 * `currency` are deliberately absent.
 */
export const updateCouponSchema = z
  .object({
    description: descriptionSchema.nullable(),
    status: z.enum([
      COUPON_STATUSES.DRAFT,
      COUPON_STATUSES.ACTIVE,
      COUPON_STATUSES.PAUSED,
      COUPON_STATUSES.EXPIRED,
      COUPON_STATUSES.EXHAUSTED,
      COUPON_STATUSES.ARCHIVED,
    ]),
    startsAt: z.coerce.date().nullable(),
    expiresAt: z.coerce.date().nullable(),
    usageLimit: z.number().int().positive().nullable(),
    usageLimitPerUser: z.number().int().positive().nullable(),
    minOrderAmount: amountSchema.nullable(),
    maxDiscountAmount: amountSchema.nullable(),
    stackable: z.boolean(),
    eligibleUserIds: z.array(z.string().min(1)).nullable(),
    eligibleProductIds: z.array(z.string().min(1)).nullable(),
    eligibleCategoryIds: z.array(z.string().min(1)).nullable(),
    eligibleBrandIds: z.array(z.string().min(1)).nullable(),
  })
  .partial();
