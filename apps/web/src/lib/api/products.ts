import { bulkProductLookupResponseSchema } from "@stackleo/validation";

import { apiRequest } from "./client";

import type { ApiSuccessResponse, BulkProductLookupItem } from "@stackleo/types";

/**
 * Resolves multiple products by id in one request — never one request
 * per product (see apps/api's `GET /products/bulk`, which itself
 * resolves products and their display images in two queries total,
 * regardless of how many ids are requested). Returns an empty array
 * without calling the network for an empty `ids` list — there is
 * nothing to look up, and the endpoint itself rejects an empty `ids`
 * query parameter.
 */
export async function getProductsBulk(
  ids: string[],
  signal?: AbortSignal,
): Promise<BulkProductLookupItem[]> {
  if (ids.length === 0) {
    return [];
  }

  const response = await apiRequest<ApiSuccessResponse<unknown>>(
    `/api/v1/products/bulk?ids=${ids.map(encodeURIComponent).join(",")}`,
    { signal },
  );
  return bulkProductLookupResponseSchema.parse(response.data).products;
}
