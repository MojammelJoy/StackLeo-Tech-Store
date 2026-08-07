/**
 * The full Notification API: domain types (`Notification`, one record
 * per channel per delivery attempt, extended with `isRead`/`readAt`/
 * `deletedAt` — see `types/notification.types.ts`), DTOs + Zod
 * validation schemas, the repository contracts (`NotificationRepository`
 * plus its real Prisma implementation), the real `NotificationService`
 * (creation, self-service listing/lookup, read/unread state, soft
 * delete/restore, and an efficient unread count — see that service's
 * doc comment for why delivery is deliberately out of scope),
 * controllers/routes, and the notification mapper. Also re-exports the
 * foundation's multi-channel delivery infrastructure — per-channel
 * provider abstractions (`providers/`), template rendering
 * (`templates/`), event-payload/handler shapes (`events/`), and the
 * generic `send*`/`createNotificationSchema` shapes — entirely unwired
 * from this module's own service/routes, kept only so a future delivery
 * module can build on it without a domain reshape.
 */
export {
  BACKOFF_STRATEGIES,
  EMAIL_PROVIDERS,
  NOTIFICATION_BODY_MAX_LENGTH,
  NOTIFICATION_CHANNELS,
  NOTIFICATION_DEFAULT_MAX_RETRIES_DEV,
  NOTIFICATION_DEFAULT_MAX_RETRIES_PRODUCTION,
  NOTIFICATION_DEFAULT_RETRY_INITIAL_DELAY_MS,
  NOTIFICATION_FILTERABLE_FIELDS,
  NOTIFICATION_PRIORITIES,
  NOTIFICATION_SORTABLE_FIELDS,
  NOTIFICATION_STATUSES,
  NOTIFICATION_SUBJECT_MAX_LENGTH,
  NOTIFICATION_TYPES,
  PUSH_PROVIDERS,
  SMS_PROVIDERS,
} from "./constants";
export type {
  BackoffStrategy,
  EmailProviderName,
  NotificationChannel,
  NotificationPriority,
  NotificationStatus,
  NotificationType,
  PushProviderName,
  SmsProviderName,
} from "./constants";

export type {
  CreateNotificationInput,
  Notification,
  RetryPolicy,
  UpdateNotificationInput,
} from "./types";

export {
  bodySchema,
  deviceTokenSchema,
  emailAddressSchema,
  phoneNumberSchema,
  subjectSchema,
} from "./schemas";

export {
  createInAppNotificationSchema,
  createNotificationSchema,
  notificationIdParamsSchema,
  sendEmailSchema,
  sendInAppSchema,
  sendPushSchema,
  sendSmsSchema,
} from "./validation";
export type {
  CreateInAppNotificationDto,
  CreateNotificationDto,
  MarkAllReadResponseDto,
  NotificationResponseDto,
  SendEmailDto,
  SendInAppDto,
  SendPushDto,
  SendSmsDto,
  UnreadCountResponseDto,
} from "./dto";

export type {
  MultiChannelNotificationRequest,
  NotificationDeliveryResult,
  NotificationFilterOptions,
  NotificationMapper,
} from "./interfaces";

export {
  FirebasePushProvider,
  ResendEmailProvider,
  SendgridEmailProvider,
  TwilioSmsProvider,
} from "./providers";
export type {
  EmailMessage,
  EmailProvider,
  FirebaseProviderConfig,
  PushMessage,
  PushProvider,
  ResendProviderConfig,
  SendgridProviderConfig,
  SmsMessage,
  SmsProvider,
  TwilioProviderConfig,
} from "./providers";

export { DefaultTemplateRenderer } from "./templates";
export type {
  NotificationTemplate,
  RenderedTemplate,
  TemplateRenderer,
  TemplateRenderInput,
} from "./templates";

export type {
  LowStockEventPayload,
  NotificationEvent,
  NotificationEventHandler,
  OrderConfirmedEventPayload,
  PasswordResetRequestedEventPayload,
} from "./events";

export { notificationMapper } from "./mapper";

export {
  calculateNextRetryDelayMs,
  getDefaultMaxRetries,
  isRetryable,
  isTerminal,
  maskRecipient,
} from "./utils";

export { NotificationPrismaRepository } from "./repository";
export type { NotificationLookupOptions, NotificationRepository } from "./repository";

export { NotificationService } from "./service";

export { NotificationController } from "./controller";

export { notificationRouter } from "./routes";
