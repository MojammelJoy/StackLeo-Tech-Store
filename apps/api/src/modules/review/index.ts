/**
 * The full Review API: domain types (`Review`, keyed to a product and
 * its author via bare FK strings — see `types/review.types.ts`), DTOs +
 * Zod validation schemas, the repository contracts (`ReviewRepository`
 * plus its real Prisma implementation, and the read-only
 * `ProductExistenceRepository`/`VerifiedPurchaseLookupRepository` this
 * module uses instead of importing `modules/product`/`modules/order`),
 * the real `ReviewService` (authoring, soft delete/restore, moderation,
 * helpful voting, and rating aggregates), the review mapper,
 * controllers/routes, and the rating-aggregation/status/helpful-vote
 * utilities that support it all.
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

export {
  createReviewSchema,
  moderateReviewSchema,
  productIdParamsSchema,
  reviewIdParamsSchema,
  updateReviewSchema,
  voteHelpfulSchema,
} from "./validation";
export type {
  CreateReviewDto,
  ModerateReviewDto,
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

export {
  ProductExistencePrismaRepository,
  ReviewPrismaRepository,
  VerifiedPurchaseLookupPrismaRepository,
} from "./repository";
export type {
  ProductExistenceRepository,
  ReviewLookupOptions,
  ReviewRepository,
  VerifiedPurchase,
  VerifiedPurchaseLookupRepository,
} from "./repository";

export { ReviewService } from "./service";

export { ReviewController } from "./controller";

export { reviewRouter } from "./routes";
