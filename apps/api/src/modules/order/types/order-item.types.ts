/**
 * The persisted OrderItem domain entity. `sku`/`productName`/`unitPrice`
 * are a snapshot taken when the order was placed — not a live lookup
 * against `modules/product` (never imported here) — the same reasoning
 * `modules/cart`'s `CartItem` documents for its own snapshot, but more
 * important here: a product can be renamed, repriced, or deleted years
 * after an order ships, and the order must still show what was actually
 * bought. `lineTotal` is deliberately not stored — see
 * `utils/order-calculations.util.ts`'s `calculateLineTotal`.
 */
export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  sku: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * The shape needed to create an order item — embedded inside
 * `CreateOrderInput.items` (see `order.types.ts`), so it deliberately
 * has no `id`/`orderId` yet: the order doesn't exist until creation
 * completes, and the repository assigns both.
 */
export interface CreateOrderItemInput {
  productId: string;
  sku: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}
