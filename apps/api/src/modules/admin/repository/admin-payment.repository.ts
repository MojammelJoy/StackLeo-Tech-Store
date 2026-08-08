/** A count of payments per lifecycle status — the one read
 * `modules/payment`'s own `PaymentRepository` doesn't expose.
 * `findAll`/`findByOrderId` are already unscoped there and reused
 * directly by `service/admin-payment.service.ts`; only this aggregate
 * summary is genuinely new. */
export interface PaymentStatusSummary {
  pendingCount: number;
  processingCount: number;
  succeededCount: number;
  failedCount: number;
  cancelledCount: number;
  partiallyRefundedCount: number;
  refundedCount: number;
}

/**
 * Read-only operational aggregate over `modules/payment`'s own
 * `payments` table. The service depends on this interface, never on a
 * concrete implementation directly, so swapping
 * `AdminPaymentPrismaRepository` for a test double never touches
 * service code.
 */
export interface AdminPaymentRepository {
  getStatusSummary(): Promise<PaymentStatusSummary>;
}
