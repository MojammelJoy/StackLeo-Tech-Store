import type { ModerationStatus, RatingValue } from "../constants";

/** Review-specific filter criteria, layered on top of `common/`'s
 * generic `ParsedQuery` (pagination/sort/search). Shared between
 * `repository/` (the contract) and `service/` (the skeleton). */
export interface ReviewFilterOptions {
  rating?: RatingValue;
  moderationStatus?: ModerationStatus;
  verifiedOnly?: boolean;
}
