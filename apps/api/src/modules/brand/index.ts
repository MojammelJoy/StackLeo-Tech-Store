/**
 * Reusable brand infrastructure: domain types, DTOs + Zod validation
 * schemas (built from reusable field-level schemas in `schemas/`), the
 * repository contract (plus its currently-skeletal Prisma
 * implementation), a skeleton service, and the mapper between the
 * domain entity and its response DTO. No controllers, routes, CRUD
 * implementation, or business logic (category/product/inventory/
 * payment concerns) live here.
 */
export {
  BRAND_DESCRIPTION_MAX_LENGTH,
  BRAND_FILTERABLE_FIELDS,
  BRAND_NAME_MAX_LENGTH,
  BRAND_NAME_MIN_LENGTH,
  BRAND_SLUG_MAX_LENGTH,
  BRAND_SLUG_PATTERN,
  BRAND_SORTABLE_FIELDS,
  BRAND_STATUSES,
  BRAND_URL_MAX_LENGTH,
} from "./constants";
export type { BrandStatus } from "./constants";

export type { Brand, CreateBrandInput, UpdateBrandInput } from "./types";

export { brandNameSchema, brandSlugSchema, brandUrlSchema } from "./schemas";

export { createBrandSchema, updateBrandSchema } from "./validation";
export type { BrandResponseDto, CreateBrandDto, UpdateBrandDto } from "./dto";

export type { BrandFilterOptions, BrandMapper } from "./interfaces";

export { brandMapper } from "./mapper";

export { BrandPrismaRepository } from "./repository";
export type { BrandRepository } from "./repository";

export { BrandService } from "./service";
