import { z } from "zod";

import { config } from "../../../config";
import { COUPON_PERCENTAGE_MAX, COUPON_PERCENTAGE_MIN, DISCOUNT_TYPES } from "../constants";
import {
  amountSchema,
  couponCodeSchema,
  currencyCodeSchema,
  descriptionSchema,
  discountValueSchema,
} from "../schemas";

/**
 * `eligible*Ids` accept bare id strings — this module never imports
 * `modules/user`/`modules/product`/`modules/category`/`modules/brand`
 * (see `types/coupon.types.ts`). Five cross-field rules:
 *
 * - `discountValue` must be `0` for `FREE_SHIPPING`, and greater than
 *   `0` for `FIXED_AMOUNT`/`PERCENTAGE`.
 * - A `PERCENTAGE` coupon's `discountValue` must fall within
 *   `COUPON_PERCENTAGE_MIN`..`COUPON_PERCENTAGE_MAX`.
 * - `maxDiscountAmount` only makes sense alongside `PERCENTAGE` (it caps
 *   an otherwise-unbounded percentage payout); rejected for the other
 *   two types.
 * - `expiresAt`, when both dates are present, must be after `startsAt`.
 * - `expiresAt` is required in production — the same prod-vs-dev split
 *   `modules/brand`'s URL schema and `modules/media`'s asset schema
 *   already use elsewhere in this app. Perpetual, never-expiring coupons
 *   are fine for local testing but are a real liability in a live store.
 */
export const createCouponSchema = z
  .object({
    code: couponCodeSchema,
    description: descriptionSchema.optional(),
    discountType: z.enum([
      DISCOUNT_TYPES.FIXED_AMOUNT,
      DISCOUNT_TYPES.PERCENTAGE,
      DISCOUNT_TYPES.FREE_SHIPPING,
    ]),
    discountValue: discountValueSchema,
    currency: currencyCodeSchema,
    maxDiscountAmount: amountSchema.optional(),
    minOrderAmount: amountSchema.optional(),
    startsAt: z.coerce.date().optional(),
    expiresAt: z.coerce.date().optional(),
    usageLimit: z.number().int().positive().optional(),
    usageLimitPerUser: z.number().int().positive().optional(),
    stackable: z.boolean().optional(),
    eligibleUserIds: z.array(z.string().min(1)).optional(),
    eligibleProductIds: z.array(z.string().min(1)).optional(),
    eligibleCategoryIds: z.array(z.string().min(1)).optional(),
    eligibleBrandIds: z.array(z.string().min(1)).optional(),
  })
  .refine((data) => data.discountType === DISCOUNT_TYPES.FREE_SHIPPING || data.discountValue > 0, {
    message: "discountValue must be greater than 0 for this discount type",
    path: ["discountValue"],
  })
  .refine(
    (data) => data.discountType !== DISCOUNT_TYPES.FREE_SHIPPING || data.discountValue === 0,
    {
      message: "discountValue must be 0 for free shipping coupons",
      path: ["discountValue"],
    },
  )
  .refine(
    (data) =>
      data.discountType !== DISCOUNT_TYPES.PERCENTAGE ||
      (data.discountValue >= COUPON_PERCENTAGE_MIN && data.discountValue <= COUPON_PERCENTAGE_MAX),
    {
      message: `Percentage discount value must be between ${COUPON_PERCENTAGE_MIN} and ${COUPON_PERCENTAGE_MAX}`,
      path: ["discountValue"],
    },
  )
  .refine(
    (data) =>
      data.discountType === DISCOUNT_TYPES.PERCENTAGE || data.maxDiscountAmount === undefined,
    {
      message: "maxDiscountAmount is only applicable to percentage discounts",
      path: ["maxDiscountAmount"],
    },
  )
  .refine((data) => !data.startsAt || !data.expiresAt || data.expiresAt > data.startsAt, {
    message: "expiresAt must be after startsAt",
    path: ["expiresAt"],
  })
  .refine((data) => !config.isProduction || data.expiresAt !== undefined, {
    message: "expiresAt is required in production; perpetual coupons are not permitted",
    path: ["expiresAt"],
  });
