import type { CouponValidationErrorCode } from "../constants";
import type { Coupon } from "./coupon.types";

/** What `service/coupon.service.ts`'s `validate` returns — the shape a
 * checkout flow would inspect to decide whether a submitted code can be
 * applied, and if not, why. */
export interface CouponValidationResult {
  valid: boolean;
  coupon: Coupon | null;
  errorCode: CouponValidationErrorCode | null;
  errorMessage: string | null;
}
