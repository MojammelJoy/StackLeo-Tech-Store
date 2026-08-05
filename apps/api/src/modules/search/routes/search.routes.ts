import { Router } from "express";

import { extractCurrentUser } from "../../../auth";
import { validateRequest } from "../../../common";
import { SEARCH_PROVIDERS } from "../constants";
import { SearchController } from "../controller";
import { DatabaseSearchProvider, FullTextSearchProvider } from "../providers";
import { SearchPrismaRepository } from "../repository";
import { SearchService } from "../service";
import { autocompleteQuerySchema, searchQuerySchema } from "../validation";

import type { SearchProviderName } from "../constants";
import type { SearchProvider } from "../providers";

const searchRepository = new SearchPrismaRepository();

/** Both strategies are registered up front — `SearchService` picks
 * which one to actually call per request via
 * `utils/default-provider.util.ts`'s `getDefaultSearchProvider` (a
 * prod-vs-dev split), never a route-level decision. */
const searchProviders: Partial<Record<SearchProviderName, SearchProvider>> = {
  [SEARCH_PROVIDERS.DATABASE]: new DatabaseSearchProvider(searchRepository),
  [SEARCH_PROVIDERS.FULL_TEXT]: new FullTextSearchProvider(searchRepository),
};

const searchService = new SearchService(searchProviders);
const searchController = new SearchController(searchService);

/**
 * The full Search API surface, mounted at `/api/v1/search` (see
 * `routes/v1/index.ts`). Both endpoints use `extractCurrentUser` (never
 * `authenticate`) so anonymous storefront search works — `SearchService`
 * itself scopes results down to public/active rows per entity type for
 * anyone without that entity type's own `*_READ` permission (see
 * `service/search.service.ts`). No route here requires authentication or
 * a specific RBAC permission: search is a public, read-only discovery
 * surface over already-public catalog data, the same trust level as
 * `GET /products`/`GET /categories`/`GET /brands`.
 */
export const searchRouter: Router = Router();

searchRouter.get(
  "/",
  extractCurrentUser,
  validateRequest({ query: searchQuerySchema }),
  searchController.search,
);

searchRouter.get(
  "/autocomplete",
  extractCurrentUser,
  validateRequest({ query: autocompleteQuerySchema }),
  searchController.autocomplete,
);
