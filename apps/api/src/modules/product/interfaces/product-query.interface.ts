import type { ProductStatus, ProductVisibility } from "../constants";

/**
 * Product-specific filter criteria, layered on top of `common/`'s
 * generic `ParsedQuery` (pagination/sort/search). Shared between
 * `repository/` (the contract) and `service/` (which additionally
 * enforces `visibility`/`status`/`includeDeleted` for callers without
 * `product:read` — see `service/product.service.ts`'s
 * `applyVisibilityScope`).
 */
export interface ProductFilterOptions {
  categoryId?: string;
  status?: ProductStatus;
  visibility?: ProductVisibility;
  priceMin?: number;
  priceMax?: number;
  tags?: string[];
  /** Only ever honored for a caller with `product:read` — see
   * `service/product.service.ts`. */
  includeDeleted?: boolean;
}
