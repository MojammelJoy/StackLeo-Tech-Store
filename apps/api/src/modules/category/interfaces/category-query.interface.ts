import type { CategoryStatus, CategoryVisibility } from "../constants";

/**
 * Category-specific filter criteria, layered on top of `common/`'s
 * generic `ParsedQuery` (pagination/sort/search). Shared between
 * `repository/` (the contract) and `service/` (which additionally
 * enforces `visibility`/`status`/`includeDeleted` for callers without
 * `category:read` — see `service/category.service.ts`'s
 * `scopeFiltersForActor`).
 */
export interface CategoryFilterOptions {
  parentId?: string;
  status?: CategoryStatus;
  visibility?: CategoryVisibility;
  /** Only ever honored for a caller with `category:read` — see
   * `service/category.service.ts`. */
  includeDeleted?: boolean;
}
