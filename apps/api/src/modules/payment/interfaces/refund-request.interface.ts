import type { Money } from "../types";

/** Shared between `providers/` (each gateway's `refund` method) and
 * `service/` (which orchestrates the call and records the resulting
 * `PaymentTransaction`) so both sides agree on one refund request
 * shape. */
export interface RefundRequest {
  transactionId: string;
  amount: Money;
  reason?: string;
}
