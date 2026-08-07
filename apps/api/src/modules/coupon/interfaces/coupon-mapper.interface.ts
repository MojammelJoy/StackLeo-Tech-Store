import type {
  CouponApplicationResponseDto,
  CouponResponseDto,
  CouponValidationResponseDto,
} from "../dto";
import type { Coupon, CouponRedemption, CouponValidationResult } from "../types";

/** Contract `mapper/coupon.mapper.ts` implements. Kept separate from
 * `mapper/` itself (mirroring `repository/`'s interface-vs-implementation
 * split) so a future alternate mapper — or a test double — can satisfy
 * the same shape without depending on the concrete implementation. */
export interface CouponMapper {
  toResponseDto(coupon: Coupon): CouponResponseDto;
  toResponseList(coupons: Coupon[]): CouponResponseDto[];
  toValidationResponseDto(result: CouponValidationResult): CouponValidationResponseDto;
  toApplicationResponseDto(
    coupon: Coupon,
    redemption: CouponRedemption,
  ): CouponApplicationResponseDto;
}
