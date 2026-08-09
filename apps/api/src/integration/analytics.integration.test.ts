import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

import { prisma } from "../database";
import { registerAndLoginTestUser, resetDatabase, startTestServer } from "../testing/integration";

import {
  addToCart,
  createAddress,
  createAdmin,
  createSellableProduct,
  placeOrder,
  stockProduct,
} from "./fixtures";

import type { TestServer } from "../testing/integration";

describe("analytics (integration)", () => {
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

  async function seedActivity(): Promise<{
    admin: Awaited<ReturnType<typeof createAdmin>>;
    orderId: string;
    orderTotal: number;
  }> {
    const admin = await createAdmin(server.baseUrl);
    const product = await createSellableProduct(admin, { price: 3000 });
    await stockProduct(admin, product.sku, 20);

    const buyer = await registerAndLoginTestUser(server.baseUrl);
    const address = await createAddress(buyer);
    await addToCart(buyer, product, 2);
    const result = await placeOrder(buyer, {
      billingAddressId: address.id,
      shippingAddressId: address.id,
    });
    if (result.status !== 201 || !result.order) {
      throw new Error(`Failed to seed order: ${JSON.stringify(result.rawBody)}`);
    }

    const payment = await buyer.client.post<{ data: { payment: { id: string } } }>(
      "/api/v1/payments",
      {
        orderId: result.order.id,
        method: "cash_on_delivery",
        provider: "manual",
        amount: result.order.summary.total,
        currency: result.order.summary.currency,
      },
    );
    await buyer.client.post(`/api/v1/payments/${payment.body.data.payment.id}/collect`);

    return { admin, orderId: result.order.id, orderTotal: result.order.summary.total };
  }

  it("reflects real seeded order/sales activity in the dashboard and sales summary", async () => {
    const { admin, orderTotal } = await seedActivity();

    const dashboard = await admin.client.get<{
      data: { kpis: Array<{ key: string; value: number }> };
    }>("/api/v1/analytics/dashboard");
    expect(dashboard.status).toBe(200);
    const orderCountKpi = dashboard.body.data.kpis.find((kpi) => kpi.key === "orderCount");
    expect(orderCountKpi?.value).toBeGreaterThanOrEqual(1);

    const sales = await admin.client.get<{
      data: { summary: { orderCount: number; totalSales: number } };
    }>("/api/v1/analytics/sales/summary");
    expect(sales.status).toBe(200);
    expect(sales.body.data.summary.orderCount).toBeGreaterThanOrEqual(1);
    expect(sales.body.data.summary.totalSales).toBeGreaterThanOrEqual(orderTotal);
  });

  it("reflects real payment activity in the payment summary", async () => {
    await seedActivity();
    const admin = await createAdmin(server.baseUrl); // fresh admin session, same DB state

    const summary = await admin.client.get<{
      data: { summary: { successfulCount: number } };
    }>("/api/v1/analytics/payments/summary");
    expect(summary.status).toBe(200);
    expect(summary.body.data.summary.successfulCount).toBeGreaterThanOrEqual(1);
  });

  it("reflects real order status distribution", async () => {
    const { admin, orderId } = await seedActivity();
    await admin.client.patch(`/api/v1/admin/orders/${orderId}/status`, { status: "confirmed" });

    const distribution = await admin.client.get<{
      data: { distribution: Array<{ status: string; count: number }> };
    }>("/api/v1/analytics/orders/status-distribution");
    expect(distribution.status).toBe(200);
    const confirmed = distribution.body.data.distribution.find(
      (entry) => entry.status === "confirmed",
    );
    expect(confirmed?.count).toBeGreaterThanOrEqual(1);
  });

  it("never mutates business data when queried (read-only guarantee)", async () => {
    const { admin, orderId } = await seedActivity();
    const before = await prisma.order.findUniqueOrThrow({ where: { id: orderId } });

    await admin.client.get("/api/v1/analytics/dashboard");
    await admin.client.get("/api/v1/analytics/sales/summary");
    await admin.client.get("/api/v1/analytics/revenue/summary");
    await admin.client.get("/api/v1/analytics/comparison?domain=sales");

    const after = await prisma.order.findUniqueOrThrow({ where: { id: orderId } });
    expect(after).toEqual(before);

    const orderCount = await prisma.order.count();
    expect(orderCount).toBe(1);
  });

  it("blocks a plain member from every analytics endpoint", async () => {
    const { client } = await registerAndLoginTestUser(server.baseUrl);
    const endpoints = [
      "/api/v1/analytics/dashboard",
      "/api/v1/analytics/sales/summary",
      "/api/v1/analytics/products/top",
      "/api/v1/analytics/customers/summary",
    ];
    for (const endpoint of endpoints) {
      const response = await client.get(endpoint);
      expect(response.status).toBe(403);
    }
  });
});
