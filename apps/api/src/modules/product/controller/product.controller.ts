import {
  HTTP_STATUS,
  QUERY_PARAM_KEYS,
  parseCursorPaginationParams,
  parseQuery,
  sendPaginatedResponse,
  sendSuccess,
} from "../../../common";
import { BadRequestError, UnauthorizedError } from "../../../errors";
import { asyncHandler } from "../../../utils";
import { PRODUCT_FILTERABLE_FIELDS, PRODUCT_SORTABLE_FIELDS } from "../constants";

import type { AuthenticatedUser } from "../../../auth";
import type { ParsedQuery } from "../../../common";
import type { ProductStatus, ProductVisibility } from "../constants";
import type {
  CreateProductDto,
  CreateProductVariantDto,
  ReplaceProductSpecificationsDto,
  UpdateProductDto,
  UpdateProductStatusDto,
  UpdateProductVariantDto,
  UpdateProductVisibilityDto,
} from "../dto";
import type { ProductFilterOptions } from "../interfaces";
import type { ProductService } from "../service";
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

function toFiniteNumber(value: unknown): number | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : undefined;
}

/** Combines `common/`'s generic `parsed.filters` (categoryId/status/
 * visibility/tags) with the dedicated `priceMin`/`priceMax` query
 * params (see `constants/product.constants.ts`'s doc comment on
 * `PRODUCT_FILTERABLE_FIELDS` for why price needs its own params)
 * into one typed `ProductFilterOptions` the service can enforce
 * visibility rules on top of. */
function extractFilterOptions(
  parsed: ParsedQuery,
  rawQuery: Request["query"],
): ProductFilterOptions {
  const filters: ProductFilterOptions = {};

  const categoryId = parsed.filters.categoryId;
  if (categoryId) {
    filters.categoryId = String(categoryId.value);
  }

  const status = parsed.filters.status;
  if (status) {
    filters.status = String(status.value) as ProductStatus;
  }

  const visibility = parsed.filters.visibility;
  if (visibility) {
    filters.visibility = String(visibility.value) as ProductVisibility;
  }

  const tags = parsed.filters.tags;
  if (tags) {
    filters.tags = Array.isArray(tags.value) ? tags.value.map(String) : [String(tags.value)];
  }

  const priceMin = toFiniteNumber(rawQuery.priceMin);
  if (priceMin !== undefined) {
    filters.priceMin = priceMin;
  }

  const priceMax = toFiniteNumber(rawQuery.priceMax);
  if (priceMax !== undefined) {
    filters.priceMax = priceMax;
  }

  if (rawQuery.includeDeleted === "true") {
    filters.includeDeleted = true;
  }

  return filters;
}

/**
 * Express handlers for every Product API endpoint. Each method is an
 * `asyncHandler`-wrapped arrow function (bound automatically, so
 * `routes/product.routes.ts` can reference `productController.x`
 * directly), and does only three things: read the request, call one
 * `ProductService` method, and send the response — no business logic
 * lives here. Read endpoints pass `req.user ?? null` through as the
 * actor (populated by `extractCurrentUser`, never `authenticate` — see
 * `routes/product.routes.ts`), since anonymous storefront browsing is
 * a first-class case the service itself scopes down to public data.
 */
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  list = asyncHandler(async (req, res) => {
    const parsed = parseQuery(req.query, {
      sortableFields: PRODUCT_SORTABLE_FIELDS,
      filterableFields: PRODUCT_FILTERABLE_FIELDS,
    });
    const filters = extractFilterOptions(parsed, req.query);
    const actor = req.user ?? null;

    if (req.query[QUERY_PARAM_KEYS.PAGINATION_TYPE] === "cursor") {
      const cursorParams = parseCursorPaginationParams(req.query);
      const result = await this.productService.listCursor(
        cursorParams,
        { sort: parsed.sort, search: parsed.search },
        filters,
        actor,
      );
      sendSuccess(res, { items: result.items, meta: result.meta });
      return;
    }

    const result = await this.productService.list(parsed, filters, actor);
    sendPaginatedResponse(res, result.items, result.meta);
  });

  getById = asyncHandler(async (req, res) => {
    const id = requireParam(req, "id");
    const product = await this.productService.getById(id, req.user ?? null);
    sendSuccess(res, { product });
  });

  getBySlug = asyncHandler(async (req, res) => {
    const slug = requireParam(req, "slug");
    const product = await this.productService.getBySlug(slug, req.user ?? null);
    sendSuccess(res, { product });
  });

  create = asyncHandler(async (req, res) => {
    const actor = requireAuthenticatedUser(req);
    const dto = req.body as CreateProductDto;
    const product = await this.productService.create(dto, actor);
    sendSuccess(res, { product }, { statusCode: HTTP_STATUS.CREATED });
  });

  update = asyncHandler(async (req, res) => {
    const actor = requireAuthenticatedUser(req);
    const id = requireParam(req, "id");
    const dto = req.body as UpdateProductDto;
    const product = await this.productService.update(id, dto, actor);
    sendSuccess(res, { product });
  });

  updateStatus = asyncHandler(async (req, res) => {
    const actor = requireAuthenticatedUser(req);
    const id = requireParam(req, "id");
    const dto = req.body as UpdateProductStatusDto;
    const product = await this.productService.updateStatus(id, dto, actor);
    sendSuccess(res, { product });
  });

  updateVisibility = asyncHandler(async (req, res) => {
    const actor = requireAuthenticatedUser(req);
    const id = requireParam(req, "id");
    const dto = req.body as UpdateProductVisibilityDto;
    const product = await this.productService.updateVisibility(id, dto, actor);
    sendSuccess(res, { product });
  });

  delete = asyncHandler(async (req, res) => {
    const actor = requireAuthenticatedUser(req);
    const id = requireParam(req, "id");
    await this.productService.delete(id, actor);
    sendSuccess(res, { message: "Product deleted" });
  });

  restore = asyncHandler(async (req, res) => {
    const actor = requireAuthenticatedUser(req);
    const id = requireParam(req, "id");
    const product = await this.productService.restore(id, actor);
    sendSuccess(res, { product });
  });

  addVariant = asyncHandler(async (req, res) => {
    const actor = requireAuthenticatedUser(req);
    const id = requireParam(req, "id");
    const dto = req.body as CreateProductVariantDto;
    const variant = await this.productService.addVariant(id, dto, actor);
    sendSuccess(res, { variant }, { statusCode: HTTP_STATUS.CREATED });
  });

  updateVariant = asyncHandler(async (req, res) => {
    const actor = requireAuthenticatedUser(req);
    const id = requireParam(req, "id");
    const variantId = requireParam(req, "variantId");
    const dto = req.body as UpdateProductVariantDto;
    const variant = await this.productService.updateVariant(id, variantId, dto, actor);
    sendSuccess(res, { variant });
  });

  removeVariant = asyncHandler(async (req, res) => {
    const actor = requireAuthenticatedUser(req);
    const id = requireParam(req, "id");
    const variantId = requireParam(req, "variantId");
    await this.productService.removeVariant(id, variantId, actor);
    sendSuccess(res, { message: "Product variant removed" });
  });

  replaceSpecifications = asyncHandler(async (req, res) => {
    const actor = requireAuthenticatedUser(req);
    const id = requireParam(req, "id");
    const dto = req.body as ReplaceProductSpecificationsDto;
    const specifications = await this.productService.replaceSpecifications(id, dto, actor);
    sendSuccess(res, { specifications });
  });
}
