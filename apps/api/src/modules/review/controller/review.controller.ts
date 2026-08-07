import { HTTP_STATUS, parseQuery, sendPaginatedResponse, sendSuccess } from "../../../common";
import { BadRequestError, UnauthorizedError } from "../../../errors";
import { asyncHandler } from "../../../utils";
import { REVIEW_FILTERABLE_FIELDS, REVIEW_SORTABLE_FIELDS } from "../constants";

import type { AuthenticatedUser } from "../../../auth";
import type { ParsedQuery } from "../../../common";
import type { ModerationStatus, RatingValue } from "../constants";
import type { CreateReviewDto, ModerateReviewDto, UpdateReviewDto, VoteHelpfulDto } from "../dto";
import type { ReviewFilterOptions } from "../interfaces";
import type { ReviewService } from "../service";
import type { Request } from "express";

function requireAuthenticatedUser(req: Request): AuthenticatedUser {
  if (!req.user) {
    throw new UnauthorizedError("Authentication required");
  }
  return req.user;
}

function requireParam(req: Request, key: string): string {
  const value = req.params[key];
  if (!value) {
    throw new BadRequestError(`"${key}" parameter is required`);
  }
  return value;
}

/** Combines `common/`'s generic `parsed.filters` (rating/moderationStatus/
 * verifiedOnly) into one typed `ReviewFilterOptions` the service can
 * apply its visibility scope on top of — mirrors `modules/brand`/
 * `modules/coupon`'s `extractFilterOptions`. */
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

/**
 * Express handlers for every Review API endpoint. Each method is an
 * `asyncHandler`-wrapped arrow function (bound automatically, so
 * `routes/review.routes.ts` can reference `reviewController.x`
 * directly), and does only three things: read the request, call one
 * `ReviewService` method, and send the response — no business logic
 * lives here.
 */
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  getById = asyncHandler(async (req, res) => {
    const actor = requireAuthenticatedUser(req);
    const id = requireParam(req, "id");
    const review = await this.reviewService.getById(id, actor);
    sendSuccess(res, { review });
  });

  listForProduct = asyncHandler(async (req, res) => {
    const actor = requireAuthenticatedUser(req);
    const productId = requireParam(req, "productId");
    const parsed = parseQuery(req.query, {
      sortableFields: REVIEW_SORTABLE_FIELDS,
      filterableFields: REVIEW_FILTERABLE_FIELDS,
    });
    const filters = extractFilterOptions(parsed);
    const result = await this.reviewService.listForProduct(productId, parsed, filters, actor);
    sendPaginatedResponse(res, result.items, result.meta);
  });

  listMine = asyncHandler(async (req, res) => {
    const actor = requireAuthenticatedUser(req);
    const parsed = parseQuery(req.query, {
      sortableFields: REVIEW_SORTABLE_FIELDS,
      filterableFields: REVIEW_FILTERABLE_FIELDS,
    });
    const result = await this.reviewService.listMine(actor, parsed);
    sendPaginatedResponse(res, result.items, result.meta);
  });

  getRatingSummary = asyncHandler(async (req, res) => {
    const productId = requireParam(req, "productId");
    const summary = await this.reviewService.getRatingSummary(productId);
    sendSuccess(res, { summary });
  });

  create = asyncHandler(async (req, res) => {
    const actor = requireAuthenticatedUser(req);
    const dto = req.body as CreateReviewDto;
    const review = await this.reviewService.create(dto, actor);
    sendSuccess(res, { review }, { statusCode: HTTP_STATUS.CREATED });
  });

  update = asyncHandler(async (req, res) => {
    const actor = requireAuthenticatedUser(req);
    const id = requireParam(req, "id");
    const dto = req.body as UpdateReviewDto;
    const review = await this.reviewService.update(id, dto, actor);
    sendSuccess(res, { review });
  });

  delete = asyncHandler(async (req, res) => {
    const actor = requireAuthenticatedUser(req);
    const id = requireParam(req, "id");
    await this.reviewService.delete(id, actor);
    sendSuccess(res, { message: "Review deleted" });
  });

  restore = asyncHandler(async (req, res) => {
    const actor = requireAuthenticatedUser(req);
    const id = requireParam(req, "id");
    const review = await this.reviewService.restore(id, actor);
    sendSuccess(res, { review });
  });

  moderate = asyncHandler(async (req, res) => {
    const actor = requireAuthenticatedUser(req);
    const id = requireParam(req, "id");
    const dto = req.body as ModerateReviewDto;
    const review = await this.reviewService.moderate(id, dto, actor);
    sendSuccess(res, { review });
  });

  vote = asyncHandler(async (req, res) => {
    const actor = requireAuthenticatedUser(req);
    const id = requireParam(req, "id");
    const dto = req.body as VoteHelpfulDto;
    const review = await this.reviewService.vote(id, dto, actor);
    sendSuccess(res, { review });
  });
}
