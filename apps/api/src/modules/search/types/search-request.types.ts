import type { FilterParams, PaginationParams, SortParam } from "../../../common";
import type { SearchEntityType } from "../constants";

/**
 * A fully normalized search request — the output of
 * `utils/query-parser.util.ts`'s `buildSearchQuery`, and what
 * `repository/`/`providers/` actually operate on. Pagination/sort/
 * filters reuse `common/`'s own types directly rather than search
 * reinventing near-identical shapes.
 */
export interface SearchQuery {
  keyword: string;
  entityTypes: SearchEntityType[];
  pagination: PaginationParams;
  sort: SortParam[];
  filters: FilterParams;
}

export interface AutocompleteQuery {
  keyword: string;
  entityTypes: SearchEntityType[];
  limit: number;
}
