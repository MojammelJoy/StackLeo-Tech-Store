import type { NotificationEvent } from "./notification-event.interface";

/** What a future event-driven dispatcher would register per
 * `eventType` — `service/notification.service.ts`'s `handleEvent` is
 * the closest thing to a consumer of this shape in the current
 * foundation, and even it only throws `NotImplementedError`. */
export interface NotificationEventHandler<TPayload = unknown> {
  eventType: string;
  handle(event: NotificationEvent<TPayload>): Promise<void>;
}
