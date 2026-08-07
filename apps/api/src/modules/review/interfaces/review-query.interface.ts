import type { ModerationStatus, RatingValue } from "../constants";

/** Review-specific filter criteria, layered on top of `common/`'s
 * generic `ParsedQuery` (pagination/sort/search). Shared between
 * `repository/` (the contract) and `service/` (which additionally sets
 * `visibleToUserId` for any caller without `review:moderate` — see
 * `service/review.service.ts`'s `scopeFiltersForActor`). */
export interface ReviewFilterOptions {
  rating?: RatingValue;
  moderationStatus?: ModerationStatus;
  verifiedOnly?: boolean;
  /** When set, scopes results to `APPROVED` reviews plus this user's own
   * reviews regardless of status — combined with `moderationStatus`
   * (when both are given) via `AND`, so e.g. filtering for `pending`
   * while scoped only ever surfaces the caller's *own* pending reviews,
   * never another shopper's. `undefined` means no such restriction (a
   * `review:moderate` caller's listing sees every status). */
  visibleToUserId?: string;
}
