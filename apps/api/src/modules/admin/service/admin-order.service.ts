import { NotFoundError } from "../../../errors";
import { ORDER_STATUSES, orderMapper } from "../../order";

import type { AuthenticatedUser } from "../../../auth";
import type { PaginatedResult, ParsedQuery } from "../../../common";
import type {
  CancelOrderDto,
  Order,
  OrderFilterOptions,
  OrderItem,
  OrderRepository,
  OrderResponseDto,
  OrderService,
  OrderTimelineEntryDto,
  UpdateOrderStatusDto,
} from "../../order";
import type { AdminOrderRepository } from "../repository";

/**
 * Administrative order management. `list`/`getById`/`getByOrderNumber`/
 * `getTimeline` read through `AdminOrderRepository` (the one unscoped
 * listing capability `modules/order` doesn't expose) plus
 * `modules/order`'s own `OrderRepository` — its `findById`/
 * `findByOrderNumber`/`findItemsByOrderId(s)`/`findTimelineByOrderId`
 * are already unscoped (staff read orders that aren't theirs by
 * definition), so reused directly rather than duplicated.
 * `updateStatus`/`cancel` both delegate outright to `OrderService.updateStatus`
 * — transition validation, `OrderStatusHistory` creation, and inventory
 * consistency all already live there; this service never writes an
 * `Order` row itself.
 */
export class AdminOrderService {
  constructor(
    private readonly adminOrderRepository: AdminOrderRepository,
    private readonly orderRepository: OrderRepository,
    private readonly orderService: OrderService,
  ) {}

  async list(
    query: ParsedQuery,
    filters: OrderFilterOptions,
  ): Promise<PaginatedResult<OrderResponseDto>> {
    const result = await this.adminOrderRepository.findAll(query, filters);
    if (result.items.length === 0) {
      return { items: [], meta: result.meta };
    }

    const allItems = await this.orderRepository.findItemsByOrderIds(
      result.items.map((order) => order.id),
    );
    const itemsByOrderId = new Map<string, OrderItem[]>();
    for (const item of allItems) {
      const items = itemsByOrderId.get(item.orderId) ?? [];
      items.push(item);
      itemsByOrderId.set(item.orderId, items);
    }

    const items = result.items.map((order) =>
      orderMapper.toOrderResponseDto(order, itemsByOrderId.get(order.id) ?? []),
    );
    return { items, meta: result.meta };
  }

  async getById(id: string): Promise<OrderResponseDto> {
    const order = await this.getExistingOrder(id);
    return this.buildResponse(order);
  }

  async getByOrderNumber(orderNumber: string): Promise<OrderResponseDto> {
    const order = await this.orderRepository.findByOrderNumber(orderNumber);
    if (!order) {
      throw new NotFoundError("Order not found");
    }
    return this.buildResponse(order);
  }

  async getTimeline(id: string): Promise<OrderTimelineEntryDto[]> {
    await this.getExistingOrder(id);
    const entries = await this.orderRepository.findTimelineByOrderId(id);
    return orderMapper.toTimelineEntryList(entries);
  }

  /** Reuses `OrderService.updateStatus` outright — see this class's doc
   * comment. */
  async updateStatus(
    id: string,
    dto: UpdateOrderStatusDto,
    actor: AuthenticatedUser,
  ): Promise<OrderResponseDto> {
    return this.orderService.updateStatus(id, dto, actor);
  }

  /** "Cancel order where administrative cancellation is permitted" —
   * also just `OrderService.updateStatus` with the target status fixed
   * to `CANCELLED`: the same transition-validated, history-creating,
   * unscoped path `updateStatus` uses, so an admin cancellation follows
   * exactly the same rules as any other admin status change (only an
   * order in a cancellable status can move to `CANCELLED` — see
   * `modules/order`'s `ORDER_STATUS_TRANSITIONS`). */
  async cancel(
    id: string,
    dto: CancelOrderDto,
    actor: AuthenticatedUser,
  ): Promise<OrderResponseDto> {
    return this.orderService.updateStatus(
      id,
      { status: ORDER_STATUSES.CANCELLED, note: dto.note ?? "Cancelled by administrator" },
      actor,
    );
  }

  private async getExistingOrder(id: string): Promise<Order> {
    const order = await this.orderRepository.findById(id);
    if (!order) {
      throw new NotFoundError("Order not found");
    }
    return order;
  }

  private async buildResponse(order: Order): Promise<OrderResponseDto> {
    const items = await this.orderRepository.findItemsByOrderId(order.id);
    return orderMapper.toOrderResponseDto(order, items);
  }
}
