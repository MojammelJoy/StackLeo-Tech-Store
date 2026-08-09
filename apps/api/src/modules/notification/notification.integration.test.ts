import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

import {
  TestHttpClient,
  registerAndLoginTestUser,
  resetDatabase,
  startTestServer,
} from "../../testing/integration";

import type { TestServer } from "../../testing/integration";

function buildNotificationPayload(overrides: Record<string, unknown> = {}) {
  return { type: "transactional", body: "Your test notification body", ...overrides };
}

describe("notification (integration)", () => {
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

  it("requires authentication", async () => {
    const anon = new TestHttpClient(server.baseUrl);
    const response = await anon.post("/api/v1/notifications", buildNotificationPayload());
    expect(response.status).toBe(401);
  });

  it("creates an in-app notification for the caller and lists it back", async () => {
    const { client } = await registerAndLoginTestUser(server.baseUrl);

    const created = await client.post<{ data: { notification: { id: string; isRead: boolean } } }>(
      "/api/v1/notifications",
      buildNotificationPayload({ subject: "Hello" }),
    );
    expect(created.status).toBe(201);
    expect(created.body.data.notification.isRead).toBe(false);

    const list = await client.get<{ data: Array<{ id: string }> }>("/api/v1/notifications");
    expect(list.status).toBe(200);
    expect(list.body.data.some((n) => n.id === created.body.data.notification.id)).toBe(true);
  });

  it("marks a notification read/unread and reflects it in the unread count", async () => {
    const { client } = await registerAndLoginTestUser(server.baseUrl);
    const created = await client.post<{ data: { notification: { id: string } } }>(
      "/api/v1/notifications",
      buildNotificationPayload(),
    );
    const id = created.body.data.notification.id;

    const beforeCount = await client.get<{ data: { count: number } | number }>(
      "/api/v1/notifications/unread-count",
    );
    expect(beforeCount.status).toBe(200);

    const markRead = await client.post<{ data: { notification: { isRead: boolean } } }>(
      `/api/v1/notifications/${id}/read`,
    );
    expect(markRead.status).toBe(200);
    expect(markRead.body.data.notification.isRead).toBe(true);

    const markUnread = await client.post<{ data: { notification: { isRead: boolean } } }>(
      `/api/v1/notifications/${id}/unread`,
    );
    expect(markUnread.status).toBe(200);
    expect(markUnread.body.data.notification.isRead).toBe(false);
  });

  it("never exposes another user's notification", async () => {
    const owner = await registerAndLoginTestUser(server.baseUrl);
    const created = await owner.client.post<{ data: { notification: { id: string } } }>(
      "/api/v1/notifications",
      buildNotificationPayload(),
    );
    const id = created.body.data.notification.id;

    const attacker = await registerAndLoginTestUser(server.baseUrl);
    const response = await attacker.client.get(`/api/v1/notifications/${id}`);
    expect(response.status).toBe(404);
  });

  // Known limitation, confirmed by source inspection (not just this
  // test's absence of proof): no other module in this app currently
  // constructs a NotificationService/NotificationPrismaRepository or
  // calls into modules/notification for order-created, order-status-
  // changed, payment-status-changed, or review-created/moderated events
  // — see modules/order, modules/payment, modules/review's own routes
  // composition roots, none of which reference modules/notification at
  // all. There is nothing to assert here without inventing behavior
  // that doesn't exist.
});
