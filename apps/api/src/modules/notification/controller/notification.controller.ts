import { HTTP_STATUS, parseQuery, sendPaginatedResponse, sendSuccess } from "../../../common";
import { BadRequestError, UnauthorizedError } from "../../../errors";
import { asyncHandler } from "../../../utils";
import { NOTIFICATION_FILTERABLE_FIELDS, NOTIFICATION_SORTABLE_FIELDS } from "../constants";

import type { AuthenticatedUser } from "../../../auth";
import type { ParsedQuery } from "../../../common";
import type {
  NotificationChannel,
  NotificationPriority,
  NotificationStatus,
  NotificationType,
} from "../constants";
import type { CreateInAppNotificationDto } from "../dto";
import type { NotificationFilterOptions } from "../interfaces";
import type { NotificationService } from "../service";
import type { Request } from "express";

function requireAuthenticatedUser(req: Request): AuthenticatedUser {
  if (!req.user) {
    throw new UnauthorizedError("Authentication required");
  }
  return req.user;
}

function requireParam(req: Request, key: string): string {
  const value = req.params[key];
  if (!value) {
    throw new BadRequestError(`"${key}" parameter is required`);
  }
  return value;
}

/** Combines `common/`'s generic `parsed.filters` (channel/type/priority/
 * status) into one typed `NotificationFilterOptions` — mirrors
 * `modules/brand`/`modules/coupon`'s `extractFilterOptions`. */
function extractFilterOptions(parsed: ParsedQuery): NotificationFilterOptions {
  const filters: NotificationFilterOptions = {};

  const channel = parsed.filters.channel;
  if (channel) {
    filters.channel = String(channel.value) as NotificationChannel;
  }

  const type = parsed.filters.type;
  if (type) {
    filters.type = String(type.value) as NotificationType;
  }

  const priority = parsed.filters.priority;
  if (priority) {
    filters.priority = String(priority.value) as NotificationPriority;
  }

  const status = parsed.filters.status;
  if (status) {
    filters.status = String(status.value) as NotificationStatus;
  }

  return filters;
}

/**
 * Express handlers for every Notification API endpoint. Each method is
 * an `asyncHandler`-wrapped arrow function (bound automatically, so
 * `routes/notification.routes.ts` can reference
 * `notificationController.x` directly), and does only three things:
 * read the request, call one `NotificationService` method, and send the
 * response — no business logic lives here.
 */
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  list = asyncHandler(async (req, res) => {
    const actor = requireAuthenticatedUser(req);
    const parsed = parseQuery(req.query, {
      sortableFields: NOTIFICATION_SORTABLE_FIELDS,
      filterableFields: NOTIFICATION_FILTERABLE_FIELDS,
    });
    const filters = extractFilterOptions(parsed);
    const result = await this.notificationService.listMine(actor, parsed, filters);
    sendPaginatedResponse(res, result.items, result.meta);
  });

  getUnreadCount = asyncHandler(async (req, res) => {
    const actor = requireAuthenticatedUser(req);
    const result = await this.notificationService.getUnreadCount(actor);
    sendSuccess(res, result);
  });

  markAllRead = asyncHandler(async (req, res) => {
    const actor = requireAuthenticatedUser(req);
    const result = await this.notificationService.markAllRead(actor);
    sendSuccess(res, result);
  });

  getById = asyncHandler(async (req, res) => {
    const actor = requireAuthenticatedUser(req);
    const id = requireParam(req, "id");
    const notification = await this.notificationService.getById(id, actor);
    sendSuccess(res, { notification });
  });

  create = asyncHandler(async (req, res) => {
    const actor = requireAuthenticatedUser(req);
    const dto = req.body as CreateInAppNotificationDto;
    const notification = await this.notificationService.create(dto, actor);
    sendSuccess(res, { notification }, { statusCode: HTTP_STATUS.CREATED });
  });

  markRead = asyncHandler(async (req, res) => {
    const actor = requireAuthenticatedUser(req);
    const id = requireParam(req, "id");
    const notification = await this.notificationService.markRead(id, actor);
    sendSuccess(res, { notification });
  });

  markUnread = asyncHandler(async (req, res) => {
    const actor = requireAuthenticatedUser(req);
    const id = requireParam(req, "id");
    const notification = await this.notificationService.markUnread(id, actor);
    sendSuccess(res, { notification });
  });

  delete = asyncHandler(async (req, res) => {
    const actor = requireAuthenticatedUser(req);
    const id = requireParam(req, "id");
    await this.notificationService.delete(id, actor);
    sendSuccess(res, { message: "Notification deleted" });
  });

  restore = asyncHandler(async (req, res) => {
    const actor = requireAuthenticatedUser(req);
    const id = requireParam(req, "id");
    const notification = await this.notificationService.restore(id, actor);
    sendSuccess(res, { notification });
  });
}
