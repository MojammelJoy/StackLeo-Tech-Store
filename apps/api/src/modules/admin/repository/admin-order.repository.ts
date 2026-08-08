import type { PaginatedResult, ParsedQuery } from "../../../common";
import type { Order, OrderFilterOptions } from "../../order";

/**
 * The one read `modules/order`'s own `OrderRepository` doesn't expose:
 * every order across every customer, paginated/filtered/sorted/searched
 * — `OrderRepository.findByUserId`/`findByGuestEmail` both require an
 * identity to scope to, by design (self-service ownership). Every other
 * order operation this module needs (`findById`, `findByOrderNumber`,
 * `findItemsByOrderId`, `findTimelineByOrderId`) is already unscoped on
 * `modules/order`'s own `OrderPrismaRepository`, so `service/` reuses
 * that directly instead of duplicating it here — see
 * `service/admin-order.service.ts`.
 */
export interface AdminOrderRepository {
  findAll(query: ParsedQuery, filters?: OrderFilterOptions): Promise<PaginatedResult<Order>>;
}
