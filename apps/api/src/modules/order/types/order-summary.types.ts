/**
 * An order's price summary. Unlike `modules/cart`'s `CartSummary`
 * (always computed live from the cart's current items), every field
 * here except `itemCount` is read directly off the stored `Order` —
 * see that type's comment in `order.types.ts` for why. `itemCount` is
 * still computed from `OrderItem[]` (see
 * `utils/order-calculations.util.ts`'s `buildOrderSummary`), since it's
 * trivially derivable and never needs its own column.
 */
export interface OrderSummary {
  itemCount: number;
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  shippingTotal: number;
  total: number;
  currency: string;
}
