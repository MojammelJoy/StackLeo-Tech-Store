import { parseQuery, sendPaginatedResponse, sendSuccess } from "../../../common";
import { asyncHandler } from "../../../utils";
import { NOTIFICATION_FILTERABLE_FIELDS, NOTIFICATION_SORTABLE_FIELDS } from "../../notification";

import { requireParam } from "./shared";

import type { ParsedQuery } from "../../../common";
import type {
  NotificationChannel,
  NotificationFilterOptions,
  NotificationPriority,
  NotificationStatus,
  NotificationType,
} from "../../notification";
import type { AdminNotificationService } from "../service";

/** Combines `common/`'s generic `parsed.filters` (channel/type/priority/
 * status) into one typed `NotificationFilterOptions` — mirrors every
 * other module's `extractFilterOptions`. */
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

/** Express handlers for administrative notification visibility
 * (read-only — see `service/admin-notification.service.ts`). */
export class AdminNotificationController {
  constructor(private readonly adminNotificationService: AdminNotificationService) {}

  list = asyncHandler(async (req, res) => {
    const parsed = parseQuery(req.query, {
      sortableFields: NOTIFICATION_SORTABLE_FIELDS,
      filterableFields: NOTIFICATION_FILTERABLE_FIELDS,
    });
    const filters = extractFilterOptions(parsed);
    const result = await this.adminNotificationService.list(parsed, filters);
    sendPaginatedResponse(res, result.items, result.meta);
  });

  getById = asyncHandler(async (req, res) => {
    const id = requireParam(req, "id");
    const notification = await this.adminNotificationService.getById(id);
    sendSuccess(res, { notification });
  });

  getSummary = asyncHandler(async (_req, res) => {
    const summary = await this.adminNotificationService.getSummary();
    sendSuccess(res, { summary });
  });
}
