import type { CurrencyCode } from "../constants";

/** A currency-tagged monetary amount, in the currency's minor unit
 * (e.g. paisa/cents) — used wherever an amount needs to travel together
 * with the currency it's denominated in, rather than assuming a single
 * implicit currency. */
export interface Money {
  amount: number;
  currency: CurrencyCode;
}
