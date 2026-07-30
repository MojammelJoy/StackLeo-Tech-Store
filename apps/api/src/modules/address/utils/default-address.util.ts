import type { AddressType } from "../constants";
import type { Address } from "../types";

/** The current default address, optionally scoped to a specific `AddressType` (an address `type: "both"` counts toward either scope). */
export function findDefaultAddress(addresses: Address[], type?: AddressType): Address | undefined {
  return addresses.find(
    (address) => address.isDefault && (!type || address.type === type || address.type === "both"),
  );
}
