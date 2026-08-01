/**
 * The Brand API: create/update/delete (soft)/restore, get by id/slug,
 * list (pagination, filtering, sorting, search), status/visibility
 * transitions, logo metadata, and SEO metadata — a real, working
 * feature, not reusable-infrastructure-only scaffolding. Built on
 * `common/`, `database/`, `logger/`, `errors/`, and `modules/rbac`
 * (permission-gating every mutation). Deliberately excludes product/
 * category CRUD, inventory, media upload, and every other domain's
 * business logic (cart, wishlist, reviews, orders, payment) — those
 * stay out of this module.
 */
export {
  BRAND_DESCRIPTION_MAX_LENGTH,
  BRAND_FILTERABLE_FIELDS,
  BRAND_LOGO_ALT_TEXT_MAX_LENGTH,
  BRAND_MAX_SEO_KEYWORDS,
  BRAND_NAME_MAX_LENGTH,
  BRAND_NAME_MIN_LENGTH,
  BRAND_SEO_DESCRIPTION_MAX_LENGTH,
  BRAND_SEO_KEYWORD_MAX_LENGTH,
  BRAND_SEO_TITLE_MAX_LENGTH,
  BRAND_SLUG_MAX_LENGTH,
  BRAND_SLUG_PATTERN,
  BRAND_SORTABLE_FIELDS,
  BRAND_STATUSES,
  BRAND_URL_MAX_LENGTH,
  BRAND_VISIBILITIES,
} from "./constants";
export type { BrandStatus, BrandVisibility } from "./constants";

export type {
  Brand,
  CreateBrandInput,
  UpdateBrandInput,
  UpdateBrandLogoInput,
  UpdateBrandStatusInput,
  UpdateBrandVisibilityInput,
} from "./types";

export { brandNameSchema, brandSlugSchema, brandUrlSchema } from "./schemas";

export {
  brandIdParamsSchema,
  brandSlugParamsSchema,
  createBrandSchema,
  updateBrandSchema,
  updateBrandLogoSchema,
  updateBrandStatusSchema,
  updateBrandVisibilitySchema,
} from "./validation";

export type {
  BrandResponseDto,
  CreateBrandDto,
  UpdateBrandDto,
  UpdateBrandLogoDto,
  UpdateBrandStatusDto,
  UpdateBrandVisibilityDto,
} from "./dto";

export type { BrandFilterOptions, BrandMapper } from "./interfaces";

export { brandMapper } from "./mapper";

export { generateUniqueSlug, slugify } from "./utils";

export type { BrandLookupOptions, BrandRepository } from "./repository";
export { BrandPrismaRepository } from "./repository";

export { BrandService } from "./service";

export { BrandController } from "./controller";

export { brandRouter } from "./routes";
