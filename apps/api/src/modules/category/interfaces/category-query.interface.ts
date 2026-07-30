import type { CategoryStatus } from "../constants";

/**
 * Category-specific filter criteria, layered on top of `common/`'s
 * generic `ParsedQuery` (pagination/sort/search). Shared between
 * `repository/` (the contract) and `service/` (the skeleton) — the
 * reason this lives in its own `interfaces/` folder rather than inside
 * either one.
 */
export interface CategoryFilterOptions {
  parentId?: string;
  status?: CategoryStatus;
}
