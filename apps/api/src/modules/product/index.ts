/**
 * The Product API: create/update/delete (soft)/restore, get by id/slug,
 * list (page or cursor pagination, filtering, sorting, search),
 * variants, specifications, status/visibility transitions, tags, and
 * SEO metadata — a real, working feature, not reusable-infrastructure-
 * only scaffolding. Built on `common/`, `database/`, `logger/`,
 * `errors/`, and `modules/rbac` (permission-gating every mutation).
 * Deliberately excludes category/brand CRUD, inventory management, and
 * every other domain's business logic (cart, wishlist, reviews, orders,
 * payment) — those stay out of this module.
 */
export {
  PRODUCT_CURRENCY_CODE_LENGTH,
  PRODUCT_DESCRIPTION_MAX_LENGTH,
  PRODUCT_FILTERABLE_FIELDS,
  PRODUCT_MAX_SEO_KEYWORDS,
  PRODUCT_MAX_SPECIFICATIONS,
  PRODUCT_MAX_TAGS,
  PRODUCT_NAME_MAX_LENGTH,
  PRODUCT_NAME_MIN_LENGTH,
  PRODUCT_PRICE_MIN,
  PRODUCT_SEO_DESCRIPTION_MAX_LENGTH,
  PRODUCT_SEO_KEYWORD_MAX_LENGTH,
  PRODUCT_SEO_TITLE_MAX_LENGTH,
  PRODUCT_SKU_MAX_LENGTH,
  PRODUCT_SLUG_MAX_LENGTH,
  PRODUCT_SORTABLE_FIELDS,
  PRODUCT_SPECIFICATION_KEY_MAX_LENGTH,
  PRODUCT_SPECIFICATION_VALUE_MAX_LENGTH,
  PRODUCT_STATUSES,
  PRODUCT_TAG_MAX_LENGTH,
  PRODUCT_VARIANT_NAME_MAX_LENGTH,
  PRODUCT_VARIANT_SKU_MAX_LENGTH,
  PRODUCT_VISIBILITIES,
} from "./constants";
export type { ProductStatus, ProductVisibility } from "./constants";

export type {
  CreateProductInput,
  CreateProductVariantInput,
  Product,
  ProductSpecification,
  ProductVariant,
  UpdateProductInput,
  UpdateProductStatusInput,
  UpdateProductVariantInput,
  UpdateProductVisibilityInput,
  UpsertProductSpecificationInput,
} from "./types";

export {
  createProductSchema,
  createProductVariantSchema,
  productIdParamsSchema,
  productSlugParamsSchema,
  productSpecificationItemSchema,
  productVariantAttributesSchema,
  productVariantParamsSchema,
  replaceProductSpecificationsSchema,
  updateProductSchema,
  updateProductStatusSchema,
  updateProductVariantSchema,
  updateProductVisibilitySchema,
} from "./validation";

export type {
  CreateProductDto,
  CreateProductVariantDto,
  ProductResponseDto,
  ProductSpecificationResponseDto,
  ProductSummaryResponseDto,
  ProductVariantResponseDto,
  ReplaceProductSpecificationsDto,
  UpdateProductDto,
  UpdateProductStatusDto,
  UpdateProductVariantDto,
  UpdateProductVisibilityDto,
} from "./dto";

export type { ProductFilterOptions, ProductMapper } from "./interfaces";

export { productMapper } from "./mapper";

export { generateUniqueSlug, slugify } from "./utils";

export type {
  ProductLookupOptions,
  ProductRepository,
  ProductSpecificationRepository,
  ProductVariantRepository,
} from "./repository";
export {
  ProductPrismaRepository,
  ProductSpecificationPrismaRepository,
  ProductVariantPrismaRepository,
} from "./repository";

export { ProductService } from "./service";

export { ProductController } from "./controller";

export { productRouter } from "./routes";
