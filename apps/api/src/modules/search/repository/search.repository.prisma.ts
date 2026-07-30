import { prisma } from "../../../database";
import { NotImplementedError } from "../../../errors";

import type { PaginatedResult } from "../../../common";
import type { AutocompleteQuery, SearchQuery, SearchResultItem, SearchSuggestion } from "../types";
import type { SearchRepository } from "./search.repository";
import type { PrismaClient } from "@prisma/client";

/**
 * Prisma-backed implementation of `SearchRepository` — currently a
 * skeleton. Every method throws `NotImplementedError` rather than
 * querying `prisma`, because no `Product`/`Category`/`Brand` Prisma
 * models exist yet in any module (this foundation doesn't add one
 * either); actually querying across them is out of scope for this
 * foundation. Defaults to the shared `prisma` client from `database/`
 * (never constructs its own connection) so only the method bodies are
 * left to fill in once those models exist.
 */
export class SearchPrismaRepository implements SearchRepository {
  constructor(private readonly prismaClient: PrismaClient = prisma) {}

  async search(_query: SearchQuery): Promise<PaginatedResult<SearchResultItem>> {
    throw new NotImplementedError("SearchPrismaRepository.search is not implemented yet");
  }

  async suggest(_query: AutocompleteQuery): Promise<SearchSuggestion[]> {
    throw new NotImplementedError("SearchPrismaRepository.suggest is not implemented yet");
  }
}
