import type { SearchEntityType } from "../constants";

export interface SearchSuggestionDto {
  text: string;
  entityType: SearchEntityType;
  matchCount?: number;
}
