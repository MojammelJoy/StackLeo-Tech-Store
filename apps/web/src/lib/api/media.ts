import { mediaByOwnerResponseSchema } from "@stackleo/validation";

import { apiRequest } from "./client";

import type { ApiSuccessResponse, MediaAsset } from "@stackleo/types";

/**
 * Resolves every media asset attached to a product — used for the PDP
 * gallery. Anonymous-safe (see apps/api's `MediaController.getByOwner`/
 * `MediaService.isVisibleTo`): an unauthenticated caller only ever sees
 * `READY` assets, never pending/failed/deleted ones. Returns whatever
 * the backend returns, including an empty array for a product with no
 * images — callers must handle that gracefully rather than assuming at
 * least one asset exists.
 */
export async function getProductMedia(
  productId: string,
  signal?: AbortSignal,
): Promise<MediaAsset[]> {
  const response = await apiRequest<ApiSuccessResponse<unknown>>(
    `/api/v1/media/owner/product/${encodeURIComponent(productId)}`,
    { signal },
  );
  return mediaByOwnerResponseSchema.parse(response.data).assets;
}
