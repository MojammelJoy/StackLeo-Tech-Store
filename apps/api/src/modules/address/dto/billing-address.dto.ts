import type { AddressResponseDto } from "./address-response.dto";

/**
 * An `AddressResponseDto` narrowed to addresses actually usable for
 * billing — `type` can only be `"billing"` or `"both"`, never
 * `"shipping"`. Built by `mapper/address.mapper.ts`'s
 * `toBillingAddressDto`, which returns `null` rather than this type
 * when the source address doesn't qualify.
 */
export interface BillingAddressDto extends AddressResponseDto {
  type: "billing" | "both";
}
