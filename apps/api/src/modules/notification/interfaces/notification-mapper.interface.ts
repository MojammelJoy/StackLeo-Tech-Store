import type { NotificationResponseDto } from "../dto";
import type { Notification } from "../types";

/** Contract `mapper/notification.mapper.ts` implements. Kept separate
 * from `mapper/` itself (mirroring `repository/`'s
 * interface-vs-implementation split) so a future alternate mapper — or
 * a test double — can satisfy the same shape without depending on the
 * concrete implementation. */
export interface NotificationMapper {
  toResponseDto(notification: Notification): NotificationResponseDto;
  toResponseList(notifications: Notification[]): NotificationResponseDto[];
}
