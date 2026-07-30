import type { SearchEntityType } from "../constants";

/**
 * The shape any entity must be reducible to in order to be searchable —
 * what a future indexing pipeline (populating a full-text index, or a
 * future Meilisearch/Elasticsearch collection) would produce from a
 * Product/Category/Brand row. `SearchResultItem` (see
 * `types/search-response.types.ts`) is this shape plus a query-time
 * `score` — the two are kept as separate interfaces rather than one
 * extending the other, since `searchableText` (bulk text meant only for
 * matching against) has no business appearing in a returned result.
 */
export interface SearchableDocument {
  id: string;
  entityType: SearchEntityType;
  title: string;
  description: string | null;
  imageUrl: string | null;
  /** Additional free-text content to match against — e.g. a product's full description or tags — not necessarily shown in results. */
  searchableText: string;
}
