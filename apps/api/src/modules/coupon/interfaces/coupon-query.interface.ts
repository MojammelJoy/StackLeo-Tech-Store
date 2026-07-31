import type { CouponStatus, DiscountType } from "../constants";

/** Coupon-specific filter criteria, layered on top of `common/`'s
 * generic `ParsedQuery` (pagination/sort/search). Shared between
 * `repository/` (the contract) and `service/` (the skeleton). */
export interface CouponFilterOptions {
  status?: CouponStatus;
  discountType?: DiscountType;
  stackable?: boolean;
}
