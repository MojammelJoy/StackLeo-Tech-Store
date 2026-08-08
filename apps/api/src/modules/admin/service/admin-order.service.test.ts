import { describe, expect, it, vi } from "vitest";

import { AdminOrderService } from "./admin-order.service";

import type { AuthenticatedUser } from "../../../auth";
import type { Order, OrderItem, OrderRepository, OrderService } from "../../order";
import type { AdminOrderRepository } from "../repository";

function buildOrder(overrides: Partial<Order> = {}): Order {
  return {
    id: "order-1",
    orderNumber: "ORD-000001",
    sequenceNumber: 1,
    userId: "user-1",
    guestEmail: null,
    status: "pending",
    paymentStatus: "pending",
    fulfillmentStatus: "unfulfilled",
    billingAddressId: "address-1",
    shippingAddressId: "address-1",
    billingAddress: {} as never,
    shippingAddress: {} as never,
    couponCode: null,
    notes: null,
    currency: "BDT",
    subtotal: 5000,
    discountTotal: 0,
    taxTotal: 0,
    shippingTotal: 0,
    total: 5000,
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
    ...overrides,
  };
}

function buildOrderRepository(overrides: Partial<OrderRepository> = {}): OrderRepository {
  return {
    findById: vi.fn().mockResolvedValue(null),
    findByOrderNumber: vi.fn(),
    findByUserId: vi.fn(),
    findByGuestEmail: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    updateStatus: vi.fn(),
    updatePaymentStatus: vi.fn(),
    updateFulfillmentStatus: vi.fn(),
    findItemsByOrderId: vi.fn().mockResolvedValue([] as OrderItem[]),
    findItemsByOrderIds: vi.fn().mockResolvedValue([] as OrderItem[]),
    findTimelineByOrderId: vi.fn().mockResolvedValue([]),
    getAvailableQuantities: vi.fn(),
    ...overrides,
  };
}

const ADMIN: AuthenticatedUser = { id: "admin-1", roles: ["admin"] } as AuthenticatedUser;

describe("AdminOrderService", () => {
  describe("list", () => {
    it("batches item lookup across every order in the page", async () => {
      const adminOrderRepository: AdminOrderRepository = {
        findAll: vi.fn().mockResolvedValue({ items: [buildOrder()], meta: {} }),
      };
      const findItemsByOrderIds = vi.fn().mockResolvedValue([]);
      const orderRepository = buildOrderRepository({ findItemsByOrderIds });
      const service = new AdminOrderService(
        adminOrderRepository,
        orderRepository,
        {} as OrderService,
      );

      const result = await service.list({ pagination: {}, sort: [], filters: {} } as never, {});
      expect(findItemsByOrderIds).toHaveBeenCalledWith(["order-1"]);
      expect(result.items).toHaveLength(1);
    });

    it("skips the item lookup entirely for an empty page", async () => {
      const adminOrderRepository: AdminOrderRepository = {
        findAll: vi.fn().mockResolvedValue({ items: [], meta: {} }),
      };
      const findItemsByOrderIds = vi.fn();
      const orderRepository = buildOrderRepository({ findItemsByOrderIds });
      const service = new AdminOrderService(
        adminOrderRepository,
        orderRepository,
        {} as OrderService,
      );

      await service.list({ pagination: {}, sort: [], filters: {} } as never, {});
      expect(findItemsByOrderIds).not.toHaveBeenCalled();
    });
  });

  describe("getById", () => {
    it("finds any order regardless of owner (no ownership scoping)", async () => {
      const orderRepository = buildOrderRepository({
        findById: vi.fn().mockResolvedValue(buildOrder({ userId: "someone-else" })),
      });
      const adminOrderRepository = { findAll: vi.fn() } as unknown as AdminOrderRepository;
      const service = new AdminOrderService(
        adminOrderRepository,
        orderRepository,
        {} as OrderService,
      );

      const result = await service.getById("order-1");
      expect(result.id).toBe("order-1");
    });

    it("throws when the order does not exist", async () => {
      const orderRepository = buildOrderRepository();
      const adminOrderRepository = { findAll: vi.fn() } as unknown as AdminOrderRepository;
      const service = new AdminOrderService(
        adminOrderRepository,
        orderRepository,
        {} as OrderService,
      );

      await expect(service.getById("missing")).rejects.toThrow(/not found/i);
    });
  });

  describe("updateStatus / cancel", () => {
    it("delegates status changes to OrderService.updateStatus outright", async () => {
      const updateStatus = vi.fn().mockResolvedValue({ id: "order-1" });
      const orderRepository = buildOrderRepository();
      const adminOrderRepository = { findAll: vi.fn() } as unknown as AdminOrderRepository;
      const orderService = { updateStatus } as unknown as OrderService;
      const service = new AdminOrderService(adminOrderRepository, orderRepository, orderService);

      await service.updateStatus("order-1", { status: "confirmed" } as never, ADMIN);
      expect(updateStatus).toHaveBeenCalledWith("order-1", { status: "confirmed" }, ADMIN);
    });

    it("cancels by delegating to OrderService.updateStatus with status=cancelled", async () => {
      const updateStatus = vi.fn().mockResolvedValue({ id: "order-1" });
      const orderRepository = buildOrderRepository();
      const adminOrderRepository = { findAll: vi.fn() } as unknown as AdminOrderRepository;
      const orderService = { updateStatus } as unknown as OrderService;
      const service = new AdminOrderService(adminOrderRepository, orderRepository, orderService);

      await service.cancel("order-1", { note: "Fraud suspected" }, ADMIN);
      expect(updateStatus).toHaveBeenCalledWith(
        "order-1",
        expect.objectContaining({ status: "cancelled", note: "Fraud suspected" }),
        ADMIN,
      );
    });
  });
});
