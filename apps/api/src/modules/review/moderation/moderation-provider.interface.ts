import type { ModerationStatus, ModerationStrategyName } from "../constants";

export interface ModerationCheckInput {
  reviewId: string;
  title: string | null;
  body: string;
}

export interface ModerationCheckResult {
  status: ModerationStatus;
  reasons: string[];
}

/**
 * The moderation-strategy abstraction every concrete provider
 * (automated screening, manual/human review) implements.
 * `service/review.service.ts` depends on this interface — via a
 * registry keyed by `ModerationStrategyName` — never on a concrete
 * strategy directly, mirroring `modules/payment`'s `PaymentProvider`
 * registry pattern. Adding a third strategy later means adding one more
 * class that satisfies this shape, not touching the service.
 */
export interface ModerationProvider {
  readonly name: ModerationStrategyName;
  check(input: ModerationCheckInput): Promise<ModerationCheckResult>;
}
