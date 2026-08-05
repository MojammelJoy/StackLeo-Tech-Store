import type { PaginatedResult } from "../../../common";
import type { AutocompleteQuery, SearchQuery, SearchResultItem, SearchSuggestion } from "../types";

/**
 * Data-access contract for running a search against the existing
 * database. `providers/`'s database-backed providers (`DatabaseSearchProvider`,
 * `FullTextSearchProvider`) depend on this interface, never on Prisma
 * directly — a future non-database provider (Meilisearch/Elasticsearch)
 * wouldn't implement or depend on this at all, since it queries its own
 * index instead.
 *
 * Exposes two query strategies rather than one: `search`/`suggest` use
 * simple case-insensitive pattern matching (`ILIKE`), what
 * `DatabaseSearchProvider` delegates to; `searchFullText`/
 * `suggestFullText` use Postgres's native `tsvector`/`tsquery`/`ts_rank`
 * full-text search, what `FullTextSearchProvider` delegates to. Both
 * live on one repository (rather than one repository per strategy)
 * since both ultimately query the same `products`/`categories`/`brands`
 * tables in the same database — only the matching/ranking SQL differs.
 */
export interface SearchRepository {
  search(query: SearchQuery): Promise<PaginatedResult<SearchResultItem>>;
  suggest(query: AutocompleteQuery): Promise<SearchSuggestion[]>;
  searchFullText(query: SearchQuery): Promise<PaginatedResult<SearchResultItem>>;
  suggestFullText(query: AutocompleteQuery): Promise<SearchSuggestion[]>;
}
