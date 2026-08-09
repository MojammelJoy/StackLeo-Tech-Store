import { describe, expect, it, vi } from "vitest";

import { createTestAuthenticatedUser } from "../../../testing";
import { ORDER_STATUSES } from "../constants";

import { OrderService } from "./order.service";

import type { AuthenticatedUser } from "../../../auth";
import type { AddressSnapshotProvider, CartCheckoutProvider } from "../interfaces";
import type {
  OrderRepository,
  ProductOrderSnapshot,
  ProductSnapshotRepository,
} from "../repository";
import type { AddressSnapshot, Order } from "../types";

function buildOrder(overrides: Partial<Order> = {}): Order {
  return {
    id: "order-1",
    orderNumber: "TEST-ORD-000001",
    sequenceNumber: 1,
    userId: "user-1",
    guestEmail: null,
    status: ORDER_STATUSES.PENDING,
    paymentStatus: "pending",
    fulfillmentStatus: "unfulfilled",
    billingAddressId: "address-billing",
    shippingAddressId: "address-shipping",
    billingAddress: buildAddressSnapshot(),
    shippingAddress: buildAddressSnapshot(),
    couponCode: null,
    notes: null,
    currency: "USD",
    subtotal: 2000,
    discountTotal: 0,
    taxTotal: 0,
    shippingTotal: 0,
    total: 2000,
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
    ...overrides,
  };
}

function buildAddressSnapshot(overrides: Partial<AddressSnapshot> = {}): AddressSnapshot {
  return {
    recipientName: "Jane Doe",
    phone: null,
    line1: "123 Main St",
    line2: null,
    city: "Dhaka",
    district: null,
    division: "Dhaka Division",
    postalCode: "1207",
    country: "BD",
    ...overrides,
  };
}

function buildProductSnapshot(overrides: Partial<ProductOrderSnapshot> = {}): ProductOrderSnapshot {
  return {
    id: "product-1",
    name: "Test Product",
    sku: "SKU-1",
    price: 1000,
    currency: "USD",
    status: "active",
    visibility: "public",
    deletedAt: null,
    ...overrides,
  };
}

function buildOrderRepository(overrides: Partial<OrderRepository> = {}): OrderRepository {
  return {
    findById: vi.fn().mockResolvedValue(null),
    findByOrderNumber: vi.fn().mockResolvedValue(null),
    findByUserId: vi.fn(),
    findByGuestEmail: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    updateStatus: vi.fn(),
    updatePaymentStatus: vi.fn(),
    updateFulfillmentStatus: vi.fn(),
    findItemsByOrderId: vi.fn().mockResolvedValue([]),
    findItemsByOrderIds: vi.fn().mockResolvedValue([]),
    findTimelineByOrderId: vi.fn().mockResolvedValue([]),
    getAvailableQuantities: vi.fn().mockResolvedValue(new Map()),
    ...overrides,
  };
}

function buildProductSnapshotRepository(
  overrides: Partial<ProductSnapshotRepository> = {},
): ProductSnapshotRepository {
  return {
    findManyByIds: vi.fn().mockResolvedValue(new Map()),
    ...overrides,
  };
}

function buildCartCheckout(overrides: Partial<CartCheckoutProvider> = {}): CartCheckoutProvider {
  return {
    getCartForCheckout: vi.fn().mockResolvedValue({ id: "cart-1", currency: "USD", items: [] }),
    markCartConverted: vi.fn(),
    ...overrides,
  };
}

function buildAddressSnapshotProvider(
  overrides: Partial<AddressSnapshotProvider> = {},
): AddressSnapshotProvider {
  return {
    getOwnedAddressSnapshot: vi.fn().mockResolvedValue(buildAddressSnapshot()),
    ...overrides,
  };
}

const ACTOR: AuthenticatedUser = createTestAuthenticatedUser({ id: "user-1" });

describe("OrderService", () => {
  describe("placeOrder", () => {
    it("rejects placing an order from an empty cart", async () => {
      const orderRepository = buildOrderRepository();
      const service = new OrderService(
        orderRepository,
        buildProductSnapshotRepository(),
        buildCartCheckout({
          getCartForCheckout: vi
            .fn()
            .mockResolvedValue({ id: "cart-1", currency: "USD", items: [] }),
        }),
        buildAddressSnapshotProvider(),
      );

      await expect(
        service.placeOrder(ACTOR, { billingAddressId: "b1", shippingAddressId: "s1" }),
      ).rejects.toThrow(/empty/i);
      expect(orderRepository.create).not.toHaveBeenCalled();
    });

    it("snapshots product and address data, deducts nothing itself (delegated to the repository), and converts the cart", async () => {
      const createdOrder = buildOrder();
      const orderRepository = buildOrderRepository({
        create: vi.fn().mockResolvedValue(createdOrder),
        getAvailableQuantities: vi.fn().mockResolvedValue(new Map([["SKU-1", 10]])),
      });
      const cartCheckout = buildCartCheckout({
        getCartForCheckout: vi.fn().mockResolvedValue({
          id: "cart-1",
          currency: "USD",
          items: [{ productId: "product-1", sku: "SKU-1", quantity: 2 }],
        }),
        markCartConverted: vi.fn(),
      });
      const service = new OrderService(
        orderRepository,
        buildProductSnapshotRepository({
          findManyByIds: vi
            .fn()
            .mockResolvedValue(new Map([["product-1", buildProductSnapshot()]])),
        }),
        cartCheckout,
        buildAddressSnapshotProvider(),
      );

      await service.placeOrder(ACTOR, { billingAddressId: "b1", shippingAddressId: "s1" });

      expect(orderRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: "user-1",
          currency: "USD",
          subtotal: 2000,
          total: 2000,
          items: [
            expect.objectContaining({
              productId: "product-1",
              sku: "SKU-1",
              productName: "Test Product",
              quantity: 2,
              unitPrice: 1000,
            }),
          ],
        }),
      );
      expect(cartCheckout.markCartConverted).toHaveBeenCalledWith("cart-1", ACTOR);
    });

    it("rejects when a cart item's product is no longer active/public", async () => {
      const orderRepository = buildOrderRepository();
      const service = new OrderService(
        orderRepository,
        buildProductSnapshotRepository({
          findManyByIds: vi
            .fn()
            .mockResolvedValue(new Map([["product-1", buildProductSnapshot({ status: "draft" })]])),
        }),
        buildCartCheckout({
          getCartForCheckout: vi.fn().mockResolvedValue({
            id: "cart-1",
            currency: "USD",
            items: [{ productId: "product-1", sku: "SKU-1", quantity: 1 }],
          }),
        }),
        buildAddressSnapshotProvider(),
      );

      await expect(
        service.placeOrder(ACTOR, { billingAddressId: "b1", shippingAddressId: "s1" }),
      ).rejects.toThrow(/no longer available/i);
      expect(orderRepository.create).not.toHaveBeenCalled();
    });

    it("rejects when inventory is insufficient", async () => {
      const orderRepository = buildOrderRepository({
        getAvailableQuantities: vi.fn().mockResolvedValue(new Map([["SKU-1", 1]])),
      });
      const service = new OrderService(
        orderRepository,
        buildProductSnapshotRepository({
          findManyByIds: vi
            .fn()
            .mockResolvedValue(new Map([["product-1", buildProductSnapshot()]])),
        }),
        buildCartCheckout({
          getCartForCheckout: vi.fn().mockResolvedValue({
            id: "cart-1",
            currency: "USD",
            items: [{ productId: "product-1", sku: "SKU-1", quantity: 5 }],
          }),
        }),
        buildAddressSnapshotProvider(),
      );

      await expect(
        service.placeOrder(ACTOR, { billingAddressId: "b1", shippingAddressId: "s1" }),
      ).rejects.toThrow(/insufficient stock/i);
      expect(orderRepository.create).not.toHaveBeenCalled();
    });
  });

  describe("ownership", () => {
    it("reports a foreign order as not found", async () => {
      const orderRepository = buildOrderRepository({
        findById: vi.fn().mockResolvedValue(buildOrder({ userId: "someone-else" })),
      });
      const service = new OrderService(
        orderRepository,
        buildProductSnapshotRepository(),
        buildCartCheckout(),
        buildAddressSnapshotProvider(),
      );

      await expect(service.getById("order-1", ACTOR)).rejects.toThrow(/not found/i);
    });
  });

  describe("cancel", () => {
    it("cancels a cancellable order", async () => {
      const order = buildOrder({ status: ORDER_STATUSES.PENDING });
      const orderRepository = buildOrderRepository({
        findById: vi.fn().mockResolvedValue(order),
        updateStatus: vi.fn().mockResolvedValue({ ...order, status: ORDER_STATUSES.CANCELLED }),
      });
      const service = new OrderService(
        orderRepository,
        buildProductSnapshotRepository(),
        buildCartCheckout(),
        buildAddressSnapshotProvider(),
      );

      await service.cancel("order-1", ACTOR, {});

      expect(orderRepository.updateStatus).toHaveBeenCalledWith(
        "order-1",
        ORDER_STATUSES.CANCELLED,
        ORDER_STATUSES.PENDING,
        "Cancelled by customer",
      );
    });

    it("rejects cancelling a completed order", async () => {
      const order = buildOrder({ status: ORDER_STATUSES.COMPLETED });
      const orderRepository = buildOrderRepository({ findById: vi.fn().mockResolvedValue(order) });
      const service = new OrderService(
        orderRepository,
        buildProductSnapshotRepository(),
        buildCartCheckout(),
        buildAddressSnapshotProvider(),
      );

      await expect(service.cancel("order-1", ACTOR, {})).rejects.toThrow(
        /can no longer be cancelled/i,
      );
      expect(orderRepository.updateStatus).not.toHaveBeenCalled();
    });
  });

  describe("updateStatus", () => {
    it("allows a valid transition", async () => {
      const order = buildOrder({ status: ORDER_STATUSES.PENDING });
      const orderRepository = buildOrderRepository({
        findById: vi.fn().mockResolvedValue(order),
        updateStatus: vi.fn().mockResolvedValue({ ...order, status: ORDER_STATUSES.CONFIRMED }),
      });
      const service = new OrderService(
        orderRepository,
        buildProductSnapshotRepository(),
        buildCartCheckout(),
        buildAddressSnapshotProvider(),
      );

      await service.updateStatus("order-1", { status: ORDER_STATUSES.CONFIRMED }, ACTOR);

      expect(orderRepository.updateStatus).toHaveBeenCalledWith(
        "order-1",
        ORDER_STATUSES.CONFIRMED,
        ORDER_STATUSES.PENDING,
        null,
      );
    });

    it("rejects an invalid transition", async () => {
      const order = buildOrder({ status: ORDER_STATUSES.PENDING });
      const orderRepository = buildOrderRepository({ findById: vi.fn().mockResolvedValue(order) });
      const service = new OrderService(
        orderRepository,
        buildProductSnapshotRepository(),
        buildCartCheckout(),
        buildAddressSnapshotProvider(),
      );

      await expect(
        service.updateStatus("order-1", { status: ORDER_STATUSES.COMPLETED }, ACTOR),
      ).rejects.toThrow(/cannot move/i);
      expect(orderRepository.updateStatus).not.toHaveBeenCalled();
    });

    it("rejects transitioning out of a terminal status", async () => {
      const order = buildOrder({ status: ORDER_STATUSES.CANCELLED });
      const orderRepository = buildOrderRepository({ findById: vi.fn().mockResolvedValue(order) });
      const service = new OrderService(
        orderRepository,
        buildProductSnapshotRepository(),
        buildCartCheckout(),
        buildAddressSnapshotProvider(),
      );

      await expect(
        service.updateStatus("order-1", { status: ORDER_STATUSES.CONFIRMED }, ACTOR),
      ).rejects.toThrow(/cannot move/i);
    });
  });
});
