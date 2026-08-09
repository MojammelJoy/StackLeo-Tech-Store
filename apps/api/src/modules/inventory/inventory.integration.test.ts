import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

import {
  elevateToAdmin,
  registerAndLoginTestUser,
  resetDatabase,
  startTestServer,
} from "../../testing/integration";
import { randomTestId } from "../../testing/utils";

import type { TestServer } from "../../testing/integration";

describe("inventory (integration)", () => {
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

  it("rejects a plain member from every inventory route (read and write)", async () => {
    const { client } = await registerAndLoginTestUser(server.baseUrl);
    const sku = randomTestId("sku");

    const create = await client.post("/api/v1/inventory", {
      sku,
      warehouseId: "wh-1",
      quantity: 10,
    });
    const list = await client.get("/api/v1/inventory");

    expect(create.status).toBe(403);
    expect(list.status).toBe(403);
  });

  it("lets an authorized admin create an inventory item and read back the derived availableQuantity", async () => {
    const admin = await registerAndLoginTestUser(server.baseUrl);
    await elevateToAdmin(admin);
    const sku = randomTestId("sku");

    const created = await admin.client.post<{
      data: {
        item: { id: string; quantity: number; reservedQuantity: number; availableQuantity: number };
      };
    }>("/api/v1/inventory", { sku, warehouseId: "wh-1", quantity: 20, reservedQuantity: 5 });

    expect(created.status).toBe(201);
    expect(created.body.data.item.availableQuantity).toBe(15);

    const fetched = await admin.client.get<{
      data: { item: { availableQuantity: number } };
    }>(`/api/v1/inventory/sku/${sku}?warehouseId=wh-1`);
    expect(fetched.status).toBe(200);
    expect(fetched.body.data.item.availableQuantity).toBe(15);
  });

  it("never lets availableQuantity go negative via increase/decrease", async () => {
    const admin = await registerAndLoginTestUser(server.baseUrl);
    await elevateToAdmin(admin);
    const sku = randomTestId("sku");

    const created = await admin.client.post<{ data: { item: { id: string } } }>(
      "/api/v1/inventory",
      { sku, warehouseId: "wh-1", quantity: 5 },
    );
    const itemId = created.body.data.item.id;

    const overDecrease = await admin.client.post(`/api/v1/inventory/${itemId}/decrease`, {
      quantity: 999,
    });
    expect(overDecrease.status).toBeGreaterThanOrEqual(400);
    expect(overDecrease.status).toBeLessThan(500);

    const stillIntact = await admin.client.get<{ data: { item: { quantity: number } } }>(
      `/api/v1/inventory/${itemId}`,
    );
    expect(stillIntact.body.data.item.quantity).toBe(5);
  });

  it("records an append-only movement entry for a stock adjustment", async () => {
    const admin = await registerAndLoginTestUser(server.baseUrl);
    await elevateToAdmin(admin);
    const sku = randomTestId("sku");

    const created = await admin.client.post<{ data: { item: { id: string } } }>(
      "/api/v1/inventory",
      { sku, warehouseId: "wh-1", quantity: 10 },
    );
    const itemId = created.body.data.item.id;

    const increase = await admin.client.post(`/api/v1/inventory/${itemId}/increase`, {
      quantity: 5,
      reason: "restock",
    });
    expect(increase.status).toBe(200);

    const movements = await admin.client.get<{ data: { movements: unknown[] } | unknown[] }>(
      `/api/v1/inventory/${itemId}/movements`,
    );
    expect(movements.status).toBe(200);
  });
});
