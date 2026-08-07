import type { CouponValidationErrorCode } from "../constants";
import type { CouponResponseDto } from "./coupon-response.dto";

/** The public-facing shape of a `CouponValidationResult` — `coupon` is
 * the already-mapped response DTO, never the raw domain entity. */
export interface CouponValidationResponseDto {
  valid: boolean;
  coupon: CouponResponseDto | null;
  errorCode: CouponValidationErrorCode | null;
  errorMessage: string | null;
  discountAmount: number | null;
}
