import { describe, expect, it, vi } from "vitest";

import { AdminNotificationService } from "./admin-notification.service";

import type { Notification } from "../../notification";
import type { AdminNotificationRepository } from "../repository";

function buildNotification(overrides: Partial<Notification> = {}): Notification {
  return {
    id: "notification-1",
    userId: "user-1",
    channel: "in_app",
    type: "system",
    priority: "normal",
    status: "delivered",
    templateKey: null,
    subject: "Welcome",
    body: "Thanks for joining!",
    recipient: "user-1",
    metadata: null,
    isRead: false,
    readAt: null,
    scheduledAt: null,
    sentAt: null,
    deliveredAt: new Date("2026-01-01"),
    failedAt: null,
    errorMessage: null,
    retryCount: 0,
    maxRetries: 0,
    nextRetryAt: null,
    deletedAt: null,
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
    ...overrides,
  };
}

function buildRepository(
  overrides: Partial<AdminNotificationRepository> = {},
): AdminNotificationRepository {
  return {
    findAll: vi.fn().mockResolvedValue({ items: [], meta: {} }),
    findById: vi.fn().mockResolvedValue(null),
    countUnread: vi.fn().mockResolvedValue(0),
    ...overrides,
  };
}

describe("AdminNotificationService", () => {
  it("lists across every user (no ownership scoping)", async () => {
    const findAll = vi.fn().mockResolvedValue({ items: [buildNotification()], meta: {} });
    const service = new AdminNotificationService(buildRepository({ findAll }));

    const result = await service.list({ pagination: {}, sort: [], filters: {} } as never, {});
    expect(result.items).toHaveLength(1);
  });

  it("finds any notification regardless of owner", async () => {
    const service = new AdminNotificationService(
      buildRepository({
        findById: vi.fn().mockResolvedValue(buildNotification({ userId: "someone-else" })),
      }),
    );

    const result = await service.getById("notification-1");
    expect(result.id).toBe("notification-1");
  });

  it("throws when the notification does not exist", async () => {
    const service = new AdminNotificationService(buildRepository());
    await expect(service.getById("missing")).rejects.toThrow(/not found/i);
  });

  it("returns the operational unread-count summary", async () => {
    const service = new AdminNotificationService(
      buildRepository({ countUnread: vi.fn().mockResolvedValue(42) }),
    );

    const result = await service.getSummary();
    expect(result.unreadCount).toBe(42);
  });
});
