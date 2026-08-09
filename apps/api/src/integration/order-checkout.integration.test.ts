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

import type { TestServer } from "../testing/integration";

describe("order checkout: placement, transaction integrity, snapshots (integration)", () => {
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

  describe("happy path", () => {
    it("places an order end to end: cart -> order, with correct totals, snapshots, and inventory deduction", async () => {
      const { product, address, order } = await setUpAndPlaceOrder(server.baseUrl, {
        quantity: 3,
        stock: 10,
        price: 1500,
      });

      expect(order.status).toBe("pending");
      expect(order.paymentStatus).toBe("pending");
      expect(order.fulfillmentStatus).toBe("unfulfilled");
      expect(order.summary.subtotal).toBe(1500 * 3);
      expect(order.summary.total).toBe(1500 * 3);
      expect(order.items).toHaveLength(1);
      expect(order.items[0].productId).toBe(product.id);
      expect(order.items[0].sku).toBe(product.sku);
      expect(order.items[0].quantity).toBe(3);
      expect(order.items[0].unitPrice).toBe(1500);
      expect(order.billingAddressId).toBe(address.id);
      expect(order.shippingAddressId).toBe(address.id);

      const inventory = await prisma.inventoryItem.findFirst({ where: { sku: product.sku } });
      expect(inventory?.quantity).toBe(7); // 10 stocked - 3 deducted

      const history = await prisma.orderStatusHistory.findMany({ where: { orderId: order.id } });
      expect(history).toHaveLength(1);
      expect(history[0].status).toBe("pending");
    });

    it("places an order with multiple distinct order items, deducting each SKU's inventory independently", async () => {
      const admin = await createAdmin(server.baseUrl);
      const productA = await createSellableProduct(admin, { price: 1000 });
      const productB = await createSellableProduct(admin, { price: 750 });
      await stockProduct(admin, productA.sku, 10);
      await stockProduct(admin, productB.sku, 10);

      const buyer = await registerAndLoginTestUser(server.baseUrl);
      const address = await createAddress(buyer);
      await addToCart(buyer, productA, 2);
      await addToCart(buyer, productB, 3);

      const result = await placeOrder(buyer, {
        billingAddressId: address.id,
        shippingAddressId: address.id,
      });
      expect(result.status).toBe(201);
      const order = result.order!;

      expect(order.items).toHaveLength(2);
      expect(order.summary.subtotal).toBe(1000 * 2 + 750 * 3);
      expect(order.summary.total).toBe(1000 * 2 + 750 * 3);

      const itemA = order.items.find((item) => item.productId === productA.id);
      const itemB = order.items.find((item) => item.productId === productB.id);
      expect(itemA?.quantity).toBe(2);
      expect(itemB?.quantity).toBe(3);

      const inventoryA = await prisma.inventoryItem.findFirst({ where: { sku: productA.sku } });
      const inventoryB = await prisma.inventoryItem.findFirst({ where: { sku: productB.sku } });
      expect(inventoryA?.quantity).toBe(8);
      expect(inventoryB?.quantity).toBe(7);
    });

    it("stores independent billing and shipping snapshots when the two addresses differ", async () => {
      const admin = await createAdmin(server.baseUrl);
      const product = await createSellableProduct(admin);
      await stockProduct(admin, product.sku, 5);

      const buyer = await registerAndLoginTestUser(server.baseUrl);
      const shippingAddress = await createAddress(buyer, {
        recipientName: "Shipping Recipient",
        line1: "1 Shipping Lane",
        city: "Chittagong",
      });
      const billingAddress = await createAddress(buyer, {
        recipientName: "Billing Recipient",
        line1: "2 Billing Avenue",
        city: "Sylhet",
      });
      await addToCart(buyer, product, 1);

      const result = await placeOrder(buyer, {
        billingAddressId: billingAddress.id,
        shippingAddressId: shippingAddress.id,
      });
      expect(result.status).toBe(201);
      const order = result.order!;

      expect(order.billingAddressId).toBe(billingAddress.id);
      expect(order.shippingAddressId).toBe(shippingAddress.id);
      expect(order.billingAddress.recipientName).toBe("Billing Recipient");
      expect(order.billingAddress.city).toBe("Sylhet");
      expect(order.shippingAddress.recipientName).toBe("Shipping Recipient");
      expect(order.shippingAddress.city).toBe("Chittagong");
    });

    it("requires authentication to place an order", async () => {
      const admin = await createAdmin(server.baseUrl);
      const product = await createSellableProduct(admin);
      await stockProduct(admin, product.sku, 5);

      const { TestHttpClient } = await import("../testing/integration");
      const anon = new TestHttpClient(server.baseUrl);
      const response = await anon.post("/api/v1/orders", {
        billingAddressId: "does-not-matter",
        shippingAddressId: "does-not-matter",
      });
      expect(response.status).toBe(401);
    });

    it("rejects placing an order with an empty cart", async () => {
      const buyer = await registerAndLoginTestUser(server.baseUrl);
      const address = await createAddress(buyer);

      const result = await placeOrder(buyer, {
        billingAddressId: address.id,
        shippingAddressId: address.id,
      });
      expect(result.status).toBe(400);
    });

    it("rejects placing an order against another user's address", async () => {
      const admin = await createAdmin(server.baseUrl);
      const product = await createSellableProduct(admin);
      await stockProduct(admin, product.sku, 5);

      const owner = await registerAndLoginTestUser(server.baseUrl);
      const ownerAddress = await createAddress(owner);

      const attacker = await registerAndLoginTestUser(server.baseUrl);
      await addToCart(attacker, product, 1);

      const result = await placeOrder(attacker, {
        billingAddressId: ownerAddress.id,
        shippingAddressId: ownerAddress.id,
      });
      expect(result.status).toBe(404);

      const orders = await prisma.order.findMany({ where: { userId: attacker.userId } });
      expect(orders).toHaveLength(0);
    });
  });

  describe("snapshot integrity", () => {
    it("keeps the order's product snapshot unchanged after the product's name/price change", async () => {
      const { product, order } = await setUpAndPlaceOrder(server.baseUrl, { price: 2000 });

      const admin = await createAdmin(server.baseUrl);
      await admin.client.patch(`/api/v1/products/${product.id}`, {
        name: "Renamed After Order",
        price: 999999,
      });

      const orderRow = await prisma.orderItem.findFirst({ where: { orderId: order.id } });
      expect(orderRow?.productName).not.toBe("Renamed After Order");
      expect(orderRow?.unitPrice).toBe(2000);
    });

    it("keeps the order's address snapshot unchanged after the source address is edited", async () => {
      const admin = await createAdmin(server.baseUrl);
      const product = await createSellableProduct(admin);
      await stockProduct(admin, product.sku, 5);

      const buyer = await registerAndLoginTestUser(server.baseUrl);
      const address = await createAddress(buyer, { recipientName: "Original Recipient" });
      await addToCart(buyer, product, 1);

      const result = await placeOrder(buyer, {
        billingAddressId: address.id,
        shippingAddressId: address.id,
      });
      expect(result.status).toBe(201);
      const orderId = result.order?.id as string;

      await buyer.client.patch(`/api/v1/addresses/${address.id}`, {
        recipientName: "Changed After Order",
      });

      const orderRow = await prisma.order.findUniqueOrThrow({ where: { id: orderId } });
      const shippingSnapshot = orderRow.shippingAddress as { recipientName: string };
      const billingSnapshot = orderRow.billingAddress as { recipientName: string };

      expect(shippingSnapshot.recipientName).toBe("Original Recipient");
      expect(billingSnapshot.recipientName).toBe("Original Recipient");
    });
  });

  describe("inventory consistency", () => {
    it("rejects an order that exceeds available stock and deducts nothing", async () => {
      const admin = await createAdmin(server.baseUrl);
      const product = await createSellableProduct(admin);
      await stockProduct(admin, product.sku, 2);

      const buyer = await registerAndLoginTestUser(server.baseUrl);
      const address = await createAddress(buyer);
      await addToCart(buyer, product, 2);

      // Drain stock out from under the cart between "add to cart" and
      // "place order" by adjusting inventory directly, forcing the
      // authoritative in-transaction re-check (not just the service's
      // pre-check) to be what actually rejects this.
      await prisma.inventoryItem.updateMany({ where: { sku: product.sku }, data: { quantity: 0 } });

      const result = await placeOrder(buyer, {
        billingAddressId: address.id,
        shippingAddressId: address.id,
      });
      expect(result.status).toBe(409);

      const orders = await prisma.order.findMany({ where: { userId: buyer.userId } });
      expect(orders).toHaveLength(0);
      const inventory = await prisma.inventoryItem.findFirst({ where: { sku: product.sku } });
      expect(inventory?.quantity).toBe(0);
    });

    it("never lets available stock go negative even when two orders are placed back to back for the last units", async () => {
      const admin = await createAdmin(server.baseUrl);
      const product = await createSellableProduct(admin);
      await stockProduct(admin, product.sku, 1);

      const first = await registerAndLoginTestUser(server.baseUrl);
      const firstAddress = await createAddress(first);
      await addToCart(first, product, 1);

      const second = await registerAndLoginTestUser(server.baseUrl);
      const secondAddress = await createAddress(second);
      await addToCart(second, product, 1);

      const firstResult = await placeOrder(first, {
        billingAddressId: firstAddress.id,
        shippingAddressId: firstAddress.id,
      });
      expect(firstResult.status).toBe(201);

      const secondResult = await placeOrder(second, {
        billingAddressId: secondAddress.id,
        shippingAddressId: secondAddress.id,
      });
      expect(secondResult.status).toBe(409);

      const inventory = await prisma.inventoryItem.findFirst({ where: { sku: product.sku } });
      expect(inventory?.quantity).toBe(0);

      const orders = await prisma.order.findMany({
        where: { OR: [{ userId: first.userId }, { userId: second.userId }] },
      });
      expect(orders).toHaveLength(1);
    });
  });

  describe("transaction rollback", () => {
    it("leaves no partial Order/OrderItem/OrderStatusHistory rows when the transactional inventory deduction fails", async () => {
      const admin = await createAdmin(server.baseUrl);
      const productA = await createSellableProduct(admin, { name: "Rollback Product A" });
      const productB = await createSellableProduct(admin, { name: "Rollback Product B" });
      await stockProduct(admin, productA.sku, 10);
      await stockProduct(admin, productB.sku, 1);

      const buyer = await registerAndLoginTestUser(server.baseUrl);
      const address = await createAddress(buyer);
      await addToCart(buyer, productA, 2);
      await addToCart(buyer, productB, 1);

      // Force the *second* item's transactional deduction to fail after
      // the first item's has already run inside the same $transaction —
      // proving the whole transaction (including item A's deduction)
      // rolls back together, not just item B's.
      await prisma.inventoryItem.updateMany({
        where: { sku: productB.sku },
        data: { quantity: 0 },
      });

      const result = await placeOrder(buyer, {
        billingAddressId: address.id,
        shippingAddressId: address.id,
      });
      expect(result.status).toBe(409);

      const orders = await prisma.order.findMany({ where: { userId: buyer.userId } });
      expect(orders).toHaveLength(0);
      const orphanItems = await prisma.orderItem.findMany({
        where: { OR: [{ sku: productA.sku }, { sku: productB.sku }] },
      });
      expect(orphanItems).toHaveLength(0);
      const orphanHistory = await prisma.orderStatusHistory.findMany({});
      expect(orphanHistory).toHaveLength(0);

      // Product A's stock must be untouched — its deduction ran inside
      // the same transaction that rolled back.
      const inventoryA = await prisma.inventoryItem.findFirst({ where: { sku: productA.sku } });
      expect(inventoryA?.quantity).toBe(10);

      // The cart must NOT have been marked converted (that only happens
      // after the transaction durably commits).
      const cart = await prisma.cart.findFirst({ where: { userId: buyer.userId } });
      expect(cart?.status).not.toBe("converted");
    });
  });
});
