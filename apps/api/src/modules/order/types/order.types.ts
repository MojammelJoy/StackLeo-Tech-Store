import type { FulfillmentStatus, OrderStatus, PaymentStatus } from "../constants";
import type { AddressSnapshot } from "./address-snapshot.types";
import type { CreateOrderItemInput } from "./order-item.types";

/**
 * The persisted Order domain entity. `billingAddressId`/
 * `shippingAddressId` are bare foreign-key-shaped references to
 * `modules/address`'s `Address.id` — never an import of that module,
 * the same discipline every module in this monorepo keeps toward its
 * siblings. `billingAddress`/`shippingAddress` are the actual frozen
 * snapshot those ids pointed at when the order was placed — see
 * `AddressSnapshot`'s doc comment for why both the id *and* the
 * snapshot are kept. `couponCode` is a bare string reference for the
 * same reason — no coupon module exists.
 *
 * Unlike `modules/cart`'s `Cart`, an order has no `guestToken`: once
 * placed, an order is a permanent record a guest looks up later by
 * `guestEmail` (for order confirmation/lookup), not an ongoing session.
 * This API's own routes never populate `guestEmail` (authenticated
 * users only — see `service/order.service.ts`); the field exists only
 * because it's part of this domain entity's full shape.
 *
 * `subtotal`/`discountTotal`/`taxTotal`/`shippingTotal`/`total` are
 * stored fields, not computed on read like `modules/cart`'s
 * `CartSummary` — a cart's contents constantly change, so its summary
 * is always recalculated live; an order is a frozen snapshot of what
 * was actually charged at checkout, so its amounts are historical fact.
 * `discountTotal`/`taxTotal`/`shippingTotal` are always `0` in this API
 * (no coupon/tax/shipping-cost module exists — see
 * `service/order.service.ts`'s doc comment); the fields exist so a
 * future module has somewhere to plug in a real calculation without
 * this shape changing, mirroring `modules/cart`'s identical
 * `CartSummary` placeholders.
 */
export interface Order {
  id: string;
  /** Customer-facing identifier, e.g. `"ORD-000123"` — derived from
   * `sequenceNumber` at read time, never stored. See
   * `utils/order-number.util.ts`. */
  orderNumber: string;
  /** The native Postgres autoincrement counter `orderNumber` is
   * formatted from — see `prisma/schema.prisma`'s `Order` doc comment. */
  sequenceNumber: number;
  userId: string | null;
  guestEmail: string | null;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  fulfillmentStatus: FulfillmentStatus;
  billingAddressId: string;
  shippingAddressId: string;
  billingAddress: AddressSnapshot;
  shippingAddress: AddressSnapshot;
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
 * Repository-level creation input. Creates the order, its items, and
 * its initial status-history entry together (`items`) — unlike
 * `modules/cart`, an order isn't built up incrementally over time; it's
 * placed once, with everything already known (snapshotted from the
 * caller's cart at checkout by `OrderService.placeOrder`).
 * `subtotal`/`total`/etc. are populated by the service after computing
 * them from `items` — never taken from client input, the same reasoning
 * `modules/cart`'s `CreateCartItemInput` documents for `unitPrice`.
 * `billingAddress`/`shippingAddress` are populated by the service from
 * a live, ownership-checked `Address` lookup — never taken from client
 * input either, for the same reason.
 */
export interface CreateOrderInput {
  userId?: string | null;
  guestEmail?: string | null;
  billingAddressId: string;
  shippingAddressId: string;
  billingAddress: AddressSnapshot;
  shippingAddress: AddressSnapshot;
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
