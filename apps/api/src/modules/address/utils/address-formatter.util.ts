import type { Address } from "../types";

/** A single, human-readable line, e.g. `"123 Main St, Apt 4, Dhaka, Dhaka Division, 1207, BD"`. Skips `line2`/`district` when absent rather than leaving an empty segment. */
export function formatAddressLine(address: Address): string {
  return [
    address.line1,
    address.line2,
    address.district,
    address.city,
    address.division,
    address.postalCode,
    address.country,
  ]
    .filter((part): part is string => Boolean(part))
    .join(", ");
}
