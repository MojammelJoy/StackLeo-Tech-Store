import type { PaginatedResult, ParsedQuery } from "../../../common";
import type { FulfillmentStatus, OrderStatus, PaymentStatus } from "../constants";
import type { OrderFilterOptions } from "../interfaces";
import type { CreateOrderInput, Order, OrderItem, UpdateOrderInput } from "../types";

/**
 * Persistence contract for the Order domain entity, plus its items. The
 * service depends on this interface, never on a concrete implementation
 * directly, so swapping `OrderPrismaRepository` for a test double (or a
 * different persistence layer entirely) never touches service code.
 *
 * `create` persists the order and its items together — see
 * `CreateOrderInput`'s comment in `types/order.types.ts` for why there's
 * no separate `addItem`, unlike `modules/cart`/`modules/wishlist`.
 * `updateStatus`/`updatePaymentStatus`/`updateFulfillmentStatus` are
 * three separate methods rather than one generic status update, since
 * each is its own independent lifecycle dimension — see
 * `constants/order.constants.ts`'s comment on `ORDER_STATUSES`.
 */
export interface OrderRepository {
  findById(id: string): Promise<Order | null>;
  findByOrderNumber(orderNumber: string): Promise<Order | null>;
  findByUserId(
    userId: string,
    query: ParsedQuery,
    filters?: OrderFilterOptions,
  ): Promise<PaginatedResult<Order>>;
  findByGuestEmail(
    guestEmail: string,
    query: ParsedQuery,
    filters?: OrderFilterOptions,
  ): Promise<PaginatedResult<Order>>;
  create(data: CreateOrderInput): Promise<Order>;
  update(id: string, data: UpdateOrderInput): Promise<Order>;
  updateStatus(id: string, status: OrderStatus): Promise<Order>;
  updatePaymentStatus(id: string, status: PaymentStatus): Promise<Order>;
  updateFulfillmentStatus(id: string, status: FulfillmentStatus): Promise<Order>;

  findItemsByOrderId(orderId: string): Promise<OrderItem[]>;
}
