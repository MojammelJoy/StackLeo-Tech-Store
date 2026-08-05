/**
 * The Search API: request/response types, DTOs + Zod validation
 * schemas (built from reusable field-level schemas in `schemas/`), the
 * repository contract plus its Prisma implementation (querying
 * `Product`/`Category`/`Brand` — no Meilisearch/Elasticsearch/Algolia),
 * the search-provider abstraction (database pattern matching vs.
 * Postgres full-text — see `providers/`), the query-parser/
 * filter-builder/sort-builder utilities that support it all by reusing
 * `common/`'s own pagination/sort/filter primitives, and the
 * controller/routes exposing it at `/api/v1/search`.
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
  SEARCH_VISIBLE_STATUS,
  SEARCH_VISIBLE_VISIBILITY,
} from "./constants";
export type { SearchEntityType, SearchProviderName } from "./constants";

export type {
  AutocompleteQuery,
  EntityVisibilityScope,
  SearchQuery,
  SearchResultItem,
  SearchSuggestion,
} from "./types";

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

export { SearchController } from "./controller";

export { searchRouter } from "./routes";
