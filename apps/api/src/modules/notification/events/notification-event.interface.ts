/**
 * A domain event that could trigger one or more notifications —
 * `eventType` is a free-form dotted string (e.g. `"order.confirmed"`,
 * `"user.registered"`) rather than an enum, since new event types will
 * be added by other modules over time without this one needing to know
 * about them in advance. No event bus/emitter exists in this
 * foundation; this only documents the envelope shape one would carry.
 */
export interface NotificationEvent<TPayload = unknown> {
  eventType: string;
  payload: TPayload;
  occurredAt: Date;
}
