import { NotImplementedError } from "../../../errors";
import { SEARCH_PROVIDERS } from "../constants";

import type { PaginatedResult } from "../../../common";
import type { SearchRepository } from "../repository";
import type { AutocompleteQuery, SearchQuery, SearchResultItem, SearchSuggestion } from "../types";
import type { SearchProvider } from "./search-provider.interface";

/**
 * `SearchProvider` implementation backed by Postgres's native full-text
 * search (`tsvector`/`tsquery`/`ts_rank`) via `SearchRepository` —
 * currently a skeleton. Still entirely within the existing database
 * (no external search engine), just a more relevance-aware strategy
 * than `DatabaseSearchProvider`'s simple pattern matching; preferred in
 * production (see `utils/default-provider.util.ts`).
 */
export class FullTextSearchProvider implements SearchProvider {
  readonly name = SEARCH_PROVIDERS.FULL_TEXT;

  constructor(private readonly searchRepository: SearchRepository) {}

  async search(_query: SearchQuery): Promise<PaginatedResult<SearchResultItem>> {
    throw new NotImplementedError("FullTextSearchProvider.search is not implemented yet");
  }

  async suggest(_query: AutocompleteQuery): Promise<SearchSuggestion[]> {
    throw new NotImplementedError("FullTextSearchProvider.suggest is not implemented yet");
  }
}
