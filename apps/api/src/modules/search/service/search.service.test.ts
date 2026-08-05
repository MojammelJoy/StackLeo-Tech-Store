import { describe, expect, it, vi } from "vitest";

import { createTestAuthenticatedUser, DEFAULT_TEST_ADMIN_ROLES } from "../../../testing";
import {
  SEARCH_DEFAULT_ENTITY_TYPES,
  SEARCH_ENTITY_TYPES,
  SEARCH_PROVIDERS,
  SEARCH_VISIBLE_STATUS,
  SEARCH_VISIBLE_VISIBILITY,
} from "../constants";

import { SearchService } from "./search.service";

import type { SearchProvider } from "../providers";
import type { AutocompleteQuery, SearchQuery } from "../types";

function buildProvider(): SearchProvider {
  return {
    name: SEARCH_PROVIDERS.DATABASE,
    search: vi.fn().mockResolvedValue({
      items: [],
      meta: {
        page: 1,
        limit: 20,
        totalItems: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    }),
    suggest: vi.fn().mockResolvedValue([]),
  };
}

function buildSearchQuery(overrides: Partial<SearchQuery> = {}): SearchQuery {
  return {
    keyword: "laptop",
    entityTypes: [...SEARCH_DEFAULT_ENTITY_TYPES],
    pagination: { page: 1, limit: 20 },
    sort: [],
    filters: {},
    ...overrides,
  };
}

function buildAutocompleteQuery(overrides: Partial<AutocompleteQuery> = {}): AutocompleteQuery {
  return {
    keyword: "lap",
    entityTypes: [...SEARCH_DEFAULT_ENTITY_TYPES],
    limit: 10,
    ...overrides,
  };
}

/**
 * `NODE_ENV=test` (see `testing/constants/test-env.constants.ts`) means
 * `config.isProduction` is `false` for the whole suite, so
 * `utils/default-provider.util.ts`'s `getDefaultSearchProvider` always
 * resolves to `SEARCH_PROVIDERS.DATABASE` here — every test registers
 * (at least) that key.
 */
describe("SearchService", () => {
  describe("visibility scoping", () => {
    it("forces every requested entity type to public/active for an anonymous caller", async () => {
      const provider = buildProvider();
      const service = new SearchService({ [SEARCH_PROVIDERS.DATABASE]: provider });

      await service.search(buildSearchQuery(), null);

      expect(provider.search).toHaveBeenCalledWith(
        expect.objectContaining({
          visibilityScope: {
            [SEARCH_ENTITY_TYPES.PRODUCT]: {
              status: SEARCH_VISIBLE_STATUS,
              visibility: SEARCH_VISIBLE_VISIBILITY,
            },
            [SEARCH_ENTITY_TYPES.CATEGORY]: {
              status: SEARCH_VISIBLE_STATUS,
              visibility: SEARCH_VISIBLE_VISIBILITY,
            },
            [SEARCH_ENTITY_TYPES.BRAND]: {
              status: SEARCH_VISIBLE_STATUS,
              visibility: SEARCH_VISIBLE_VISIBILITY,
            },
          },
        }),
      );
    });

    it("forces every requested entity type to public/active for an authenticated caller without *_READ permissions", async () => {
      const provider = buildProvider();
      const service = new SearchService({ [SEARCH_PROVIDERS.DATABASE]: provider });
      const actor = createTestAuthenticatedUser();

      await service.search(buildSearchQuery({ entityTypes: [SEARCH_ENTITY_TYPES.PRODUCT] }), actor);

      expect(provider.search).toHaveBeenCalledWith(
        expect.objectContaining({
          visibilityScope: {
            [SEARCH_ENTITY_TYPES.PRODUCT]: {
              status: SEARCH_VISIBLE_STATUS,
              visibility: SEARCH_VISIBLE_VISIBILITY,
            },
          },
        }),
      );
    });

    it("bypasses visibility scoping for every entity type an admin actor may read", async () => {
      const provider = buildProvider();
      const service = new SearchService({ [SEARCH_PROVIDERS.DATABASE]: provider });
      const actor = createTestAuthenticatedUser({ roles: [...DEFAULT_TEST_ADMIN_ROLES] });

      await service.search(buildSearchQuery(), actor);

      expect(provider.search).toHaveBeenCalledWith(
        expect.objectContaining({
          visibilityScope: {
            [SEARCH_ENTITY_TYPES.PRODUCT]: null,
            [SEARCH_ENTITY_TYPES.CATEGORY]: null,
            [SEARCH_ENTITY_TYPES.BRAND]: null,
          },
        }),
      );
    });

    it("applies the same fail-closed scoping to autocomplete", async () => {
      const provider = buildProvider();
      const service = new SearchService({ [SEARCH_PROVIDERS.DATABASE]: provider });

      await service.autocomplete(
        buildAutocompleteQuery({ entityTypes: [SEARCH_ENTITY_TYPES.BRAND] }),
        null,
      );

      expect(provider.suggest).toHaveBeenCalledWith(
        expect.objectContaining({
          visibilityScope: {
            [SEARCH_ENTITY_TYPES.BRAND]: {
              status: SEARCH_VISIBLE_STATUS,
              visibility: SEARCH_VISIBLE_VISIBILITY,
            },
          },
        }),
      );
    });
  });

  describe("provider resolution", () => {
    it("throws when the resolved default provider name has no registered implementation", async () => {
      const service = new SearchService({
        [SEARCH_PROVIDERS.FULL_TEXT]: buildProvider(),
      });

      await expect(service.search(buildSearchQuery(), null)).rejects.toThrow(
        /No search provider is registered/,
      );
    });

    it("maps provider results through the search mapper", async () => {
      const provider = buildProvider();
      (provider.search as ReturnType<typeof vi.fn>).mockResolvedValue({
        items: [
          {
            id: "product-1",
            entityType: SEARCH_ENTITY_TYPES.PRODUCT,
            title: "Laptop Pro",
            slug: "laptop-pro",
            description: null,
            imageUrl: null,
            score: 3,
          },
        ],
        meta: {
          page: 1,
          limit: 20,
          totalItems: 1,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      });
      const service = new SearchService({ [SEARCH_PROVIDERS.DATABASE]: provider });

      const result = await service.search(buildSearchQuery(), null);

      expect(result.items).toEqual([
        {
          id: "product-1",
          entityType: SEARCH_ENTITY_TYPES.PRODUCT,
          title: "Laptop Pro",
          slug: "laptop-pro",
          description: null,
          imageUrl: null,
          score: 3,
        },
      ]);
      expect(result.meta.totalItems).toBe(1);
    });
  });
});
