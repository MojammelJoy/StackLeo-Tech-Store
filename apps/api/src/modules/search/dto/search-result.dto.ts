import type { SearchEntityType } from "../constants";

/** The public-facing shape of a single search result. Built by `mapper/`, never constructed ad hoc. */
export interface SearchResultDto {
  id: string;
  entityType: SearchEntityType;
  title: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  score: number;
}
