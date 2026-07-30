import type { SearchResultDto, SearchSuggestionDto } from "../dto";
import type { SearchResultItem, SearchSuggestion } from "../types";

/**
 * Contract `mapper/search.mapper.ts` implements. Kept separate from
 * `mapper/` itself (mirroring `repository/`'s interface-vs-implementation
 * split) so a future alternate mapper — or a test double — can satisfy
 * the same shape without depending on the concrete implementation.
 */
export interface SearchMapper {
  toResultDto(item: SearchResultItem): SearchResultDto;
  toResultList(items: SearchResultItem[]): SearchResultDto[];
  toSuggestionDto(suggestion: SearchSuggestion): SearchSuggestionDto;
}
