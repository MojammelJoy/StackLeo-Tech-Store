/**
 * Reusable product infrastructure: domain types, DTOs + Zod validation
 * schemas, the repository contract (plus its currently-skeletal Prisma
 * implementation), a skeleton service, and the mapper between the
 * domain entity and its response DTO. No controllers, routes, CRUD
 * implementation, or business logic (pricing rules, category/brand/
 * inventory/order/payment concerns) live here.
 */
export {
  PRODUCT_CURRENCY_CODE_LENGTH,
  PRODUCT_DESCRIPTION_MAX_LENGTH,
  PRODUCT_FILTERABLE_FIELDS,
  PRODUCT_NAME_MAX_LENGTH,
  PRODUCT_NAME_MIN_LENGTH,
  PRODUCT_PRICE_MIN,
  PRODUCT_SKU_MAX_LENGTH,
  PRODUCT_SORTABLE_FIELDS,
  PRODUCT_STATUSES,
} from "./constants";
export type { ProductStatus } from "./constants";

export type { CreateProductInput, Product, UpdateProductInput } from "./types";

export { createProductSchema, updateProductSchema } from "./validation";
export type { CreateProductDto, ProductResponseDto, UpdateProductDto } from "./dto";

export type { ProductFilterOptions, ProductMapper } from "./interfaces";

export { productMapper } from "./mapper";

export type { ProductRepository } from "./repository";
export { ProductPrismaRepository } from "./repository";

export { ProductService } from "./service";
