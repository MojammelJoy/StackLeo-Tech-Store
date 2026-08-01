import type { BrandStatus, BrandVisibility } from "../constants";

/**
 * Brand-specific filter criteria, layered on top of `common/`'s generic
 * `ParsedQuery` (pagination/sort/search). Shared between `repository/`
 * (the contract) and `service/` (which additionally enforces
 * `visibility`/`status`/`includeDeleted` for callers without
 * `brand:read` — see `service/brand.service.ts`'s
 * `scopeFiltersForActor`).
 */
export interface BrandFilterOptions {
  status?: BrandStatus;
  visibility?: BrandVisibility;
  /** Only ever honored for a caller with `brand:read` — see
   * `service/brand.service.ts`. */
  includeDeleted?: boolean;
}
