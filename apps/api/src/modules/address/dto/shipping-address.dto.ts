import type { AddressResponseDto } from "./address-response.dto";

/** The shipping counterpart to `BillingAddressDto` — see that file's comment. `type` can only be `"shipping"` or `"both"`. */
export interface ShippingAddressDto extends AddressResponseDto {
  type: "shipping" | "both";
}
