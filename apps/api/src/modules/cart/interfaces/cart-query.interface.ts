import type { CartStatus } from "../constants";

/**
 * Cart-specific filter criteria, layered on top of `common/`'s generic
 * `ParsedQuery` (pagination/sort/search) — for a future admin-facing
 * cart listing. Shared between `repository/` (the contract) and
 * `service/` (the skeleton) — the reason this lives in its own
 * `interfaces/` folder rather than inside either one.
 */
export interface CartFilterOptions {
  userId?: string;
  status?: CartStatus;
}
