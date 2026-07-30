import type { PaginatedResult } from "../../../common";
import type { AutocompleteQuery, SearchQuery, SearchResultItem, SearchSuggestion } from "../types";

/**
 * Data-access contract for running a search against the existing
 * database. `providers/`'s database-backed providers (`DatabaseSearchProvider`,
 * `FullTextSearchProvider`) depend on this interface, never on Prisma
 * directly — a future non-database provider (Meilisearch/Elasticsearch)
 * wouldn't implement or depend on this at all, since it queries its own
 * index instead.
 */
export interface SearchRepository {
  search(query: SearchQuery): Promise<PaginatedResult<SearchResultItem>>;
  suggest(query: AutocompleteQuery): Promise<SearchSuggestion[]>;
}
