import type { SearchResultDto, SearchSuggestionDto } from "../dto";
import type { SearchMapper } from "../interfaces";
import type { SearchResultItem, SearchSuggestion } from "../types";

function toResultDto(item: SearchResultItem): SearchResultDto {
  return {
    id: item.id,
    entityType: item.entityType,
    title: item.title,
    description: item.description,
    imageUrl: item.imageUrl,
    score: item.score,
  };
}

function toResultList(items: SearchResultItem[]): SearchResultDto[] {
  return items.map(toResultDto);
}

function toSuggestionDto(suggestion: SearchSuggestion): SearchSuggestionDto {
  return {
    text: suggestion.text,
    entityType: suggestion.entityType,
    matchCount: suggestion.matchCount,
  };
}

/**
 * The only place a `SearchResultItem`/`SearchSuggestion` is converted to
 * its public response DTO shape — callers map through this instead of
 * building either DTO by hand.
 */
export const searchMapper: SearchMapper = { toResultDto, toResultList, toSuggestionDto };
