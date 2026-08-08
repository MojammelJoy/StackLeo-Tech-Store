import { describe, expect, it, vi } from "vitest";

import { createTestAuthenticatedUser } from "../../../testing";
import {
  NOTIFICATION_CHANNELS,
  NOTIFICATION_PRIORITIES,
  NOTIFICATION_STATUSES,
  NOTIFICATION_TYPES,
} from "../constants";

import { NotificationService } from "./notification.service";

import type { AuthenticatedUser } from "../../../auth";
import type { NotificationRepository } from "../repository";
import type { Notification } from "../types";

function buildNotification(overrides: Partial<Notification> = {}): Notification {
  return {
    id: "notification-1",
    userId: "user-1",
    channel: NOTIFICATION_CHANNELS.IN_APP,
    type: NOTIFICATION_TYPES.SYSTEM,
    priority: NOTIFICATION_PRIORITIES.NORMAL,
    status: NOTIFICATION_STATUSES.DELIVERED,
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

function buildNotificationRepository(
  overrides: Partial<NotificationRepository> = {},
): NotificationRepository {
  return {
    findById: vi.fn().mockResolvedValue(null),
    findByUserId: vi.fn(),
    create: vi.fn(),
    markRead: vi.fn(),
    markUnread: vi.fn(),
    markAllRead: vi.fn(),
    softDelete: vi.fn(),
    restore: vi.fn(),
    countUnread: vi.fn(),
    ...overrides,
  };
}

const ACTOR: AuthenticatedUser = createTestAuthenticatedUser({ id: "user-1" });
const OTHER_ACTOR: AuthenticatedUser = createTestAuthenticatedUser({ id: "user-2" });

function buildService(overrides: Partial<NotificationRepository> = {}): NotificationService {
  return new NotificationService(buildNotificationRepository(overrides));
}

describe("NotificationService", () => {
  describe("create", () => {
    it("always creates an in-app notification owned by the actor", async () => {
      const create = vi.fn().mockResolvedValue(buildNotification());
      const service = buildService({ create });

      await service.create({ type: NOTIFICATION_TYPES.SYSTEM, body: "Thanks for joining!" }, ACTOR);

      expect(create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: "user-1",
          channel: NOTIFICATION_CHANNELS.IN_APP,
          recipient: "user-1",
        }),
      );
    });
  });

  describe("ownership", () => {
    it("reports a foreign notification as not found on getById", async () => {
      const service = buildService({
        findById: vi.fn().mockResolvedValue(buildNotification({ userId: "user-2" })),
      });

      await expect(service.getById("notification-1", ACTOR)).rejects.toThrow(/not found/i);
    });

    it("reports a foreign notification as not found on markRead", async () => {
      const service = buildService({
        findById: vi.fn().mockResolvedValue(buildNotification({ userId: "user-2" })),
      });

      await expect(service.markRead("notification-1", ACTOR)).rejects.toThrow(/not found/i);
    });

    it("allows the owner to read their own notification", async () => {
      const service = buildService({
        findById: vi.fn().mockResolvedValue(buildNotification({ userId: "user-1" })),
      });

      const result = await service.getById("notification-1", ACTOR);
      expect(result.id).toBe("notification-1");
    });
  });

  describe("read/unread", () => {
    it("marks a notification read", async () => {
      const markRead = vi
        .fn()
        .mockResolvedValue(buildNotification({ isRead: true, readAt: new Date("2026-01-02") }));
      const service = buildService({
        findById: vi.fn().mockResolvedValue(buildNotification()),
        markRead,
      });

      const result = await service.markRead("notification-1", ACTOR);
      expect(markRead).toHaveBeenCalledWith("notification-1");
      expect(result.isRead).toBe(true);
    });

    it("marks a notification unread", async () => {
      const markUnread = vi
        .fn()
        .mockResolvedValue(buildNotification({ isRead: false, readAt: null }));
      const service = buildService({
        findById: vi.fn().mockResolvedValue(buildNotification({ isRead: true })),
        markUnread,
      });

      const result = await service.markUnread("notification-1", ACTOR);
      expect(markUnread).toHaveBeenCalledWith("notification-1");
      expect(result.isRead).toBe(false);
    });

    it("marks all of the actor's notifications read", async () => {
      const markAllRead = vi.fn().mockResolvedValue(3);
      const service = buildService({ markAllRead });

      const result = await service.markAllRead(ACTOR);
      expect(markAllRead).toHaveBeenCalledWith("user-1");
      expect(result.updatedCount).toBe(3);
    });
  });

  describe("delete/restore", () => {
    it("rejects deleting someone else's notification", async () => {
      const service = buildService({
        findById: vi.fn().mockResolvedValue(buildNotification({ userId: "user-1" })),
      });

      await expect(service.delete("notification-1", OTHER_ACTOR)).rejects.toThrow(/not found/i);
    });

    it("rejects restoring a notification that is not deleted", async () => {
      const service = buildService({
        findById: vi.fn().mockResolvedValue(buildNotification({ deletedAt: null })),
      });

      await expect(service.restore("notification-1", ACTOR)).rejects.toThrow(/not deleted/i);
    });

    it("restores a soft-deleted notification", async () => {
      const deleted = buildNotification({ deletedAt: new Date("2026-01-02") });
      const restored = buildNotification({ deletedAt: null });
      const findById = vi.fn().mockResolvedValueOnce(deleted).mockResolvedValueOnce(restored);
      const restore = vi.fn().mockResolvedValue(undefined);
      const service = buildService({ findById, restore });

      const result = await service.restore("notification-1", ACTOR);
      expect(restore).toHaveBeenCalledWith("notification-1");
      expect(result.id).toBe("notification-1");
    });
  });

  describe("getUnreadCount", () => {
    it("returns the repository's efficient count", async () => {
      const countUnread = vi.fn().mockResolvedValue(7);
      const service = buildService({ countUnread });

      const result = await service.getUnreadCount(ACTOR);
      expect(countUnread).toHaveBeenCalledWith("user-1");
      expect(result.count).toBe(7);
    });
  });
});
