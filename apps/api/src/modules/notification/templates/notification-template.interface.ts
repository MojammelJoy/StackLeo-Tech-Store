import type { NotificationChannel } from "../constants";

/** A stored, reusable notification template — e.g. "order-confirmation"
 * or "password-reset" — keyed by `key` and looked up by
 * `Notification.templateKey` (see `types/notification.types.ts`).
 * `subject` only applies to channels that have one (email/push);
 * `body` contains placeholder syntax a `TemplateRenderer` resolves. */
export interface NotificationTemplate {
  id: string;
  channel: NotificationChannel;
  key: string;
  subject: string | null;
  body: string;
}

export interface TemplateRenderInput {
  templateKey: string;
  variables: Record<string, string>;
}

export interface RenderedTemplate {
  subject: string | null;
  body: string;
}
