import type { CurrencyCode } from "../constants";
import type { CouponResponseDto } from "./coupon-response.dto";

/** The public-facing shape of a successful `CouponService.apply` —
 * `coupon` reflects the post-increment `usageCount`. */
export interface CouponApplicationResponseDto {
  coupon: CouponResponseDto;
  cartId: string;
  discountAmount: number;
  currency: CurrencyCode;
  appliedAt: Date;
}
