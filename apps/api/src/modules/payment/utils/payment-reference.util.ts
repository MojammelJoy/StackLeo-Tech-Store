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

/** The inverse of `formatPaymentReference` — recovers the raw
 * `sequenceNumber` `PaymentRepository.findByTransactionId` looks a row
 * up by, mirroring `modules/order`'s `parseOrderNumber`. Returns `null`
 * (never throws) for anything that doesn't match this environment's own
 * prefix/padding exactly — including a syntactically plausible
 * reference from the *other* environment (e.g. a `"TEST-PAY-..."`
 * reference looked up against production), which must miss rather than
 * accidentally parse. */
export function parsePaymentReference(transactionId: string): number | null {
  const prefix = getPaymentReferencePrefix();
  if (!transactionId.startsWith(`${prefix}-`)) {
    return null;
  }

  const sequencePart = transactionId.slice(prefix.length + 1);
  if (
    sequencePart.length !== PAYMENT_REFERENCE_SEQUENCE_PAD_LENGTH ||
    !/^\d+$/.test(sequencePart)
  ) {
    return null;
  }

  const sequence = Number.parseInt(sequencePart, 10);
  return Number.isSafeInteger(sequence) && sequence > 0 ? sequence : null;
}
