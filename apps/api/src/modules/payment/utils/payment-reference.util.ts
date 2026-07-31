import { config } from "../../../config";
import { PAYMENT_REFERENCE_SEQUENCE_PAD_LENGTH } from "../constants";

/**
 * Prefix for internally-generated payment reference IDs — created
 * *before* a gateway assigns its own transaction ID, so a payment can be
 * tracked from the moment it's initiated. Distinguishing test-mode
 * references (`TEST-PAY-...`) from production ones (`PAY-...`) mirrors
 * `modules/order`'s own `getOrderNumberPrefix()` split, and matters here
 * for the same reason: mixing sandbox and live payment references would
 * make production support and reconciliation ambiguous.
 */
export function getPaymentReferencePrefix(): string {
  return config.isProduction ? "PAY" : "TEST-PAY";
}

export function formatPaymentReference(sequence: number): string {
  const padded = String(sequence).padStart(PAYMENT_REFERENCE_SEQUENCE_PAD_LENGTH, "0");
  return `${getPaymentReferencePrefix()}-${padded}`;
}
