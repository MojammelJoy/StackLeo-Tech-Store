import type { SearchEntityType } from "../constants";

/**
 * A single cross-entity search result. Deliberately generic — a search
 * across product/category/brand returns one mixed, ranked list of
 * these, discriminated by `entityType`, not three separate typed arrays.
 */
export interface SearchResultItem {
  id: string;
  entityType: SearchEntityType;
  title: string;
  description: string | null;
  imageUrl: string | null;
  /**
   * Relevance score — meaning is provider-specific (a database provider
   * might use a simple match-based score, a full-text provider a
   * `ts_rank` value, a future Meilisearch/Elasticsearch provider its own
   * ranking). Never comparable across providers.
   */
  score: number;
}

export interface SearchSuggestion {
  text: string;
  entityType: SearchEntityType;
  /** How many results this suggestion would currently match, if known. */
  matchCount?: number;
}
