import { HTTP_STATUS, parseQuery, sendPaginatedResponse, sendSuccess } from "../../../common";
import { BadRequestError, UnauthorizedError } from "../../../errors";
import { asyncHandler } from "../../../utils";
import { COUPON_FILTERABLE_FIELDS, COUPON_SORTABLE_FIELDS } from "../constants";

import type { AuthenticatedUser } from "../../../auth";
import type { ParsedQuery } from "../../../common";
import type { CouponStatus, DiscountType } from "../constants";
import type { ApplyCouponDto, CreateCouponDto, UpdateCouponDto } from "../dto";
import type { CouponFilterOptions } from "../interfaces";
import type { CouponService } from "../service";
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

/** Combines `common/`'s generic `parsed.filters` (status/discountType/
 * stackable) into one typed `CouponFilterOptions` the service can query
 * with — mirrors `modules/brand`/`modules/product`'s
 * `extractFilterOptions`. */
function extractFilterOptions(parsed: ParsedQuery): CouponFilterOptions {
  const filters: CouponFilterOptions = {};

  const status = parsed.filters.status;
  if (status) {
    filters.status = String(status.value) as CouponStatus;
  }

  const discountType = parsed.filters.discountType;
  if (discountType) {
    filters.discountType = String(discountType.value) as DiscountType;
  }

  const stackable = parsed.filters.stackable;
  if (stackable) {
    filters.stackable = String(stackable.value) === "true";
  }

  return filters;
}

/**
 * Express handlers for every Coupon API endpoint. Each method is an
 * `asyncHandler`-wrapped arrow function (bound automatically, so
 * `routes/coupon.routes.ts` can reference `couponController.x`
 * directly), and does only three things: read the request, call one
 * `CouponService` method, and send the response — no business logic
 * lives here.
 */
export class CouponController {
  constructor(private readonly couponService: CouponService) {}

  list = asyncHandler(async (req, res) => {
    const parsed = parseQuery(req.query, {
      sortableFields: COUPON_SORTABLE_FIELDS,
      filterableFields: COUPON_FILTERABLE_FIELDS,
    });
    const filters = extractFilterOptions(parsed);
    const result = await this.couponService.findAll(parsed, filters);
    sendPaginatedResponse(res, result.items, result.meta);
  });

  getById = asyncHandler(async (req, res) => {
    const id = requireParam(req, "id");
    const coupon = await this.couponService.findById(id);
    sendSuccess(res, { coupon });
  });

  getByCode = asyncHandler(async (req, res) => {
    const code = requireParam(req, "code");
    const coupon = await this.couponService.findByCode(code);
    sendSuccess(res, { coupon });
  });

  create = asyncHandler(async (req, res) => {
    const actor = requireAuthenticatedUser(req);
    const dto = req.body as CreateCouponDto;
    const coupon = await this.couponService.create(dto, actor);
    sendSuccess(res, { coupon }, { statusCode: HTTP_STATUS.CREATED });
  });

  update = asyncHandler(async (req, res) => {
    const actor = requireAuthenticatedUser(req);
    const id = requireParam(req, "id");
    const dto = req.body as UpdateCouponDto;
    const coupon = await this.couponService.update(id, dto, actor);
    sendSuccess(res, { coupon });
  });

  delete = asyncHandler(async (req, res) => {
    const actor = requireAuthenticatedUser(req);
    const id = requireParam(req, "id");
    await this.couponService.delete(id, actor);
    sendSuccess(res, { message: "Coupon deleted" });
  });

  restore = asyncHandler(async (req, res) => {
    const actor = requireAuthenticatedUser(req);
    const id = requireParam(req, "id");
    const coupon = await this.couponService.restore(id, actor);
    sendSuccess(res, { coupon });
  });

  validate = asyncHandler(async (req, res) => {
    const actor = requireAuthenticatedUser(req);
    const dto = req.body as ApplyCouponDto;
    const result = await this.couponService.validate(dto, actor);
    sendSuccess(res, result);
  });

  apply = asyncHandler(async (req, res) => {
    const actor = requireAuthenticatedUser(req);
    const dto = req.body as ApplyCouponDto;
    const result = await this.couponService.apply(dto, actor);
    sendSuccess(res, result, { statusCode: HTTP_STATUS.CREATED });
  });

  remove = asyncHandler(async (req, res) => {
    const actor = requireAuthenticatedUser(req);
    const code = requireParam(req, "code");
    await this.couponService.removeFromCart(code, actor);
    sendSuccess(res, { message: "Coupon removed from cart" });
  });
}
