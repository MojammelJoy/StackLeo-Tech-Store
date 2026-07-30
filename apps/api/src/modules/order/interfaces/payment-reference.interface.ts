/**
 * What a future payment gateway integration would attach to an order
 * once one exists — the external transaction detail behind
 * `Order.paymentStatus` (see `types/order.types.ts`). No payment
 * provider is ever called or imported here; this is only the shape a
 * future integration would produce.
 */
export interface PaymentReference {
  provider: string;
  transactionId: string;
  amount: number;
}
