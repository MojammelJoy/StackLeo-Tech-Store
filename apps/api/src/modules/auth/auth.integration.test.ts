import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

import {
  TEST_USER_PASSWORD,
  TestHttpClient,
  elevateToAdmin,
  registerAndLoginTestUser,
  resetDatabase,
  startTestServer,
} from "../../testing/integration";
import { randomTestEmail } from "../../testing/utils";

import type { TestServer } from "../../testing/integration";

describe("auth + RBAC (integration)", () => {
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

  describe("registration + login", () => {
    it("registers a new user and returns 201 with the created user", async () => {
      const client = new TestHttpClient(server.baseUrl);
      const email = randomTestEmail();

      const response = await client.post<{ data: { user: { id: string; email: string } } }>(
        "/api/v1/auth/register",
        { email, password: TEST_USER_PASSWORD },
      );

      expect(response.status).toBe(201);
      expect(response.body.data.user.email).toBe(email);
      expect(response.body.data.user.id).toBeTruthy();
    });

    it("rejects registering the same email twice", async () => {
      const email = randomTestEmail();
      const client = new TestHttpClient(server.baseUrl);
      await client.post("/api/v1/auth/register", { email, password: TEST_USER_PASSWORD });

      const second = await client.post("/api/v1/auth/register", {
        email,
        password: TEST_USER_PASSWORD,
      });

      expect(second.status).toBeGreaterThanOrEqual(400);
      expect(second.status).toBeLessThan(500);
    });

    it("logs in and can access a protected endpoint via the issued cookie", async () => {
      const { client } = await registerAndLoginTestUser(server.baseUrl);
      const me = await client.get<{ data: { user: { id: string } } }>("/api/v1/auth/me");
      expect(me.status).toBe(200);
      expect(me.body.data.user.id).toBeTruthy();
    });

    it("rejects login with the wrong password", async () => {
      const email = randomTestEmail();
      const client = new TestHttpClient(server.baseUrl);
      await client.post("/api/v1/auth/register", { email, password: TEST_USER_PASSWORD });

      const login = await client.post("/api/v1/auth/login", {
        email,
        password: "definitely-the-wrong-password",
      });
      expect(login.status).toBe(401);
    });
  });

  describe("protected endpoint access", () => {
    it("rejects a request with no auth token at all", async () => {
      const client = new TestHttpClient(server.baseUrl);
      const response = await client.get("/api/v1/auth/me");
      expect(response.status).toBe(401);
    });

    it("rejects a request with an invalid/forged token", async () => {
      const client = new TestHttpClient(server.baseUrl);
      client.setCookie("access_token", "not-a-real-jwt");
      const response = await client.get("/api/v1/auth/me");
      expect(response.status).toBe(401);
    });
  });

  describe("refresh + logout", () => {
    it("rotates the session via /refresh", async () => {
      const { client } = await registerAndLoginTestUser(server.baseUrl);
      const refresh = await client.post("/api/v1/auth/refresh");
      expect(refresh.status).toBe(200);

      const me = await client.get("/api/v1/auth/me");
      expect(me.status).toBe(200);
    });

    it("revokes the session on logout, so a subsequent refresh fails", async () => {
      const { client } = await registerAndLoginTestUser(server.baseUrl);

      const logout = await client.post("/api/v1/auth/logout");
      expect(logout.status).toBe(200);

      const refreshAfterLogout = await client.post("/api/v1/auth/refresh");
      expect(refreshAfterLogout.status).toBe(401);
    });
  });

  describe("RBAC — permission-based, not role-name checks", () => {
    it("blocks a plain member from the admin order list", async () => {
      const { client } = await registerAndLoginTestUser(server.baseUrl);
      const response = await client.get("/api/v1/admin/orders");
      expect(response.status).toBe(403);
    });

    it("blocks a plain member from the analytics dashboard", async () => {
      const { client } = await registerAndLoginTestUser(server.baseUrl);
      const response = await client.get("/api/v1/analytics/dashboard");
      expect(response.status).toBe(403);
    });

    it("blocks a plain member from review moderation", async () => {
      const { client } = await registerAndLoginTestUser(server.baseUrl);
      const response = await client.get("/api/v1/admin/reviews");
      expect(response.status).toBe(403);
    });

    it("blocks a plain member from adjusting inventory", async () => {
      const { client } = await registerAndLoginTestUser(server.baseUrl);
      const response = await client.post("/api/v1/inventory", {
        sku: "TEST-SKU-1",
        warehouseId: "wh-1",
        quantity: 10,
      });
      expect(response.status).toBe(403);
    });

    it("allows an admin (holding the right permissions) through to the same endpoints", async () => {
      const user = await registerAndLoginTestUser(server.baseUrl);
      await elevateToAdmin(user);

      const orders = await user.client.get("/api/v1/admin/orders");
      const dashboard = await user.client.get("/api/v1/analytics/dashboard");

      expect(orders.status).not.toBe(401);
      expect(orders.status).not.toBe(403);
      expect(dashboard.status).not.toBe(401);
      expect(dashboard.status).not.toBe(403);
    });
  });
});
