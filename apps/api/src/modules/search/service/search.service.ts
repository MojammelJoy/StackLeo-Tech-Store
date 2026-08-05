import { InternalServerError } from "../../../errors";
import { PERMISSIONS, userHasPermission } from "../../rbac";
import {
  SEARCH_ENTITY_TYPES,
  SEARCH_VISIBLE_STATUS,
  SEARCH_VISIBLE_VISIBILITY,
} from "../constants";
import { searchMapper } from "../mapper";
import { getDefaultSearchProvider } from "../utils";

import type { AuthenticatedUser } from "../../../auth";
import type { PaginatedResult } from "../../../common";
import type { Permission } from "../../rbac";
import type { SearchEntityType, SearchProviderName } from "../constants";
import type { SearchResultDto, SearchSuggestionDto } from "../dto";
import type { SearchProvider } from "../providers";
import type { AutocompleteQuery, EntityVisibilityScope, SearchQuery } from "../types";

/**
 * Which permission lets a caller see every status/visibility for a
 * given entity type's results, not just public/active ones — mirrors
 * `modules/product`'s `PRODUCT_READ`, `modules/category`'s
 * `CATEGORY_READ`, and `modules/brand`'s `BRAND_READ` gating exactly.
 * Kept local to this service (never imported from `modules/product`/
 * `modules/category`/`modules/brand` themselves) — this foundation
 * stays decoupled from those modules, consistent with the rest of
 * `modules/search` (see `constants/search-fields.constants.ts`'s doc
 * comment).
 */
const READ_PERMISSION_BY_ENTITY: Record<SearchEntityType, Permission> = {
  [SEARCH_ENTITY_TYPES.PRODUCT]: PERMISSIONS.PRODUCT_READ,
  [SEARCH_ENTITY_TYPES.CATEGORY]: PERMISSIONS.CATEGORY_READ,
  [SEARCH_ENTITY_TYPES.BRAND]: PERMISSIONS.BRAND_READ,
};

/**
 * Implements the Search API's two operations: full search and
 * autocomplete suggestions. Depends on a *registry* of `SearchProvider`s
 * keyed by name — never a single hardcoded provider — mirroring
 * `modules/media`'s `MediaService`/`uploadProviders` exactly; which
 * provider is actually used per call is resolved via
 * `utils/default-provider.util.ts`'s `getDefaultSearchProvider` (a
 * prod-vs-dev split, not caller-selectable — neither `SearchQueryDto`
 * nor `AutocompleteQueryDto` exposes a `provider` field).
 *
 * `actor: AuthenticatedUser | null` on both methods is this module's
 * visibility enforcement hook, mirroring `modules/product`'s
 * `ProductService`/`modules/category`'s `CategoryService`/
 * `modules/brand`'s `BrandService` exactly — except applied
 * *per entity type* (`buildVisibilityScope`), since a single search can
 * span product/category/brand and an actor's `*_READ` permission is
 * granted independently per entity type (e.g. `category:read` without
 * `product:read`). Every requested entity type is always given an
 * explicit scope entry — bypass (`null`) or forced public/active — so
 * `repository/`'s fail-closed default is never actually relied upon in
 * practice; it exists purely as defense in depth.
 */
export class SearchService {
  constructor(
    private readonly searchProviders: Partial<Record<SearchProviderName, SearchProvider>>,
  ) {}

  async search(
    query: SearchQuery,
    actor: AuthenticatedUser | null,
  ): Promise<PaginatedResult<SearchResultDto>> {
    const provider = this.resolveProvider();
    const scopedQuery: SearchQuery = {
      ...query,
      visibilityScope: this.buildVisibilityScope(query.entityTypes, actor),
    };
    const result = await provider.search(scopedQuery);
    return { items: searchMapper.toResultList(result.items), meta: result.meta };
  }

  async autocomplete(
    query: AutocompleteQuery,
    actor: AuthenticatedUser | null,
  ): Promise<SearchSuggestionDto[]> {
    const provider = this.resolveProvider();
    const scopedQuery: AutocompleteQuery = {
      ...query,
      visibilityScope: this.buildVisibilityScope(query.entityTypes, actor),
    };
    const suggestions = await provider.suggest(scopedQuery);
    return suggestions.map((suggestion) => searchMapper.toSuggestionDto(suggestion));
  }

  private resolveProvider(): SearchProvider {
    const providerName = getDefaultSearchProvider();
    const provider = this.searchProviders[providerName];
    if (!provider) {
      throw new InternalServerError(`No search provider is registered for "${providerName}"`);
    }
    return provider;
  }

  private buildVisibilityScope(
    entityTypes: SearchEntityType[],
    actor: AuthenticatedUser | null,
  ): Partial<Record<SearchEntityType, EntityVisibilityScope | null>> {
    const scope: Partial<Record<SearchEntityType, EntityVisibilityScope | null>> = {};
    for (const entityType of entityTypes) {
      scope[entityType] = this.canBypassVisibilityScope(entityType, actor)
        ? null
        : { status: SEARCH_VISIBLE_STATUS, visibility: SEARCH_VISIBLE_VISIBILITY };
    }
    return scope;
  }

  private canBypassVisibilityScope(
    entityType: SearchEntityType,
    actor: AuthenticatedUser | null,
  ): boolean {
    return actor !== null && userHasPermission(actor, READ_PERMISSION_BY_ENTITY[entityType]);
  }
}
