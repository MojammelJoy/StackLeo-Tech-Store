import { sendPaginatedResponse, sendSuccess } from "../../../common";
import { asyncHandler } from "../../../utils";
import { AUTOCOMPLETE_MAX_SUGGESTIONS, SEARCH_DEFAULT_ENTITY_TYPES } from "../constants";
import { buildSearchQuery } from "../utils";

import type { AutocompleteQueryDto, SearchQueryDto } from "../dto";
import type { SearchService } from "../service";
import type { AutocompleteQuery } from "../types";

/**
 * Express handlers for the Search API. Each method is an
 * `asyncHandler`-wrapped arrow function (bound automatically, so
 * `routes/search.routes.ts` can reference `searchController.x`
 * directly) that does only three things: read the request, call one
 * `SearchService` method, and send the response — no business logic
 * lives here, mirroring every other module's controller.
 *
 * Both endpoints use `extractCurrentUser` (never `authenticate`) at the
 * route layer, so anonymous storefront search works — `SearchService`
 * itself scopes results down to public/active rows per entity type for
 * anyone without that entity type's own `*_READ` permission. `req.query`
 * has already been replaced with `searchQuerySchema`/
 * `autocompleteQuerySchema`'s parsed, `.passthrough()`-preserved output
 * by `validateRequest` (see `routes/search.routes.ts`) by the time these
 * handlers run — the cast to `SearchQueryDto`/`AutocompleteQueryDto`
 * just gives that already-validated shape a proper static type, since
 * Express's own `Request["query"]` type doesn't know about it.
 */
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  search = asyncHandler(async (req, res) => {
    const dto = req.query as unknown as SearchQueryDto;
    const entityTypes = dto.entityTypes ?? [...SEARCH_DEFAULT_ENTITY_TYPES];
    const query = buildSearchQuery(req.query, dto.keyword, entityTypes);

    const result = await this.searchService.search(query, req.user ?? null);
    sendPaginatedResponse(res, result.items, result.meta);
  });

  autocomplete = asyncHandler(async (req, res) => {
    const dto = req.query as unknown as AutocompleteQueryDto;
    const query: AutocompleteQuery = {
      keyword: dto.keyword,
      entityTypes: dto.entityTypes ?? [...SEARCH_DEFAULT_ENTITY_TYPES],
      limit: dto.limit ?? AUTOCOMPLETE_MAX_SUGGESTIONS,
    };

    const suggestions = await this.searchService.autocomplete(query, req.user ?? null);
    sendSuccess(res, { suggestions });
  });
}
