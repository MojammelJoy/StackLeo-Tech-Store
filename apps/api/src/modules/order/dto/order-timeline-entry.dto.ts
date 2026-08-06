import type { OrderStatus } from "../constants";

/** The public-facing shape of one `OrderStatusHistoryEntry` — what
 * `GET /orders/:id/timeline` returns a list of, oldest first. */
export interface OrderTimelineEntryDto {
  id: string;
  status: OrderStatus;
  note: string | null;
  createdAt: Date;
}
