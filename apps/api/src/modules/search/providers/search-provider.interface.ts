import type { PaginatedResult } from "../../../common";
import type { SearchProviderName } from "../constants";
import type { AutocompleteQuery, SearchQuery, SearchResultItem, SearchSuggestion } from "../types";

/**
 * The search backend abstraction every concrete provider (database,
 * full-text, and eventually Meilisearch/Elasticsearch) implements.
 * `service/search.service.ts` depends on this interface — via a
 * registry keyed by `SearchProviderName` — never on a concrete provider
 * directly, which is exactly what lets this foundation "support future
 * external search providers": adding one later means adding one more
 * class that satisfies this shape, not touching the service.
 */
export interface SearchProvider {
  readonly name: SearchProviderName;
  search(query: SearchQuery): Promise<PaginatedResult<SearchResultItem>>;
  suggest(query: AutocompleteQuery): Promise<SearchSuggestion[]>;
}
