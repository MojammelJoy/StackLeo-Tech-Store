/**
 * Reusable notification infrastructure: domain types (`Notification`,
 * one record per channel per delivery attempt — see
 * `types/notification.types.ts`), DTOs + Zod validation schemas (a
 * generic notification shape plus one channel-specific `send*` shape
 * each for email/SMS/push/in-app, built from reusable field-level
 * schemas in `schemas/`), the repository contract (plus its
 * currently-skeletal Prisma implementation), a skeleton service, the
 * per-channel provider abstractions (Resend/SendGrid, Twilio, Firebase
 * skeletons — see `providers/`), the template-rendering contract (see
 * `templates/`), event-payload/handler shapes for event-driven dispatch
 * (see `events/`), the notification mapper, and the
 * status/retry-policy/recipient-masking utilities that support it all.
 * No controllers, routes, business logic, actual email/SMS/push
 * sending, or queue implementation live here.
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
  createNotificationSchema,
  sendEmailSchema,
  sendInAppSchema,
  sendPushSchema,
  sendSmsSchema,
} from "./validation";
export type {
  CreateNotificationDto,
  NotificationResponseDto,
  SendEmailDto,
  SendInAppDto,
  SendPushDto,
  SendSmsDto,
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
export type { NotificationRepository } from "./repository";

export { NotificationService } from "./service";
