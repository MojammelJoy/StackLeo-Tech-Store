import { SEARCH_PROVIDERS } from "../constants";

import type { PaginatedResult } from "../../../common";
import type { SearchRepository } from "../repository";
import type { AutocompleteQuery, SearchQuery, SearchResultItem, SearchSuggestion } from "../types";
import type { SearchProvider } from "./search-provider.interface";

/**
 * `SearchProvider` implementation backed by simple, case-insensitive
 * database pattern matching (`contains`/`ILIKE`) via
 * `SearchRepository.search`/`.suggest`. Simplest of the two
 * database-backed strategies (see `FullTextSearchProvider` for the
 * other), suitable as the default outside production (see
 * `utils/default-provider.util.ts`).
 */
export class DatabaseSearchProvider implements SearchProvider {
  readonly name = SEARCH_PROVIDERS.DATABASE;

  constructor(private readonly searchRepository: SearchRepository) {}

  async search(query: SearchQuery): Promise<PaginatedResult<SearchResultItem>> {
    return this.searchRepository.search(query);
  }

  async suggest(query: AutocompleteQuery): Promise<SearchSuggestion[]> {
    return this.searchRepository.suggest(query);
  }
}
