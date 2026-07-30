import { NotImplementedError } from "../../../errors";
import { SEARCH_PROVIDERS } from "../constants";

import type { PaginatedResult } from "../../../common";
import type { SearchRepository } from "../repository";
import type { AutocompleteQuery, SearchQuery, SearchResultItem, SearchSuggestion } from "../types";
import type { SearchProvider } from "./search-provider.interface";

/**
 * `SearchProvider` implementation backed by simple database pattern
 * matching (e.g. `ILIKE`) via `SearchRepository` — currently a
 * skeleton. Every method throws `NotImplementedError` rather than
 * calling `searchRepository`; simplest of the two database-backed
 * strategies (see `FullTextSearchProvider` for the other), suitable as
 * the default outside production (see
 * `utils/default-provider.util.ts`).
 */
export class DatabaseSearchProvider implements SearchProvider {
  readonly name = SEARCH_PROVIDERS.DATABASE;

  constructor(private readonly searchRepository: SearchRepository) {}

  async search(_query: SearchQuery): Promise<PaginatedResult<SearchResultItem>> {
    throw new NotImplementedError("DatabaseSearchProvider.search is not implemented yet");
  }

  async suggest(_query: AutocompleteQuery): Promise<SearchSuggestion[]> {
    throw new NotImplementedError("DatabaseSearchProvider.suggest is not implemented yet");
  }
}
