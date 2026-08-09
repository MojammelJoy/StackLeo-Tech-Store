import { categoryListSchema } from "@stackleo/validation";

import { apiRequest } from "./client";

import type { ApiSuccessResponse, Category } from "@stackleo/types";

/**
 * Fetches the public category list. Anonymous requests are already
 * scoped server-side to active/public categories (see apps/api's
 * `CategoryService.scopeFiltersForActor`) — this layer doesn't need to
 * (and can't) filter further. Sorted by `sortOrder`, the field the
 * backend models as the intended display order.
 */
export async function getCategories(signal?: AbortSignal): Promise<Category[]> {
  const response = await apiRequest<ApiSuccessResponse<unknown[]>>(
    "/api/v1/categories?sort=sortOrder&limit=20",
    { signal },
  );

  return categoryListSchema.parse(response.data);
}
