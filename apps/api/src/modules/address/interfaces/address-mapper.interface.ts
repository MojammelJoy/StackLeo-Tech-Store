import type { AddressResponseDto, BillingAddressDto, ShippingAddressDto } from "../dto";
import type { Address } from "../types";

/**
 * Contract `mapper/address.mapper.ts` implements. Kept separate from
 * `mapper/` itself (mirroring `repository/`'s interface-vs-implementation
 * split) so a future alternate mapper — or a test double — can satisfy
 * the same shape without depending on the concrete implementation.
 */
export interface AddressMapper {
  toResponseDto(address: Address): AddressResponseDto;
  toResponseList(addresses: Address[]): AddressResponseDto[];
  /** `null` when `address.type` is `"shipping"` only — a billing-typed DTO can't be built from a shipping-only address. */
  toBillingAddressDto(address: Address): BillingAddressDto | null;
  /** `null` when `address.type` is `"billing"` only. */
  toShippingAddressDto(address: Address): ShippingAddressDto | null;
}
