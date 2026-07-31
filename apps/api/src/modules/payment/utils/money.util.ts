import type { Money } from "../types";

const MINOR_UNITS_PER_MAJOR_UNIT = 100;

/** Renders a minor-unit amount as a human-readable major-unit string,
 * e.g. `{ amount: 15050, currency: "BDT" }` -> `"BDT 150.50"`. */
export function formatMoney({ amount, currency }: Money): string {
  const majorUnits = (amount / MINOR_UNITS_PER_MAJOR_UNIT).toFixed(2);
  return `${currency} ${majorUnits}`;
}
