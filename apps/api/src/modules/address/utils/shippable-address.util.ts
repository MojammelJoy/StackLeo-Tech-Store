import type { ShippableAddress } from "../interfaces";
import type { Address } from "../types";

/** Narrows an `Address` down to the fields a future shipping-rate/carrier integration would need — see `interfaces/shippable-address.interface.ts`. */
export function toShippableAddress(address: Address): ShippableAddress {
  return {
    line1: address.line1,
    line2: address.line2,
    city: address.city,
    district: address.district,
    division: address.division,
    postalCode: address.postalCode,
    country: address.country,
    latitude: address.latitude,
    longitude: address.longitude,
  };
}
