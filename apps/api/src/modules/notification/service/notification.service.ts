import { NotImplementedError } from "../../../errors";

import type { AuthenticatedUser } from "../../../auth";
import type { PaginatedResult, ParsedQuery } from "../../../common";
import type { EmailProviderName, PushProviderName, SmsProviderName } from "../constants";
import type {
  CreateNotificationDto,
  SendEmailDto,
  SendInAppDto,
  SendPushDto,
  SendSmsDto,
} from "../dto";
import type { NotificationEvent } from "../events";
import type { MultiChannelNotificationRequest, NotificationFilterOptions } from "../interfaces";
import type { EmailProvider, PushProvider, SmsProvider } from "../providers";
import type { NotificationRepository } from "../repository";
import type { Notification } from "../types";

/**
 * Skeleton notification service — the operations a concrete
 * implementation will expose once notification persistence, real
 * channel providers, and an actual queue/scheduler exist. Depends on
 * `NotificationRepository` (interface only; see `repository/`) for
 * persistence and three separate *registries* of providers — one each
 * for email, SMS, and push, keyed by their respective provider-name
 * type — never a single hardcoded provider per channel, which is what
 * actually lets this foundation "support multi-channel delivery" and
 * "future provider integrations": routing an email to Resend vs.
 * SendGrid (or an SMS to Twilio, a push to Firebase) is a matter of
 * choosing a registry key, not branching logic baked into this class.
 * Every method throws `NotImplementedError` — no database operations,
 * no calls to any provider, no template rendering, and no queue/retry
 * scheduling happen in this foundation; `dispatchMultiChannel` and
 * `handleEvent` only document the shape a real implementation's inputs
 * would take.
 *
 * Write operations accept an optional `actor: AuthenticatedUser` —
 * many notifications are system- or event-triggered rather than the
 * direct result of an authenticated request (an order-confirmation
 * email has no "actor" in the HTTP sense), so `actor` is present for
 * attribution when one exists, not required. Nothing here checks
 * `actor`'s permissions; that is `modules/rbac`'s job, applied by
 * whatever middleware sits in front of this service once it exists.
 */
export class NotificationService {
  constructor(
    private readonly notificationRepository: NotificationRepository,
    private readonly emailProviders: Partial<Record<EmailProviderName, EmailProvider>>,
    private readonly smsProviders: Partial<Record<SmsProviderName, SmsProvider>>,
    private readonly pushProviders: Partial<Record<PushProviderName, PushProvider>>,
  ) {}

  async findById(id: string): Promise<Notification | null> {
    throw new NotImplementedError(
      `NotificationService.findById is not implemented yet (id: ${id})`,
    );
  }

  async findByUserId(
    userId: string,
    _query: ParsedQuery,
    _filters?: NotificationFilterOptions,
  ): Promise<PaginatedResult<Notification>> {
    throw new NotImplementedError(
      `NotificationService.findByUserId is not implemented yet (userId: ${userId})`,
    );
  }

  async create(_dto: CreateNotificationDto, _actor?: AuthenticatedUser): Promise<Notification> {
    throw new NotImplementedError("NotificationService.create is not implemented yet");
  }

  async sendEmail(_dto: SendEmailDto, _actor?: AuthenticatedUser): Promise<Notification> {
    throw new NotImplementedError("NotificationService.sendEmail is not implemented yet");
  }

  async sendSms(_dto: SendSmsDto, _actor?: AuthenticatedUser): Promise<Notification> {
    throw new NotImplementedError("NotificationService.sendSms is not implemented yet");
  }

  async sendPush(_dto: SendPushDto, _actor?: AuthenticatedUser): Promise<Notification> {
    throw new NotImplementedError("NotificationService.sendPush is not implemented yet");
  }

  async sendInApp(_dto: SendInAppDto, _actor?: AuthenticatedUser): Promise<Notification> {
    throw new NotImplementedError("NotificationService.sendInApp is not implemented yet");
  }

  async dispatchMultiChannel(_request: MultiChannelNotificationRequest): Promise<Notification[]> {
    throw new NotImplementedError(
      "NotificationService.dispatchMultiChannel is not implemented yet",
    );
  }

  async handleEvent(event: NotificationEvent): Promise<Notification[]> {
    throw new NotImplementedError(
      `NotificationService.handleEvent is not implemented yet (eventType: ${event.eventType})`,
    );
  }

  async retry(id: string): Promise<Notification> {
    throw new NotImplementedError(`NotificationService.retry is not implemented yet (id: ${id})`);
  }

  async cancel(id: string, _actor?: AuthenticatedUser): Promise<Notification> {
    throw new NotImplementedError(`NotificationService.cancel is not implemented yet (id: ${id})`);
  }
}
