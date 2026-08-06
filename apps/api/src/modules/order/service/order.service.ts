import { BadRequestError, ConflictError, NotFoundError } from "../../../errors";
import { logger } from "../../../logger";
import { ORDER_ITEM_MAX_QUANTITY, ORDER_STATUSES } from "../constants";
import { orderMapper } from "../mapper";
import { canTransitionOrderStatus, isCancellable } from "../utils";

import type { AuthenticatedUser } from "../../../auth";
import type { PaginatedResult, ParsedQuery } from "../../../common";
import type {
  CancelOrderDto,
  CreateOrderDto,
  OrderResponseDto,
  OrderTimelineEntryDto,
  UpdateOrderStatusDto,
} from "../dto";
import type {
  AddressSnapshotProvider,
  CartCheckoutItem,
  CartCheckoutProvider,
  OrderFilterOptions,
} from "../interfaces";
import type {
  OrderRepository,
  ProductOrderSnapshot,
  ProductSnapshotRepository,
} from "../repository";
import type { CreateOrderItemInput, Order, OrderItem } from "../types";

/** A product must be `active`/`public` (and not soft-deleted) to be
 * ordered — mirrors `modules/cart`'s own sellability check, duplicated
 * as bare strings for the same decoupling reason `modules/search`
 * documents on `SEARCH_VISIBLE_STATUS` (this module never imports
 * `modules/product`). */
const ORDERABLE_PRODUCT_STATUS = "active";
const ORDERABLE_PRODUCT_VISIBILITY = "public";

/**
 * Implements every Order API operation: placing an order from the
 * caller's cart, lookup (by id / order number / paginated list),
 * cancellation, staff-driven status transitions, and the status
 * timeline. Depends on `OrderRepository` (order/item/history
 * persistence), `ProductSnapshotRepository` (read-only product facts —
 * see that interface's doc comment), `CartCheckoutProvider`, and
 * `AddressSnapshotProvider` (the two real cross-module integrations —
 * see each interface's doc comment for why they exist instead of
 * importing `modules/cart`/`modules/address` directly) — interfaces
 * only, never Prisma directly.
 *
 * No coupon/tax/shipping-cost module exists in this codebase, so
 * `discountTotal`/`taxTotal`/`shippingTotal` are always `0` and
 * `total === subtotal` — the same placeholder-until-a-real-module
 * pattern `modules/cart`'s `CartSummary` already establishes; nothing
 * here pretends to calculate a coupon discount or shipping cost.
 *
 * Ownership is enforced on every read/cancel via `getOwnedOrder` — a
 * foreign order is reported as `NotFoundError`, never `ForbiddenError`,
 * the same treatment `modules/cart`/`modules/wishlist`/`modules/address`
 * give a resource that isn't the caller's. `updateStatus` is the one
 * exception: it's gated by `PERMISSIONS.ORDER_UPDATE` at the route
 * layer instead (a staff-only, cross-customer capability — see that
 * permission's doc comment), so it looks an order up directly rather
 * than through the ownership-checked path.
 */
export class OrderService {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly productSnapshot: ProductSnapshotRepository,
    private readonly cartCheckout: CartCheckoutProvider,
    private readonly addressSnapshot: AddressSnapshotProvider,
  ) {}

  /**
   * "Place order": resolves the caller's cart (must be non-empty —
   * "validate cart before placing order"), re-validates and
   * re-snapshots every item against the *current* product data
   * (`buildOrderItems` — "store product snapshot inside order items"),
   * pre-checks stock ("validate inventory availability"), snapshots
   * both addresses (ownership-checked via `AddressSnapshotProvider` —
   * ["store shipping/billing address snapshot"]), then delegates the
   * atomic order-creation-plus-inventory-deduction to
   * `OrderRepository.create` ("deduct inventory using Prisma
   * transactions"). The source cart is only marked converted *after*
   * the order is durably persisted.
   */
  async placeOrder(actor: AuthenticatedUser, dto: CreateOrderDto): Promise<OrderResponseDto> {
    const cart = await this.cartCheckout.getCartForCheckout(actor);
    if (cart.items.length === 0) {
      throw new BadRequestError("Cart is empty — add at least one item before placing an order");
    }

    const [billingAddress, shippingAddress] = await Promise.all([
      this.addressSnapshot.getOwnedAddressSnapshot(actor, dto.billingAddressId),
      this.addressSnapshot.getOwnedAddressSnapshot(actor, dto.shippingAddressId),
    ]);

    const items = await this.buildOrderItems(cart.items, cart.currency);
    await this.assertInventoryAvailable(items);

    const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

    const order = await this.orderRepository.create({
      userId: actor.id,
      billingAddressId: dto.billingAddressId,
      shippingAddressId: dto.shippingAddressId,
      billingAddress,
      shippingAddress,
      couponCode: dto.couponCode,
      notes: dto.notes,
      currency: cart.currency,
      subtotal,
      total: subtotal,
      status: ORDER_STATUSES.PENDING,
      items,
    });

    await this.cartCheckout.markCartConverted(cart.id, actor);

    logger.info(
      {
        orderId: order.id,
        orderNumber: order.orderNumber,
        actorId: actor.id,
        itemCount: items.length,
      },
      "Order placed",
    );
    return this.buildOrderResponse(order);
  }

  async getById(id: string, actor: AuthenticatedUser): Promise<OrderResponseDto> {
    const order = await this.getOwnedOrder(id, actor);
    return this.buildOrderResponse(order);
  }

  async getByOrderNumber(orderNumber: string, actor: AuthenticatedUser): Promise<OrderResponseDto> {
    const order = await this.orderRepository.findByOrderNumber(orderNumber);
    if (!order || order.userId !== actor.id) {
      throw new NotFoundError("Order not found");
    }
    return this.buildOrderResponse(order);
  }

  async listForUser(
    actor: AuthenticatedUser,
    query: ParsedQuery,
    filters: OrderFilterOptions,
  ): Promise<PaginatedResult<OrderResponseDto>> {
    const result = await this.orderRepository.findByUserId(actor.id, query, filters);
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

  async getTimeline(id: string, actor: AuthenticatedUser): Promise<OrderTimelineEntryDto[]> {
    await this.getOwnedOrder(id, actor);
    const entries = await this.orderRepository.findTimelineByOrderId(id);
    return orderMapper.toTimelineEntryList(entries);
  }

  async cancel(
    id: string,
    actor: AuthenticatedUser,
    dto: CancelOrderDto,
  ): Promise<OrderResponseDto> {
    const order = await this.getOwnedOrder(id, actor);
    if (!isCancellable(order.status)) {
      throw new ConflictError(`Order in status "${order.status}" can no longer be cancelled`);
    }

    const updated = await this.orderRepository.updateStatus(
      id,
      ORDER_STATUSES.CANCELLED,
      dto.note ?? "Cancelled by customer",
    );
    logger.info({ orderId: id, actorId: actor.id }, "Order cancelled");
    return this.buildOrderResponse(updated);
  }

  /** Staff-only (gated by `PERMISSIONS.ORDER_UPDATE` at the route
   * layer — see this class's doc comment) — looks the order up
   * directly rather than through `getOwnedOrder`, since staff manage
   * orders that aren't theirs by definition. */
  async updateStatus(
    id: string,
    dto: UpdateOrderStatusDto,
    actor: AuthenticatedUser,
  ): Promise<OrderResponseDto> {
    const order = await this.orderRepository.findById(id);
    if (!order) {
      throw new NotFoundError("Order not found");
    }
    if (!canTransitionOrderStatus(order.status, dto.status)) {
      throw new ConflictError(`Order cannot move from "${order.status}" to "${dto.status}"`);
    }

    const updated = await this.orderRepository.updateStatus(id, dto.status, dto.note ?? null);
    logger.info(
      { orderId: id, from: order.status, to: dto.status, actorId: actor.id },
      "Order status updated",
    );
    return this.buildOrderResponse(updated);
  }

  private async getOwnedOrder(id: string, actor: AuthenticatedUser): Promise<Order> {
    const order = await this.orderRepository.findById(id);
    if (!order || order.userId !== actor.id) {
      throw new NotFoundError("Order not found");
    }
    return order;
  }

  /** Re-validates and re-prices every cart item against the *current*
   * product data — a cart item's own stored price may be stale (see
   * `modules/cart`'s own "current price" recomputation), and the
   * product itself may have gone unavailable since it was added. This
   * is both "validate cart before placing order" and "store product
   * snapshot inside order items" at once: what's built here becomes
   * the immutable `OrderItem` rows. */
  private async buildOrderItems(
    cartItems: CartCheckoutItem[],
    cartCurrency: string,
  ): Promise<CreateOrderItemInput[]> {
    const products = await this.productSnapshot.findManyByIds(
      cartItems.map((item) => item.productId),
    );

    return cartItems.map((item) => {
      const product = products.get(item.productId);
      if (!this.isOrderable(product)) {
        throw new ConflictError(`A product in your cart is no longer available`);
      }
      if (product.sku !== item.sku) {
        throw new ConflictError("Your cart is out of date — please refresh it and try again");
      }
      if (product.currency !== cartCurrency) {
        throw new ConflictError(
          `Product currency "${product.currency}" does not match cart currency "${cartCurrency}"`,
        );
      }
      if (item.quantity > ORDER_ITEM_MAX_QUANTITY) {
        throw new BadRequestError(
          `Quantity for "${product.name}" exceeds the maximum of ${ORDER_ITEM_MAX_QUANTITY} per order`,
        );
      }

      return {
        productId: item.productId,
        sku: product.sku,
        productName: product.name,
        quantity: item.quantity,
        unitPrice: product.price,
      };
    });
  }

  private isOrderable(
    product: ProductOrderSnapshot | null | undefined,
  ): product is ProductOrderSnapshot {
    return (
      !!product &&
      product.deletedAt === null &&
      product.status === ORDERABLE_PRODUCT_STATUS &&
      product.visibility === ORDERABLE_PRODUCT_VISIBILITY
    );
  }

  /** Fast, specific pre-check ("validate inventory availability")
   * before ever attempting `OrderRepository.create` — its own
   * transactional re-check remains the authoritative, race-safe
   * enforcement (see that method's doc comment); this only exists so a
   * checkout with obviously insufficient stock fails with a clear,
   * itemized message instead of a generic transaction error. */
  private async assertInventoryAvailable(items: CreateOrderItemInput[]): Promise<void> {
    const requiredBySku = new Map<string, number>();
    for (const item of items) {
      requiredBySku.set(item.sku, (requiredBySku.get(item.sku) ?? 0) + item.quantity);
    }

    const available = await this.orderRepository.getAvailableQuantities([...requiredBySku.keys()]);

    const shortages: string[] = [];
    for (const [sku, required] of requiredBySku) {
      const availableQuantity = available.get(sku) ?? 0;
      if (availableQuantity < required) {
        shortages.push(`${sku} (need ${required}, have ${availableQuantity})`);
      }
    }

    if (shortages.length > 0) {
      throw new ConflictError(`Insufficient stock for: ${shortages.join(", ")}`);
    }
  }

  private async buildOrderResponse(order: Order): Promise<OrderResponseDto> {
    const items = await this.orderRepository.findItemsByOrderId(order.id);
    return orderMapper.toOrderResponseDto(order, items);
  }
}
