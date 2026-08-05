import { SEARCH_PROVIDERS } from "../constants";

import type { PaginatedResult } from "../../../common";
import type { SearchRepository } from "../repository";
import type { AutocompleteQuery, SearchQuery, SearchResultItem, SearchSuggestion } from "../types";
import type { SearchProvider } from "./search-provider.interface";

/**
 * `SearchProvider` implementation backed by Postgres's native full-text
 * search (`tsvector`/`plainto_tsquery`/`ts_rank`) via
 * `SearchRepository.searchFullText`/`.suggestFullText`. Still entirely
 * within the existing database (no external search engine), just a
 * more relevance-aware strategy than `DatabaseSearchProvider`'s simple
 * pattern matching; preferred in production (see
 * `utils/default-provider.util.ts`).
 */
export class FullTextSearchProvider implements SearchProvider {
  readonly name = SEARCH_PROVIDERS.FULL_TEXT;

  constructor(private readonly searchRepository: SearchRepository) {}

  async search(query: SearchQuery): Promise<PaginatedResult<SearchResultItem>> {
    return this.searchRepository.searchFullText(query);
  }

  async suggest(query: AutocompleteQuery): Promise<SearchSuggestion[]> {
    return this.searchRepository.suggestFullText(query);
  }
}
