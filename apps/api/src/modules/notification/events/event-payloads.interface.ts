/**
 * Example `NotificationEvent` payload shapes for events other modules
 * would eventually emit — bare FK-shaped strings throughout, never
 * relations, since this module never imports `modules/order`,
 * `modules/user`, or `modules/inventory`. Illustrative, not exhaustive:
 * a real event-driven implementation would add payload interfaces here
 * as new triggers are wired up, without changing
 * `NotificationEvent`/`NotificationEventHandler` themselves.
 */
export interface OrderConfirmedEventPayload {
  orderId: string;
  userId: string | null;
  guestEmail: string | null;
}

export interface PasswordResetRequestedEventPayload {
  userId: string;
  resetToken: string;
}

export interface LowStockEventPayload {
  productId: string;
  sku: string;
  availableQuantity: number;
}
