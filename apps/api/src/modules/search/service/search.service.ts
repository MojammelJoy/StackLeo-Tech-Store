import { NotImplementedError } from "../../../errors";

import type { AuthenticatedUser } from "../../../auth";
import type { PaginatedResult } from "../../../common";
import type { SearchProviderName } from "../constants";
import type {
  AutocompleteQueryDto,
  SearchQueryDto,
  SearchResultDto,
  SearchSuggestionDto,
} from "../dto";
import type { SearchProvider } from "../providers";

/**
 * Skeleton search service — the operations a concrete implementation
 * will expose once a real provider (database, full-text, or eventually
 * an external engine) is wired in. Depends on a *registry* of
 * `SearchProvider`s keyed by name — never a single hardcoded provider —
 * which is what actually lets this foundation "support multiple/future
 * search providers": selecting one at runtime (see
 * `utils/default-provider.util.ts`) is a matter of choosing a registry
 * key, not branching logic baked into this class. Every method throws
 * `NotImplementedError` — no database operations, no calls to any
 * provider, happen in this foundation.
 *
 * `actor` is optional and unused by either method here — offered for a
 * future concrete implementation that wants search analytics or
 * personalized suggestions scoped to the searching user, not because
 * anything in this foundation enforces or reads it. Authorization
 * (e.g. hiding results a user can't see) is `modules/rbac`'s job,
 * applied by whatever middleware sits in front of this service once it
 * exists — never this class's concern.
 */
export class SearchService {
  constructor(
    private readonly searchProviders: Partial<Record<SearchProviderName, SearchProvider>>,
  ) {}

  async search(
    _dto: SearchQueryDto,
    _actor?: AuthenticatedUser,
  ): Promise<PaginatedResult<SearchResultDto>> {
    throw new NotImplementedError("SearchService.search is not implemented yet");
  }

  async autocomplete(
    _dto: AutocompleteQueryDto,
    _actor?: AuthenticatedUser,
  ): Promise<SearchSuggestionDto[]> {
    throw new NotImplementedError("SearchService.autocomplete is not implemented yet");
  }
}
