import { HTTP_STATUS, parseQuery, sendPaginatedResponse, sendSuccess } from "../../../common";
import { BadRequestError, UnauthorizedError } from "../../../errors";
import { asyncHandler } from "../../../utils";
import { CATEGORY_FILTERABLE_FIELDS, CATEGORY_SORTABLE_FIELDS } from "../constants";

import type { AuthenticatedUser } from "../../../auth";
import type { ParsedQuery } from "../../../common";
import type { CategoryStatus, CategoryVisibility } from "../constants";
import type {
  CreateCategoryDto,
  UpdateCategoryDto,
  UpdateCategoryStatusDto,
  UpdateCategoryVisibilityDto,
} from "../dto";
import type { CategoryFilterOptions } from "../interfaces";
import type { CategoryService } from "../service";
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

/** Combines `common/`'s generic `parsed.filters` (parentId/status/
 * visibility) into one typed `CategoryFilterOptions` the service can
 * enforce visibility rules on top of — mirrors
 * `modules/product`'s `extractFilterOptions`. */
function extractFilterOptions(parsed: ParsedQuery): CategoryFilterOptions {
  const filters: CategoryFilterOptions = {};

  const parentId = parsed.filters.parentId;
  if (parentId) {
    filters.parentId = String(parentId.value);
  }

  const status = parsed.filters.status;
  if (status) {
    filters.status = String(status.value) as CategoryStatus;
  }

  const visibility = parsed.filters.visibility;
  if (visibility) {
    filters.visibility = String(visibility.value) as CategoryVisibility;
  }

  return filters;
}

/**
 * Express handlers for every Category API endpoint. Each method is an
 * `asyncHandler`-wrapped arrow function (bound automatically, so
 * `routes/category.routes.ts` can reference `categoryController.x`
 * directly), and does only three things: read the request, call one
 * `CategoryService` method, and send the response — no business logic
 * lives here. Read endpoints pass `req.user ?? null` through as the
 * actor (populated by `extractCurrentUser`, never `authenticate` — see
 * `routes/category.routes.ts`), since anonymous storefront browsing is
 * a first-class case the service itself scopes down to public data.
 */
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  list = asyncHandler(async (req, res) => {
    const parsed = parseQuery(req.query, {
      sortableFields: CATEGORY_SORTABLE_FIELDS,
      filterableFields: CATEGORY_FILTERABLE_FIELDS,
    });
    const filters = extractFilterOptions(parsed);
    const result = await this.categoryService.list(parsed, filters, req.user ?? null);
    sendPaginatedResponse(res, result.items, result.meta);
  });

  getById = asyncHandler(async (req, res) => {
    const id = requireParam(req, "id");
    const category = await this.categoryService.getById(id, req.user ?? null);
    sendSuccess(res, { category });
  });

  getBySlug = asyncHandler(async (req, res) => {
    const slug = requireParam(req, "slug");
    const category = await this.categoryService.getBySlug(slug, req.user ?? null);
    sendSuccess(res, { category });
  });

  getChildren = asyncHandler(async (req, res) => {
    const id = requireParam(req, "id");
    const children = await this.categoryService.getChildren(id, req.user ?? null);
    sendSuccess(res, { children });
  });

  getTree = asyncHandler(async (req, res) => {
    const tree = await this.categoryService.getTree(req.user ?? null);
    sendSuccess(res, { tree });
  });

  getSubtree = asyncHandler(async (req, res) => {
    const id = requireParam(req, "id");
    const tree = await this.categoryService.getSubtree(id, req.user ?? null);
    sendSuccess(res, { tree });
  });

  create = asyncHandler(async (req, res) => {
    const actor = requireAuthenticatedUser(req);
    const dto = req.body as CreateCategoryDto;
    const category = await this.categoryService.create(dto, actor);
    sendSuccess(res, { category }, { statusCode: HTTP_STATUS.CREATED });
  });

  update = asyncHandler(async (req, res) => {
    const actor = requireAuthenticatedUser(req);
    const id = requireParam(req, "id");
    const dto = req.body as UpdateCategoryDto;
    const category = await this.categoryService.update(id, dto, actor);
    sendSuccess(res, { category });
  });

  updateStatus = asyncHandler(async (req, res) => {
    const actor = requireAuthenticatedUser(req);
    const id = requireParam(req, "id");
    const dto = req.body as UpdateCategoryStatusDto;
    const category = await this.categoryService.updateStatus(id, dto, actor);
    sendSuccess(res, { category });
  });

  updateVisibility = asyncHandler(async (req, res) => {
    const actor = requireAuthenticatedUser(req);
    const id = requireParam(req, "id");
    const dto = req.body as UpdateCategoryVisibilityDto;
    const category = await this.categoryService.updateVisibility(id, dto, actor);
    sendSuccess(res, { category });
  });

  delete = asyncHandler(async (req, res) => {
    const actor = requireAuthenticatedUser(req);
    const id = requireParam(req, "id");
    await this.categoryService.delete(id, actor);
    sendSuccess(res, { message: "Category deleted" });
  });

  restore = asyncHandler(async (req, res) => {
    const actor = requireAuthenticatedUser(req);
    const id = requireParam(req, "id");
    const category = await this.categoryService.restore(id, actor);
    sendSuccess(res, { category });
  });
}
