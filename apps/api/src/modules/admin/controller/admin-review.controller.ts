import { parseQuery, sendPaginatedResponse, sendSuccess } from "../../../common";
import { asyncHandler } from "../../../utils";
import { REVIEW_FILTERABLE_FIELDS, REVIEW_SORTABLE_FIELDS } from "../../review";

import { requireAuthenticatedUser, requireParam } from "./shared";

import type { ParsedQuery } from "../../../common";
import type {
  ModerateReviewDto,
  ModerationStatus,
  RatingValue,
  ReviewFilterOptions,
} from "../../review";
import type { AdminReviewService } from "../service";

/** Combines `common/`'s generic `parsed.filters` (rating/moderationStatus/
 * verifiedOnly) into one typed `ReviewFilterOptions` — mirrors every
 * other module's `extractFilterOptions`. */
function extractFilterOptions(parsed: ParsedQuery): ReviewFilterOptions {
  const filters: ReviewFilterOptions = {};

  const rating = parsed.filters.rating;
  if (rating) {
    filters.rating = Number(rating.value) as RatingValue;
  }

  const moderationStatus = parsed.filters.moderationStatus;
  if (moderationStatus) {
    filters.moderationStatus = String(moderationStatus.value) as ModerationStatus;
  }

  const verifiedOnly = parsed.filters.verifiedOnly;
  if (verifiedOnly) {
    filters.verifiedOnly = String(verifiedOnly.value) === "true";
  }

  return filters;
}

/** Express handlers for administrative review moderation. */
export class AdminReviewController {
  constructor(private readonly adminReviewService: AdminReviewService) {}

  list = asyncHandler(async (req, res) => {
    const parsed = parseQuery(req.query, {
      sortableFields: REVIEW_SORTABLE_FIELDS,
      filterableFields: REVIEW_FILTERABLE_FIELDS,
    });
    const filters = extractFilterOptions(parsed);
    const result = await this.adminReviewService.list(parsed, filters);
    sendPaginatedResponse(res, result.items, result.meta);
  });

  getById = asyncHandler(async (req, res) => {
    const actor = requireAuthenticatedUser(req);
    const id = requireParam(req, "id");
    const review = await this.adminReviewService.getById(id, actor);
    sendSuccess(res, { review });
  });

  moderate = asyncHandler(async (req, res) => {
    const actor = requireAuthenticatedUser(req);
    const id = requireParam(req, "id");
    const dto = req.body as ModerateReviewDto;
    const review = await this.adminReviewService.moderate(id, dto, actor);
    sendSuccess(res, { review });
  });

  delete = asyncHandler(async (req, res) => {
    const actor = requireAuthenticatedUser(req);
    const id = requireParam(req, "id");
    await this.adminReviewService.delete(id, actor);
    sendSuccess(res, { message: "Review deleted" });
  });

  restore = asyncHandler(async (req, res) => {
    const actor = requireAuthenticatedUser(req);
    const id = requireParam(req, "id");
    const review = await this.adminReviewService.restore(id, actor);
    sendSuccess(res, { review });
  });
}
