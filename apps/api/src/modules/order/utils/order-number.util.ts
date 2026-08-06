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

/** Formats a sequence number into a full order number, e.g.
 * `formatOrderNumber(123)` -> `"ORD-000123"`. The sequence itself comes
 * from `Order.sequenceNumber` — a native Postgres autoincrement column
 * (see `prisma/schema.prisma`'s `Order` doc comment), the actual atomic
 * "assigning and persisting one" database operation this formats the
 * result of. */
export function formatOrderNumber(sequence: number): string {
  const padded = String(sequence).padStart(ORDER_NUMBER_SEQUENCE_PAD_LENGTH, "0");
  return `${getOrderNumberPrefix()}-${padded}`;
}

/** The inverse of `formatOrderNumber` — recovers the raw
 * `sequenceNumber` `OrderRepository.findByOrderNumber` looks a row up
 * by. Returns `null` (never throws) for anything that doesn't match
 * this environment's own prefix/padding exactly — including a
 * syntactically plausible order number from the *other* environment
 * (e.g. a `"TEST-ORD-..."` number looked up against production), which
 * must miss rather than accidentally parse. */
export function parseOrderNumber(orderNumber: string): number | null {
  const prefix = getOrderNumberPrefix();
  if (!orderNumber.startsWith(`${prefix}-`)) {
    return null;
  }

  const sequencePart = orderNumber.slice(prefix.length + 1);
  if (sequencePart.length !== ORDER_NUMBER_SEQUENCE_PAD_LENGTH || !/^\d+$/.test(sequencePart)) {
    return null;
  }

  const sequence = Number.parseInt(sequencePart, 10);
  return Number.isSafeInteger(sequence) && sequence > 0 ? sequence : null;
}
