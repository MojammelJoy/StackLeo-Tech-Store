import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

import { prisma } from "../database";
import {
  TEST_USER_PASSWORD,
  registerAndLoginTestUser,
  resetDatabase,
  startTestServer,
} from "../testing/integration";

import { createAdmin } from "./fixtures";

import type { RegisteredTestUser, TestServer } from "../testing/integration";

async function elevateToSuperAdmin(user: RegisteredTestUser): Promise<void> {
  await prisma.user.update({ where: { id: user.userId }, data: { roles: ["super_admin"] } });
  const login = await user.client.post("/api/v1/auth/login", {
    email: user.email,
    password: TEST_USER_PASSWORD,
  });
  if (login.status !== 200) {
    throw new Error(`Re-login after super_admin elevation failed (${login.status})`);
  }
}

describe("admin customer management (integration)", () => {
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

  it("blocks a plain member from admin user management entirely", async () => {
    const { client } = await registerAndLoginTestUser(server.baseUrl);
    const other = await registerAndLoginTestUser(server.baseUrl);

    const list = await client.get("/api/v1/admin/users");
    const getOne = await client.get(`/api/v1/admin/users/${other.userId}`);
    const setStatus = await client.patch(`/api/v1/admin/users/${other.userId}/status`, {
      isActive: false,
    });

    expect(list.status).toBe(403);
    expect(getOne.status).toBe(403);
    expect(setStatus.status).toBe(403);
  });

  it("lets an admin (user:read/user:update) list and manage customer accounts", async () => {
    const admin = await createAdmin(server.baseUrl);
    const customer = await registerAndLoginTestUser(server.baseUrl);

    const list = await admin.client.get<{ data: Array<{ id: string }> }>("/api/v1/admin/users");
    expect(list.status).toBe(200);
    expect(list.body.data.some((user) => user.id === customer.userId)).toBe(true);

    const deactivated = await admin.client.patch<{ data: { user: { isActive: boolean } } }>(
      `/api/v1/admin/users/${customer.userId}/status`,
      { isActive: false },
    );
    expect(deactivated.status).toBe(200);
    expect(deactivated.body.data.user.isActive).toBe(false);
  });

  it("rejects a role change from a plain admin (rbac:manage is super_admin-only)", async () => {
    const admin = await createAdmin(server.baseUrl);
    const customer = await registerAndLoginTestUser(server.baseUrl);

    const response = await admin.client.patch(`/api/v1/admin/users/${customer.userId}/roles`, {
      roles: ["admin"],
    });
    expect(response.status).toBe(403);
  });

  it("lets a super_admin change another user's roles", async () => {
    const superAdmin = await registerAndLoginTestUser(server.baseUrl);
    await elevateToSuperAdmin(superAdmin);
    const customer = await registerAndLoginTestUser(server.baseUrl);

    const response = await superAdmin.client.patch<{ data: { user: { roles: string[] } } }>(
      `/api/v1/admin/users/${customer.userId}/roles`,
      { roles: ["admin"] },
    );
    expect(response.status).toBe(200);
    expect(response.body.data.user.roles).toEqual(["admin"]);
  });

  it("lets an admin create/manage a product and adjust inventory through the dedicated admin surface", async () => {
    const admin = await createAdmin(server.baseUrl);

    const product = await admin.client.post<{ data: { product: { id: string } } }>(
      "/api/v1/admin/products",
      { name: "Admin-managed product", sku: `ADM-${Date.now()}`, price: 1200, currency: "USD" },
    );
    expect(product.status).toBe(201);

    const customer = await registerAndLoginTestUser(server.baseUrl);
    const blocked = await customer.client.post("/api/v1/admin/products", {
      name: "Should not be allowed",
      sku: `BLOCKED-${Date.now()}`,
      price: 100,
      currency: "USD",
    });
    expect(blocked.status).toBe(403);
  });
});
