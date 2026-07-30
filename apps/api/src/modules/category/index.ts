/**
 * Reusable category infrastructure: domain types, DTOs + Zod validation
 * schemas, the repository contract (plus its currently-skeletal Prisma
 * implementation), a skeleton service, and the mapper between the
 * domain entity and its response DTO. No controllers, routes, CRUD
 * implementation, or business logic (brand/inventory/order/payment
 * concerns, or product business logic) live here.
 */
export {
  CATEGORY_DESCRIPTION_MAX_LENGTH,
  CATEGORY_FILTERABLE_FIELDS,
  CATEGORY_NAME_MAX_LENGTH,
  CATEGORY_NAME_MIN_LENGTH,
  CATEGORY_SLUG_MAX_LENGTH,
  CATEGORY_SLUG_PATTERN,
  CATEGORY_SORTABLE_FIELDS,
  CATEGORY_STATUSES,
} from "./constants";
export type { CategoryStatus } from "./constants";

export type { Category, CreateCategoryInput, UpdateCategoryInput } from "./types";

export { createCategorySchema, updateCategorySchema } from "./validation";
export type { CategoryResponseDto, CreateCategoryDto, UpdateCategoryDto } from "./dto";

export type { CategoryFilterOptions, CategoryMapper } from "./interfaces";

export { categoryMapper } from "./mapper";

export type { CategoryRepository } from "./repository";
export { CategoryPrismaRepository } from "./repository";

export { CategoryService } from "./service";
