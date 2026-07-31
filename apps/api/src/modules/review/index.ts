/**
 * Reusable review infrastructure: domain types (`Review`, keyed to a
 * product and its author via bare FK strings — see
 * `types/review.types.ts`), DTOs + Zod validation schemas (built from
 * reusable field-level schemas in `schemas/`), the repository contract
 * (plus its currently-skeletal Prisma implementation), a skeleton
 * service, the moderation-strategy abstraction (automated/manual
 * skeletons — see `moderation/`), the review mapper, and the
 * rating-aggregation/status/helpful-vote utilities that support it all.
 * No controllers, routes, business logic, actual moderation
 * implementation, notification implementation, or media upload
 * implementation live here.
 */
export {
  MODERATION_STATUSES,
  MODERATION_STRATEGIES,
  RATING_MAX,
  RATING_MIN,
  RATING_VALUES,
  REVIEW_BODY_MAX_LENGTH,
  REVIEW_BODY_MIN_LENGTH,
  REVIEW_FILTERABLE_FIELDS,
  REVIEW_MAX_MEDIA_ITEMS,
  REVIEW_MEDIA_TYPES,
  REVIEW_SORTABLE_FIELDS,
  REVIEW_TITLE_MAX_LENGTH,
} from "./constants";
export type {
  ModerationStatus,
  ModerationStrategyName,
  RatingValue,
  ReviewMediaType,
} from "./constants";

export type {
  CreateReviewInput,
  Review,
  RatingBreakdown,
  ReviewSummary,
  UpdateReviewInput,
} from "./types";

export { bodySchema, ratingSchema, reviewMediaItemSchema, titleSchema } from "./schemas";

export { createReviewSchema, updateReviewSchema, voteHelpfulSchema } from "./validation";
export type {
  CreateReviewDto,
  RatingSummaryResponseDto,
  ReviewResponseDto,
  UpdateReviewDto,
  VoteHelpfulDto,
} from "./dto";

export type {
  AbuseReport,
  ReviewFilterOptions,
  ReviewMapper,
  ReviewMediaItem,
  ReviewReply,
  VerifiedPurchaseReference,
} from "./interfaces";

export { AutomatedModerationProvider, ManualModerationProvider } from "./moderation";
export type {
  AutomatedModerationProviderConfig,
  ManualModerationProviderConfig,
  ModerationCheckInput,
  ModerationCheckResult,
  ModerationProvider,
} from "./moderation";

export { reviewMapper } from "./mapper";

export {
  buildRatingBreakdown,
  calculateAverageRating,
  getDefaultModerationStatus,
  getHelpfulnessRatio,
  isFlagged,
  isPending,
  isVisible,
} from "./utils";

export { ReviewPrismaRepository } from "./repository";
export type { ReviewRepository } from "./repository";

export { ReviewService } from "./service";
