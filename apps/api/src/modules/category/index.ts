/**
 * The Category API: create/update/delete (soft, cascading)/restore
 * (cascading), get by id/slug, list (pagination, filtering, sorting,
 * search), children lookup, the full tree/subtree, status/visibility
 * transitions, ordering, and SEO metadata — a real, working feature,
 * not reusable-infrastructure-only scaffolding. Built on `common/`,
 * `database/`, `logger/`, `errors/`, and `modules/rbac`
 * (permission-gating every mutation). Deliberately excludes product/
 * brand CRUD, inventory, and every other domain's business logic (cart,
 * wishlist, reviews, orders, payment) — those stay out of this module.
 */
export {
  CATEGORY_DESCRIPTION_MAX_LENGTH,
  CATEGORY_FILTERABLE_FIELDS,
  CATEGORY_MAX_DEPTH,
  CATEGORY_MAX_SEO_KEYWORDS,
  CATEGORY_NAME_MAX_LENGTH,
  CATEGORY_NAME_MIN_LENGTH,
  CATEGORY_SEO_DESCRIPTION_MAX_LENGTH,
  CATEGORY_SEO_KEYWORD_MAX_LENGTH,
  CATEGORY_SEO_TITLE_MAX_LENGTH,
  CATEGORY_SLUG_MAX_LENGTH,
  CATEGORY_SLUG_PATTERN,
  CATEGORY_SORTABLE_FIELDS,
  CATEGORY_STATUSES,
  CATEGORY_VISIBILITIES,
} from "./constants";
export type { CategoryStatus, CategoryVisibility } from "./constants";

export type {
  Category,
  CategoryNode,
  CreateCategoryInput,
  UpdateCategoryInput,
  UpdateCategoryStatusInput,
  UpdateCategoryVisibilityInput,
} from "./types";

export {
  categoryIdParamsSchema,
  categorySlugParamsSchema,
  createCategorySchema,
  updateCategorySchema,
  updateCategoryStatusSchema,
  updateCategoryVisibilitySchema,
} from "./validation";

export type {
  CategoryResponseDto,
  CategoryTreeResponseDto,
  CreateCategoryDto,
  UpdateCategoryDto,
  UpdateCategoryStatusDto,
  UpdateCategoryVisibilityDto,
} from "./dto";

export type { CategoryFilterOptions, CategoryMapper } from "./interfaces";

export { categoryMapper } from "./mapper";

export {
  buildCategoryForest,
  buildCategorySubtree,
  collectDescendantIds,
  generateUniqueSlug,
  slugify,
} from "./utils";

export type { CategoryLookupOptions, CategoryRepository } from "./repository";
export { CategoryPrismaRepository } from "./repository";

export { CategoryService } from "./service";

export { CategoryController } from "./controller";

export { categoryRouter } from "./routes";
