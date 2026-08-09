import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

import { prisma } from "../database";
import { registerAndLoginTestUser, resetDatabase, startTestServer } from "../testing/integration";

import {
  addToCart,
  createAddress,
  createAdmin,
  createSellableProduct,
  placeOrder,
  setUpAndPlaceOrder,
  stockProduct,
} from "./fixtures";

import type { RegisteredTestUser, TestServer } from "../testing/integration";

describe("order number, status workflow, and cancellation (integration)", () => {
  let server: TestServer;

  beforeAll(async () => {
    server = await startTestServer();
  });

  afterEach(async () => {
    await resetDatabase();
  });

  afterAll(async () => {
    await server.close();
  });

  describe("order number", () => {
    it("generates a well-formed, unique order number per order", async () => {
      const { order: first } = await setUpAndPlaceOrder(server.baseUrl);
      const { order: second } = await setUpAndPlaceOrder(server.baseUrl);

      expect(first.orderNumber).toMatch(/^TEST-ORD-\d{6}$/);
      expect(second.orderNumber).toMatch(/^TEST-ORD-\d{6}$/);
      expect(first.orderNumber).not.toBe(second.orderNumber);
    });

    it("cannot generate duplicate order numbers under concurrent creation", async () => {
      const admin = await createAdmin(server.baseUrl);
      const product = await createSellableProduct(admin);
      await stockProduct(admin, product.sku, 10);

      const buyers: Array<{ buyer: RegisteredTestUser; addressId: string }> = [];
      for (let i = 0; i < 5; i += 1) {
        const buyer = await registerAndLoginTestUser(server.baseUrl);
        const address = await createAddress(buyer);
        await addToCart(buyer, product, 1);
        buyers.push({ buyer, addressId: address.id });
      }

      const results = await Promise.all(
        buyers.map(({ buyer, addressId }) =>
          placeOrder(buyer, { billingAddressId: addressId, shippingAddressId: addressId }),
        ),
      );

      // Every one of the 5 concurrent placements must succeed: 10 units
      // were stocked for 5 buyers each ordering 1, so there is no
      // genuine stock shortage — a failure here means the optimistic-
      // concurrency retry in `OrderPrismaRepository.deductInventory`
      // regressed (see that method's doc comment).
      const orderNumbers = results.map((result) => result.order?.orderNumber).filter(Boolean);
      expect(orderNumbers).toHaveLength(5);
      expect(new Set(orderNumbers).size).toBe(5);
    }, 30_000);
  });

  describe("status transitions", () => {
    async function placeOrderAsAdminManaged(): Promise<{
      admin: RegisteredTestUser;
      buyer: RegisteredTestUser;
      orderId: string;
    }> {
      const { admin, buyer, order } = await setUpAndPlaceOrder(server.baseUrl);
      return { admin, buyer, orderId: order.id };
    }

    it("allows the documented pending -> confirmed -> processing -> completed path", async () => {
      const { admin, orderId } = await placeOrderAsAdminManaged();

      const toConfirmed = await admin.client.patch<{ data: { order: { status: string } } }>(
        `/api/v1/admin/orders/${orderId}/status`,
        { status: "confirmed" },
      );
      expect(toConfirmed.status).toBe(200);
      expect(toConfirmed.body.data.order.status).toBe("confirmed");

      const toProcessing = await admin.client.patch<{ data: { order: { status: string } } }>(
        `/api/v1/admin/orders/${orderId}/status`,
        { status: "processing" },
      );
      expect(toProcessing.body.data.order.status).toBe("processing");

      const toCompleted = await admin.client.patch<{ data: { order: { status: string } } }>(
        `/api/v1/admin/orders/${orderId}/status`,
        { status: "completed" },
      );
      expect(toCompleted.body.data.order.status).toBe("completed");

      const history = await prisma.orderStatusHistory.findMany({
        where: { orderId },
        orderBy: { createdAt: "asc" },
      });
      expect(history.map((entry) => entry.status)).toEqual([
        "pending",
        "confirmed",
        "processing",
        "completed",
      ]);
    });

    it("rejects an invalid transition (pending directly to completed)", async () => {
      const { admin, orderId } = await placeOrderAsAdminManaged();

      const response = await admin.client.patch(`/api/v1/admin/orders/${orderId}/status`, {
        status: "completed",
      });
      expect(response.status).toBe(409);

      const order = await prisma.order.findUniqueOrThrow({ where: { id: orderId } });
      expect(order.status).toBe("pending");
    });

    it("rejects any transition out of a terminal status (cancelled)", async () => {
      const { admin, orderId } = await placeOrderAsAdminManaged();
      await admin.client.patch(`/api/v1/admin/orders/${orderId}/status`, { status: "cancelled" });

      const response = await admin.client.patch(`/api/v1/admin/orders/${orderId}/status`, {
        status: "confirmed",
      });
      expect(response.status).toBe(409);
    });

    it("rejects a status update from a plain member without order:update", async () => {
      const { buyer, orderId } = await placeOrderAsAdminManaged();

      const response = await buyer.client.patch(`/api/v1/admin/orders/${orderId}/status`, {
        status: "confirmed",
      });
      expect(response.status).toBe(403);
    });
  });

  describe("cancellation", () => {
    it("lets the owning customer cancel their own pending order", async () => {
      const { buyer, order } = await setUpAndPlaceOrder(server.baseUrl);

      const response = await buyer.client.post<{ data: { order: { status: string } } }>(
        `/api/v1/orders/${order.id}/cancel`,
        { note: "Changed my mind" },
      );
      expect(response.status).toBe(200);
      expect(response.body.data.order.status).toBe("cancelled");

      const history = await prisma.orderStatusHistory.findMany({
        where: { orderId: order.id },
        orderBy: { createdAt: "asc" },
      });
      expect(history.at(-1)?.status).toBe("cancelled");
      expect(history.at(-1)?.note).toBe("Changed my mind");
    });

    it("rejects cancelling another user's order", async () => {
      const { order } = await setUpAndPlaceOrder(server.baseUrl);
      const attacker = await registerAndLoginTestUser(server.baseUrl);

      const response = await attacker.client.post(`/api/v1/orders/${order.id}/cancel`, {});
      expect(response.status).toBe(404);
    });

    it("rejects cancelling an order that already reached a non-cancellable status", async () => {
      const { admin, buyer, order } = await setUpAndPlaceOrder(server.baseUrl);
      await admin.client.patch(`/api/v1/admin/orders/${order.id}/status`, { status: "confirmed" });
      await admin.client.patch(`/api/v1/admin/orders/${order.id}/status`, { status: "processing" });
      await admin.client.patch(`/api/v1/admin/orders/${order.id}/status`, { status: "completed" });

      const response = await buyer.client.post(`/api/v1/orders/${order.id}/cancel`, {});
      expect(response.status).toBe(409);
    });

    it("restores deducted inventory atomically when an order is cancelled", async () => {
      const { buyer, product, order } = await setUpAndPlaceOrder(server.baseUrl, {
        quantity: 2,
        stock: 10,
      });

      const beforeCancel = await prisma.inventoryItem.findFirst({ where: { sku: product.sku } });
      expect(beforeCancel?.quantity).toBe(8); // 10 - 2 deducted at placement

      const response = await buyer.client.post(`/api/v1/orders/${order.id}/cancel`, {});
      expect(response.status).toBe(200);

      const afterCancel = await prisma.inventoryItem.findFirst({ where: { sku: product.sku } });
      expect(afterCancel?.quantity).toBe(10);
    });

    it("never restores inventory twice, even when two cancellation requests race", async () => {
      const { buyer, product, order } = await setUpAndPlaceOrder(server.baseUrl, {
        quantity: 3,
        stock: 10,
      });

      const [first, second] = await Promise.all([
        buyer.client.post(`/api/v1/orders/${order.id}/cancel`, {}),
        buyer.client.post(`/api/v1/orders/${order.id}/cancel`, {}),
      ]);

      const successCount = [first, second].filter((response) => response.status === 200).length;
      expect(successCount).toBe(1);

      const inventory = await prisma.inventoryItem.findFirst({ where: { sku: product.sku } });
      expect(inventory?.quantity).toBe(10); // restored exactly once (7 + 3), never 13

      const history = await prisma.orderStatusHistory.findMany({
        where: { orderId: order.id, status: "cancelled" },
      });
      expect(history).toHaveLength(1);
    });

    it("rejects cancelling an already-cancelled order without restoring inventory again", async () => {
      const { buyer, product, order } = await setUpAndPlaceOrder(server.baseUrl, {
        quantity: 1,
        stock: 5,
      });

      const first = await buyer.client.post(`/api/v1/orders/${order.id}/cancel`, {});
      expect(first.status).toBe(200);
      const afterFirstCancel = await prisma.inventoryItem.findFirst({
        where: { sku: product.sku },
      });
      expect(afterFirstCancel?.quantity).toBe(5);

      const second = await buyer.client.post(`/api/v1/orders/${order.id}/cancel`, {});
      expect(second.status).toBe(409);

      const afterSecondCancel = await prisma.inventoryItem.findFirst({
        where: { sku: product.sku },
      });
      expect(afterSecondCancel?.quantity).toBe(5);
    });
  });
});
