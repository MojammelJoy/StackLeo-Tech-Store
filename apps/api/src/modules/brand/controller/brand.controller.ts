import { HTTP_STATUS, parseQuery, sendPaginatedResponse, sendSuccess } from "../../../common";
import { BadRequestError, UnauthorizedError } from "../../../errors";
import { asyncHandler } from "../../../utils";
import { BRAND_FILTERABLE_FIELDS, BRAND_SORTABLE_FIELDS } from "../constants";

import type { AuthenticatedUser } from "../../../auth";
import type { ParsedQuery } from "../../../common";
import type { BrandStatus, BrandVisibility } from "../constants";
import type {
  CreateBrandDto,
  UpdateBrandDto,
  UpdateBrandLogoDto,
  UpdateBrandStatusDto,
  UpdateBrandVisibilityDto,
} from "../dto";
import type { BrandFilterOptions } from "../interfaces";
import type { BrandService } from "../service";
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

/** Combines `common/`'s generic `parsed.filters` (status/visibility)
 * into one typed `BrandFilterOptions` the service can enforce
 * visibility rules on top of — mirrors `modules/product`/
 * `modules/category`'s `extractFilterOptions`. */
function extractFilterOptions(parsed: ParsedQuery): BrandFilterOptions {
  const filters: BrandFilterOptions = {};

  const status = parsed.filters.status;
  if (status) {
    filters.status = String(status.value) as BrandStatus;
  }

  const visibility = parsed.filters.visibility;
  if (visibility) {
    filters.visibility = String(visibility.value) as BrandVisibility;
  }

  return filters;
}

/**
 * Express handlers for every Brand API endpoint. Each method is an
 * `asyncHandler`-wrapped arrow function (bound automatically, so
 * `routes/brand.routes.ts` can reference `brandController.x` directly),
 * and does only three things: read the request, call one `BrandService`
 * method, and send the response — no business logic lives here. Read
 * endpoints pass `req.user ?? null` through as the actor (populated by
 * `extractCurrentUser`, never `authenticate` — see
 * `routes/brand.routes.ts`), since anonymous storefront browsing is a
 * first-class case the service itself scopes down to public data.
 */
export class BrandController {
  constructor(private readonly brandService: BrandService) {}

  list = asyncHandler(async (req, res) => {
    const parsed = parseQuery(req.query, {
      sortableFields: BRAND_SORTABLE_FIELDS,
      filterableFields: BRAND_FILTERABLE_FIELDS,
    });
    const filters = extractFilterOptions(parsed);
    const result = await this.brandService.list(parsed, filters, req.user ?? null);
    sendPaginatedResponse(res, result.items, result.meta);
  });

  getById = asyncHandler(async (req, res) => {
    const id = requireParam(req, "id");
    const brand = await this.brandService.getById(id, req.user ?? null);
    sendSuccess(res, { brand });
  });

  getBySlug = asyncHandler(async (req, res) => {
    const slug = requireParam(req, "slug");
    const brand = await this.brandService.getBySlug(slug, req.user ?? null);
    sendSuccess(res, { brand });
  });

  create = asyncHandler(async (req, res) => {
    const actor = requireAuthenticatedUser(req);
    const dto = req.body as CreateBrandDto;
    const brand = await this.brandService.create(dto, actor);
    sendSuccess(res, { brand }, { statusCode: HTTP_STATUS.CREATED });
  });

  update = asyncHandler(async (req, res) => {
    const actor = requireAuthenticatedUser(req);
    const id = requireParam(req, "id");
    const dto = req.body as UpdateBrandDto;
    const brand = await this.brandService.update(id, dto, actor);
    sendSuccess(res, { brand });
  });

  updateStatus = asyncHandler(async (req, res) => {
    const actor = requireAuthenticatedUser(req);
    const id = requireParam(req, "id");
    const dto = req.body as UpdateBrandStatusDto;
    const brand = await this.brandService.updateStatus(id, dto, actor);
    sendSuccess(res, { brand });
  });

  updateVisibility = asyncHandler(async (req, res) => {
    const actor = requireAuthenticatedUser(req);
    const id = requireParam(req, "id");
    const dto = req.body as UpdateBrandVisibilityDto;
    const brand = await this.brandService.updateVisibility(id, dto, actor);
    sendSuccess(res, { brand });
  });

  updateLogo = asyncHandler(async (req, res) => {
    const actor = requireAuthenticatedUser(req);
    const id = requireParam(req, "id");
    const dto = req.body as UpdateBrandLogoDto;
    const brand = await this.brandService.updateLogo(id, dto, actor);
    sendSuccess(res, { brand });
  });

  delete = asyncHandler(async (req, res) => {
    const actor = requireAuthenticatedUser(req);
    const id = requireParam(req, "id");
    await this.brandService.delete(id, actor);
    sendSuccess(res, { message: "Brand deleted" });
  });

  restore = asyncHandler(async (req, res) => {
    const actor = requireAuthenticatedUser(req);
    const id = requireParam(req, "id");
    const brand = await this.brandService.restore(id, actor);
    sendSuccess(res, { brand });
  });
}
