import type { DefaultAddressContext } from "../constants";
import type { Address } from "../types";

/** The current default address for `context` — `"shipping"` reads
 * `isDefaultShipping`, `"billing"` reads `isDefaultBilling` (the two
 * are independent; see `Address`'s doc comment in
 * `types/address.types.ts` for why there's no single shared "the
 * default" flag to look up instead). */
export function findDefaultAddress(
  addresses: Address[],
  context: DefaultAddressContext,
): Address | undefined {
  return addresses.find((address) =>
    context === "shipping" ? address.isDefaultShipping : address.isDefaultBilling,
  );
}
