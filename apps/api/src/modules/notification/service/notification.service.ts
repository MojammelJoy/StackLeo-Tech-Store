import { ConflictError, NotFoundError } from "../../../errors";
import { logger } from "../../../logger";
import { NOTIFICATION_CHANNELS } from "../constants";
import { notificationMapper } from "../mapper";

import type { AuthenticatedUser } from "../../../auth";
import type { PaginatedResult, ParsedQuery } from "../../../common";
import type {
  CreateInAppNotificationDto,
  MarkAllReadResponseDto,
  NotificationResponseDto,
  UnreadCountResponseDto,
} from "../dto";
import type { NotificationFilterOptions } from "../interfaces";
import type { NotificationLookupOptions, NotificationRepository } from "../repository";
import type { Notification } from "../types";

/**
 * Implements every Notification API operation: creation, self-service
 * listing/lookup, read/unread state, soft delete + restore, and an
 * efficient unread count — all ownership-enforced, and all scoped to
 * in-app notification *records*, never their delivery.
 *
 * This module's foundation ships extensive multi-channel delivery
 * infrastructure — `providers/` (Resend/SendGrid, Twilio, Firebase
 * skeletons), `templates/` (rendering), `events/` (event-driven
 * dispatch), and the `emailProviders`/`smsProviders`/`pushProviders`
 * registries the skeleton service constructor took. None of it is
 * wired in here: this API's constraints explicitly exclude email/SMS/
 * push/WebSocket delivery, Firebase, third-party notification services,
 * background job processing, and Redis-based queues — "the API should
 * manage notification records and state only". Every notification this
 * service creates is `NOTIFICATION_CHANNELS.IN_APP`, which needs no
 * provider at all: the record's existence *is* its delivery. Keeping
 * `channel`/`templateKey`/`scheduledAt`/`retryCount`/`maxRetries`/
 * `nextRetryAt` intact on the domain type and schema (just unused by
 * this service's own write paths) is what "keep notification delivery
 * provider-independent so email, SMS, push, or WebSocket delivery can
 * be added later without changing the core notification domain" means
 * in practice — a future delivery module extends this one, it doesn't
 * need to reshape it.
 *
 * Every method takes a real `actor: AuthenticatedUser` — this module is
 * authenticated-users-only end to end, mirroring `modules/payment`'s "no
 * guest/public path at all". `getOwnedNotification` is this module's
 * ownership enforcement hook, called before every read or mutation of a
 * specific notification: one whose `userId` doesn't match `actor.id` is
 * reported as `NotFoundError`, never `ForbiddenError`, so a request
 * never confirms another user's notification even exists — the same
 * treatment `modules/cart`/`modules/wishlist`/`modules/address` give a
 * foreign resource.
 */
export class NotificationService {
  constructor(private readonly notificationRepository: NotificationRepository) {}

  async getById(id: string, actor: AuthenticatedUser): Promise<NotificationResponseDto> {
    const notification = await this.getOwnedNotification(id, actor);
    return notificationMapper.toResponseDto(notification);
  }

  async listMine(
    actor: AuthenticatedUser,
    query: ParsedQuery,
    filters: NotificationFilterOptions,
  ): Promise<PaginatedResult<NotificationResponseDto>> {
    const result = await this.notificationRepository.findByUserId(actor.id, query, filters);
    return { items: notificationMapper.toResponseList(result.items), meta: result.meta };
  }

  /** Always creates an in-app notification owned by `actor` — never a
   * client-supplied `userId`/`channel`/`recipient` (see
   * `validation/create-in-app-notification.schema.ts`'s doc comment). */
  async create(
    dto: CreateInAppNotificationDto,
    actor: AuthenticatedUser,
  ): Promise<NotificationResponseDto> {
    const notification = await this.notificationRepository.create({
      userId: actor.id,
      channel: NOTIFICATION_CHANNELS.IN_APP,
      type: dto.type,
      priority: dto.priority,
      subject: dto.subject ?? null,
      body: dto.body,
      recipient: actor.id,
      metadata: dto.metadata ?? null,
    });

    logger.info(
      { notificationId: notification.id, actorId: actor.id, type: notification.type },
      "Notification created",
    );
    return notificationMapper.toResponseDto(notification);
  }

  async markRead(id: string, actor: AuthenticatedUser): Promise<NotificationResponseDto> {
    await this.getOwnedNotification(id, actor);

    const updated = await this.notificationRepository.markRead(id);
    logger.info({ notificationId: id, actorId: actor.id }, "Notification marked read");
    return notificationMapper.toResponseDto(updated);
  }

  async markUnread(id: string, actor: AuthenticatedUser): Promise<NotificationResponseDto> {
    await this.getOwnedNotification(id, actor);

    const updated = await this.notificationRepository.markUnread(id);
    logger.info({ notificationId: id, actorId: actor.id }, "Notification marked unread");
    return notificationMapper.toResponseDto(updated);
  }

  async markAllRead(actor: AuthenticatedUser): Promise<MarkAllReadResponseDto> {
    const updatedCount = await this.notificationRepository.markAllRead(actor.id);
    logger.info({ actorId: actor.id, updatedCount }, "All notifications marked read");
    return { updatedCount };
  }

  async delete(id: string, actor: AuthenticatedUser): Promise<void> {
    await this.getOwnedNotification(id, actor);

    await this.notificationRepository.softDelete(id);
    logger.info({ notificationId: id, actorId: actor.id }, "Notification soft-deleted");
  }

  async restore(id: string, actor: AuthenticatedUser): Promise<NotificationResponseDto> {
    const existing = await this.getOwnedNotification(id, actor, { includeDeleted: true });
    if (!existing.deletedAt) {
      throw new ConflictError("Notification is not deleted");
    }

    await this.notificationRepository.restore(id);
    const restored = await this.getOwnedNotification(id, actor);
    logger.info({ notificationId: id, actorId: actor.id }, "Notification restored");
    return notificationMapper.toResponseDto(restored);
  }

  async getUnreadCount(actor: AuthenticatedUser): Promise<UnreadCountResponseDto> {
    const count = await this.notificationRepository.countUnread(actor.id);
    return { count };
  }

  private async getOwnedNotification(
    id: string,
    actor: AuthenticatedUser,
    options?: NotificationLookupOptions,
  ): Promise<Notification> {
    const notification = await this.notificationRepository.findById(id, options);
    if (!notification || notification.userId !== actor.id) {
      throw new NotFoundError("Notification not found");
    }
    return notification;
  }
}
