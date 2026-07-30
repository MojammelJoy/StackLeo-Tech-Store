import { config } from "../../../config";
import { ORDER_NUMBER_SEQUENCE_PAD_LENGTH } from "../constants";

/**
 * Prefix for customer-facing order numbers. Distinct in non-production
 * environments so a test order can never be mistaken for a real one at
 * a glance — the same reason payment providers like Stripe visibly
 * distinguish test-mode data. Mirrors the same prod-vs-dev split every
 * other module with a `config/` integration already uses elsewhere in
 * this app.
 */
export function getOrderNumberPrefix(): string {
  return config.isProduction ? "ORD" : "TEST-ORD";
}

/** Formats a sequence number into a full order number, e.g. `formatOrderNumber(123)` -> `"ORD-000123"`. The sequence itself is out of scope — assigning and persisting one is an actual database operation. */
export function formatOrderNumber(sequence: number): string {
  const padded = String(sequence).padStart(ORDER_NUMBER_SEQUENCE_PAD_LENGTH, "0");
  return `${getOrderNumberPrefix()}-${padded}`;
}
