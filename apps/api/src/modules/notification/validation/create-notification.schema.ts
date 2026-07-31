import { z } from "zod";

import { NOTIFICATION_CHANNELS, NOTIFICATION_PRIORITIES, NOTIFICATION_TYPES } from "../constants";
import { bodySchema, subjectSchema } from "../schemas";

/**
 * The generic, channel-agnostic notification shape — `recipient`'s
 * meaning depends on `channel` (see `types/notification.types.ts`), so
 * it's validated only as a non-empty string here rather than as an
 * email/phone/token, unlike the channel-specific `send*Schema`s. One
 * cross-field rule: `scheduledAt`, when present, must be in the future.
 */
export const createNotificationSchema = z
  .object({
    userId: z.string().min(1).optional(),
    channel: z.enum([
      NOTIFICATION_CHANNELS.EMAIL,
      NOTIFICATION_CHANNELS.SMS,
      NOTIFICATION_CHANNELS.PUSH,
      NOTIFICATION_CHANNELS.IN_APP,
    ]),
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
    templateKey: z.string().min(1).optional(),
    subject: subjectSchema.optional(),
    body: bodySchema,
    recipient: z.string().min(1),
    metadata: z.record(z.string()).optional(),
    scheduledAt: z.coerce.date().optional(),
    maxRetries: z.number().int().nonnegative().optional(),
  })
  .refine((data) => !data.scheduledAt || data.scheduledAt > new Date(), {
    message: "scheduledAt must be in the future",
    path: ["scheduledAt"],
  });
