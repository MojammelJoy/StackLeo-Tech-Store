import type { FulfillmentStatus, OrderStatus, PaymentStatus } from "../constants";
import type { CreateOrderItemInput } from "./order-item.types";

/**
 * The persisted Order domain entity. Not a Prisma-generated type — no
 * `Order` model exists in `prisma/schema.prisma` yet (out of scope for
 * this foundation). `billingAddressId`/`shippingAddressId` are bare
 * foreign-key-shaped references to `modules/address`'s `Address.id` —
 * never an import of that module, the same discipline every module in
 * this monorepo keeps toward its siblings. `couponCode` is a bare
 * string reference for the same reason — no coupon module exists.
 *
 * Unlike `modules/cart`'s `Cart`, an order has no `guestToken`: once
 * placed, an order is a permanent record a guest looks up later by
 * `guestEmail` (for order confirmation/lookup), not an ongoing session.
 *
 * `subtotal`/`discountTotal`/`taxTotal`/`shippingTotal`/`total` are
 * stored fields, not computed on read like `modules/cart`'s
 * `CartSummary` — a cart's contents constantly change, so its summary
 * is always recalculated live; an order is a frozen snapshot of what
 * was actually charged at checkout, so its amounts are historical fact.
 */
export interface Order {
  id: string;
  /** Customer-facing identifier, e.g. `"ORD-000123"` — distinct from `id`. See `utils/order-number.util.ts`. */
  orderNumber: string;
  userId: string | null;
  guestEmail: string | null;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  fulfillmentStatus: FulfillmentStatus;
  billingAddressId: string;
  shippingAddressId: string;
  couponCode: string | null;
  notes: string | null;
  currency: string;
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  shippingTotal: number;
  total: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Repository-level creation input. Creates the order and its items
 * together (`items`) — unlike `modules/cart`, an order isn't built up
 * incrementally over time; it's placed once, with everything already
 * known (typically snapshotted from a cart at checkout, which is out of
 * scope here). `subtotal`/`total`/etc. are populated by the service
 * after computing them from `items` — never taken from client input,
 * the same reasoning `modules/cart`'s `CreateCartItemInput` documents
 * for `unitPrice`.
 */
export interface CreateOrderInput {
  userId?: string | null;
  guestEmail?: string | null;
  billingAddressId: string;
  shippingAddressId: string;
  couponCode?: string | null;
  notes?: string | null;
  currency: string;
  subtotal: number;
  discountTotal?: number;
  taxTotal?: number;
  shippingTotal?: number;
  total: number;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  fulfillmentStatus?: FulfillmentStatus;
  items: CreateOrderItemInput[];
}

/**
 * Deliberately narrow: addresses, amounts, currency, and items are
 * immutable once an order is placed — changing what was actually
 * charged needs a dedicated refund/adjustment flow, not a generic
 * update. Status fields have their own dedicated repository methods
 * (`updateStatus`/`updatePaymentStatus`/`updateFulfillmentStatus`)
 * rather than living here too, since each is its own independent
 * lifecycle dimension — see `constants/order.constants.ts`'s comment on
 * `ORDER_STATUSES`.
 */
export interface UpdateOrderInput {
  notes?: string | null;
}
