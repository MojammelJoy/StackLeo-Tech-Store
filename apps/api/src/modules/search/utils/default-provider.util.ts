import { config } from "../../../config";
import { SEARCH_PROVIDERS } from "../constants";

import type { SearchProviderName } from "../constants";

/**
 * The provider a caller should default to when none is explicitly
 * selected. Full-text search (Postgres `tsvector`/`tsquery`) scales
 * better under real traffic than simple pattern matching; the simpler
 * database provider is fine — and easier to reason about in tests —
 * outside production. Mirrors the same prod-vs-dev split
 * `modules/brand`, `modules/inventory`, and `modules/media` already use
 * elsewhere in this app.
 */
export function getDefaultSearchProvider(): SearchProviderName {
  return config.isProduction ? SEARCH_PROVIDERS.FULL_TEXT : SEARCH_PROVIDERS.DATABASE;
}
