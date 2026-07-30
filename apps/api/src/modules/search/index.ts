/**
 * Reusable search infrastructure: request/response types, DTOs + Zod
 * validation schemas (built from reusable field-level schemas in
 * `schemas/`), the repository contract (plus its currently-skeletal
 * Prisma implementation), a skeleton service, the search-provider
 * abstraction (database/full-text skeletons — see `providers/`), and
 * the query-parser/filter-builder/sort-builder utilities that support
 * it all by reusing `common/`'s own pagination/sort/filter primitives.
 * No controllers, routes, actual database queries, or Meilisearch/
 * Elasticsearch integration live here.
 */
export {
  AUTOCOMPLETE_KEYWORD_MIN_LENGTH,
  AUTOCOMPLETE_MAX_SUGGESTIONS,
  SEARCH_DEFAULT_ENTITY_TYPES,
  SEARCH_ENTITY_TYPES,
  SEARCH_FILTERABLE_FIELDS_BY_ENTITY,
  SEARCH_KEYWORD_MAX_LENGTH,
  SEARCH_KEYWORD_MIN_LENGTH,
  SEARCH_PROVIDERS,
  SEARCH_SORTABLE_FIELDS_BY_ENTITY,
} from "./constants";
export type { SearchEntityType, SearchProviderName } from "./constants";

export type { AutocompleteQuery, SearchQuery, SearchResultItem, SearchSuggestion } from "./types";

export { entityTypeSchema, keywordSchema } from "./schemas";

export { autocompleteQuerySchema, searchQuerySchema } from "./validation";
export type {
  AutocompleteQueryDto,
  SearchQueryDto,
  SearchResultDto,
  SearchSuggestionDto,
} from "./dto";

export type { SearchableDocument, SearchMapper } from "./interfaces";

export { DatabaseSearchProvider, FullTextSearchProvider } from "./providers";
export type { SearchProvider } from "./providers";

export {
  buildSearchFilters,
  buildSearchQuery,
  buildSearchSort,
  getDefaultSearchProvider,
} from "./utils";

export { searchMapper } from "./mapper";

export { SearchPrismaRepository } from "./repository";
export type { SearchRepository } from "./repository";

export { SearchService } from "./service";
