import type { ManagementModuleKey } from "../constants";

/**
 * A shared shape describing *who* is performing an admin action and
 * *which* management area it targets — meant to be threaded through to
 * whichever domain module's own service ultimately performs the action
 * (e.g. `modules/review`'s moderation, `modules/order`'s status
 * update), so that module can attribute the change without this
 * foundation needing to import it. No code in this foundation
 * dispatches an action using this shape; it only documents it.
 */
export interface AdminActionContext {
  module: ManagementModuleKey;
  actorId: string;
  reason?: string;
}
