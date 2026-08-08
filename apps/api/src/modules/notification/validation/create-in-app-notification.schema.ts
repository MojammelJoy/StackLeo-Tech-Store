import { z } from "zod";

import { NOTIFICATION_PRIORITIES, NOTIFICATION_TYPES } from "../constants";
import { bodySchema, subjectSchema } from "../schemas";

/**
 * The HTTP-facing "create my own notification" shape — deliberately
 * narrower than the foundation's generic, channel-agnostic
 * `createNotificationSchema`: this API creates in-app records only (see
 * `service/notification.service.ts`'s doc comment), so `channel` isn't
 * accepted at all (the service always forces `IN_APP`), and neither is
 * `userId`/`recipient` (the service always forces `actor.id` — "users
 * can access only their own notifications" applies to creation too).
 * `templateKey`/`scheduledAt`/`maxRetries` are omitted outright rather
 * than accepted-and-ignored: nothing in this API renders a template,
 * schedules deferred delivery, or retries a failed send, so accepting
 * those fields would promise behavior this API doesn't have.
 */
export const createInAppNotificationSchema = z.object({
  type: z.enum([
    NOTIFICATION_TYPES.TRANSACTIONAL,
    NOTIFICATION_TYPES.MARKETING,
    NOTIFICATION_TYPES.SYSTEM,
  ]),
  priority: z
    .enum([
      NOTIFICATION_PRIORITIES.LOW,
      NOTIFICATION_PRIORITIES.NORMAL,
      NOTIFICATION_PRIORITIES.HIGH,
      NOTIFICATION_PRIORITIES.URGENT,
    ])
    .optional(),
  subject: subjectSchema.optional(),
  body: bodySchema,
  metadata: z.record(z.string()).optional(),
});
