import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

import {
  TestHttpClient,
  registerAndLoginTestUser,
  resetDatabase,
  startTestServer,
} from "../../testing/integration";

import type { TestServer } from "../../testing/integration";

function buildAddressPayload(overrides: Record<string, unknown> = {}) {
  return {
    type: "shipping",
    recipientName: "Jane Doe",
    phone: "+8801700000000",
    line1: "123 Main St",
    city: "Dhaka",
    division: "Dhaka",
    postalCode: "1207",
    country: "BD",
    ...overrides,
  };
}

describe("address (integration)", () => {
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

  it("requires authentication to create an address", async () => {
    const anon = new TestHttpClient(server.baseUrl);
    const response = await anon.post("/api/v1/addresses", buildAddressPayload());
    expect(response.status).toBe(401);
  });

  it("creates an address and the same caller can immediately read it back (ownership round-trip)", async () => {
    const { client } = await registerAndLoginTestUser(server.baseUrl);

    const response = await client.post<{
      data: { address: { id: string; recipientName: string } };
    }>("/api/v1/addresses", buildAddressPayload());
    expect(response.status).toBe(201);
    expect(response.body.data.address.id).toBeTruthy();
    // `userId` is deliberately not part of the public AddressResponseDto
    // (see `dto/address-response.dto.ts`) — ownership is proven instead
    // by the same caller being able to read it straight back.

    const fetched = await client.get<{ data: { address: { recipientName: string } } }>(
      `/api/v1/addresses/${response.body.data.address.id}`,
    );
    expect(fetched.status).toBe(200);
    expect(fetched.body.data.address.recipientName).toBe("Jane Doe");
  });

  it("retrieves, updates, and soft-deletes the caller's own address", async () => {
    const { client } = await registerAndLoginTestUser(server.baseUrl);
    const created = await client.post<{ data: { address: { id: string } } }>(
      "/api/v1/addresses",
      buildAddressPayload(),
    );
    const addressId = created.body.data.address.id;

    const fetched = await client.get<{ data: { address: { recipientName: string } } }>(
      `/api/v1/addresses/${addressId}`,
    );
    expect(fetched.status).toBe(200);
    expect(fetched.body.data.address.recipientName).toBe("Jane Doe");

    const updated = await client.patch<{ data: { address: { recipientName: string } } }>(
      `/api/v1/addresses/${addressId}`,
      { recipientName: "Jane Updated" },
    );
    expect(updated.status).toBe(200);
    expect(updated.body.data.address.recipientName).toBe("Jane Updated");

    const deleted = await client.delete(`/api/v1/addresses/${addressId}`);
    expect(deleted.status).toBe(200);

    const afterDelete = await client.get(`/api/v1/addresses/${addressId}`);
    expect(afterDelete.status).toBe(404);
  });

  it("never exposes another user's address (404, not 403 — ownership is never confirmed)", async () => {
    const owner = await registerAndLoginTestUser(server.baseUrl);
    const created = await owner.client.post<{ data: { address: { id: string } } }>(
      "/api/v1/addresses",
      buildAddressPayload(),
    );
    const addressId = created.body.data.address.id;

    const attacker = await registerAndLoginTestUser(server.baseUrl);
    const getAttempt = await attacker.client.get(`/api/v1/addresses/${addressId}`);
    const updateAttempt = await attacker.client.patch(`/api/v1/addresses/${addressId}`, {
      recipientName: "Hijacked",
    });
    const deleteAttempt = await attacker.client.delete(`/api/v1/addresses/${addressId}`);

    expect(getAttempt.status).toBe(404);
    expect(updateAttempt.status).toBe(404);
    expect(deleteAttempt.status).toBe(404);
  });

  // Address mutation NOT mutating a previously-placed order's frozen
  // snapshot is asserted in `src/integration/order-checkout.integration.test.ts`
  // ("Snapshot integrity"), where an actual order exists to check against.
});
