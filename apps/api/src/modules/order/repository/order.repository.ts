import type { PaginatedResult, ParsedQuery } from "../../../common";
import type { FulfillmentStatus, OrderStatus, PaymentStatus } from "../constants";
import type { OrderFilterOptions } from "../interfaces";
import type {
  CreateOrderInput,
  Order,
  OrderItem,
  OrderStatusHistoryEntry,
  UpdateOrderInput,
} from "../types";

/**
 * Persistence contract for the Order domain entity, plus its items and
 * status timeline. The service depends on this interface, never on a
 * concrete implementation directly, so swapping `OrderPrismaRepository`
 * for a test double (or a different persistence layer entirely) never
 * touches service code.
 *
 * `create` persists the order, its items, its initial status-history
 * entry, *and* deducts inventory for every item — all inside one
 * `$transaction` (see `OrderPrismaRepository.create`'s doc comment) —
 * see `CreateOrderInput`'s comment in `types/order.types.ts` for why
 * there's no separate `addItem`, unlike `modules/cart`/
 * `modules/wishlist`. `updateStatus`/`updatePaymentStatus`/
 * `updateFulfillmentStatus` are three separate methods rather than one
 * generic status update, since each is its own independent lifecycle
 * dimension — see `constants/order.constants.ts`'s comment on
 * `ORDER_STATUSES`. `updateStatus` alone also appends a
 * `OrderStatusHistoryEntry` (in the same transaction as the status
 * write) — the other two dimensions have no history feature requested
 * for this API.
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
  /** Atomically deducts inventory for every item (see this interface's
   * doc comment) then creates the order/items/initial history entry.
   * Throws `ConflictError` — rolling back the whole transaction,
   * persisting nothing — if any item's stock is insufficient or
   * changed concurrently since `OrderService.placeOrder`'s own
   * pre-check. */
  create(data: CreateOrderInput): Promise<Order>;
  update(id: string, data: UpdateOrderInput): Promise<Order>;
  updateStatus(id: string, status: OrderStatus, note?: string | null): Promise<Order>;
  updatePaymentStatus(id: string, status: PaymentStatus): Promise<Order>;
  updateFulfillmentStatus(id: string, status: FulfillmentStatus): Promise<Order>;

  findItemsByOrderId(orderId: string): Promise<OrderItem[]>;
  /** Bulk variant of `findItemsByOrderId` — one query for every item
   * across every order in `orderIds`, instead of one query per order.
   * Used by `OrderService.listForUser` so a page of `N` orders costs
   * one extra query, not `N` (mirrors `modules/cart`'s
   * `findItemsByCartIds`). */
  findItemsByOrderIds(orderIds: string[]): Promise<OrderItem[]>;
  findTimelineByOrderId(orderId: string): Promise<OrderStatusHistoryEntry[]>;
  /** Total available quantity (`quantity - reservedQuantity`, floored
   * at `0`) per SKU, summed across every warehouse — the pre-check
   * `OrderService.placeOrder` uses for a fast, specific "which items
   * are short" error before ever attempting `create`'s own
   * authoritative, transactional re-check. Missing SKUs are `0`, not
   * absent from the map. */
  getAvailableQuantities(skus: string[]): Promise<Map<string, number>>;
}
