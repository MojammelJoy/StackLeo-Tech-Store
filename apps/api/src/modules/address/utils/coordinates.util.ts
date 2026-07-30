import { config } from "../../../config";

import type { Address } from "../types";

/**
 * Whether a new address must include `latitude`/`longitude` — consumed
 * by `validation/create-address.schema.ts`. Required in production:
 * once a real shipping-rate integration exists (see
 * `interfaces/shippable-address.interface.ts`), it needs coordinates to
 * work with, and this app has no automatic geocoding step yet to fill
 * them in after the fact. Optional outside production, since most
 * local/test setups have no geocoding service wired up to produce them
 * in the first place. Mirrors the same prod-vs-dev split every other
 * module with a `config/` integration already uses elsewhere in this app.
 */
export function areCoordinatesRequired(): boolean {
  return config.isProduction;
}

export function hasCoordinates(address: Pick<Address, "latitude" | "longitude">): boolean {
  return address.latitude !== null && address.longitude !== null;
}
