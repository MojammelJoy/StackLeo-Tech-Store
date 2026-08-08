/**
 * Revenue figures, each drawn from a distinct, clearly-scoped source —
 * "clearly distinguish order total, paid amount, completed sales,
 * cancelled orders" — never blended into one invented "revenue" number:
 *
 * - `orderTotal`: `SUM(Order.total)` for every order in range, regardless
 *   of status — the gross value of what was ordered.
 * - `paidAmount`: `SUM(Payment.amount)` for `Payment.status = "succeeded"`
 *   in range — what actually settled through a payment record, which
 *   can legitimately differ from `orderTotal` (unpaid/pending/failed
 *   orders, or an order paid outside the range it was placed in).
 * - `completedSales`: `SUM(Order.total)` for `Order.status = "completed"`
 *   in range.
 * - `cancelledAmount`/`cancelledOrderCount`: the same, for
 *   `Order.status = "cancelled"`.
 *
 * No tax/refund/settlement accounting is computed — those require a
 * ledger this schema doesn't have (see `Order.discountTotal` for the
 * one already-recorded adjustment, included here as `discountTotal`).
 */
export interface RevenueSummary {
  orderTotal: number;
  paidAmount: number;
  completedSales: number;
  cancelledAmount: number;
  cancelledOrderCount: number;
  discountTotal: number;
}
