import type {
  CursorPaginatedResult,
  CursorPaginationParams,
  PaginatedResult,
  ParsedQuery,
} from "../../../common";
import type { ProductStatus, ProductVisibility } from "../constants";
import type { ProductFilterOptions } from "../interfaces";
import type {
  CreateProductInput,
  CreateProductVariantInput,
  Product,
  UpdateProductInput,
  UpsertProductSpecificationInput,
} from "../types";

/** Read options every single-product lookup accepts — `includeDeleted`
 * is only ever honored by the service for a caller with `product:read`
 * (see `service/product.service.ts`), never taken at face value from a
 * request. */
export interface ProductLookupOptions {
  includeDeleted?: boolean;
}

/**
 * Persistence contract for the Product domain entity (plus its
 * transactional creation with initial variants/specifications). The
 * service depends on this interface, never on a concrete implementation
 * directly, so swapping `ProductPrismaRepository` for a test double (or
 * a different persistence layer entirely) never touches service code.
 */
export interface ProductRepository {
  findById(id: string, options?: ProductLookupOptions): Promise<Product | null>;
  findBySlug(slug: string, options?: ProductLookupOptions): Promise<Product | null>;
  findAll(query: ParsedQuery, filters?: ProductFilterOptions): Promise<PaginatedResult<Product>>;
  findAllCursor(
    params: CursorPaginationParams,
    query: Pick<ParsedQuery, "sort" | "search">,
    filters?: ProductFilterOptions,
  ): Promise<CursorPaginatedResult<Product>>;
  /** Checks both `products.sku` and `product_variants.sku` — the two
   * share one identifier namespace (see `prisma/schema.prisma`'s
   * `ProductVariant` doc comment). */
  existsBySku(sku: string): Promise<boolean>;
  existsBySlug(slug: string): Promise<boolean>;
  /**
   * Creates a product and (in the same transaction) its initial
   * variants/specifications, if any — a mid-way failure never leaves an
   * orphaned partial product. `variants`/`specifications` are optional;
   * when both are empty this degrades to a plain single-row insert.
   */
  createWithRelations(
    data: CreateProductInput,
    variants: Omit<CreateProductVariantInput, "productId">[],
    specifications: UpsertProductSpecificationInput[],
  ): Promise<Product>;
  update(id: string, data: UpdateProductInput): Promise<Product>;
  updateStatus(id: string, status: ProductStatus): Promise<Product>;
  updateVisibility(id: string, visibility: ProductVisibility): Promise<Product>;
  /** Soft delete — sets `deletedAt`, never removes the row. */
  softDelete(id: string): Promise<void>;
  /** Reverses `softDelete` — clears `deletedAt`. */
  restore(id: string): Promise<void>;
}
