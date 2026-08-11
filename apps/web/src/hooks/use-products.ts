import { useQuery } from "@tanstack/react-query";

import { ApiError } from "../lib/api/client";
import { getProductBySlug, getProductsBulk } from "../lib/api/products";

export const productQueryKeys = {
  all: ["products"] as const,
  bulk: (ids: string[]) => [...productQueryKeys.all, "bulk", ids] as const,
  bySlug: (slug: string) => [...productQueryKeys.all, "slug", slug] as const,
};

/** A 404 means "not found" (or hidden/inactive/deleted — the backend
 * deliberately doesn't distinguish, see `getProductBySlug`'s doc
 * comment) — retrying it can never succeed, unlike a transient network
 * failure, so it's excluded from TanStack Query's default retry
 * behavior. */
function shouldRetryProductFetch(failureCount: number, error: unknown): boolean {
  if (error instanceof ApiError && error.status === 404) {
    return false;
  }
  return failureCount < 3;
}

/**
 * Resolves display data for multiple products in one request. `ids` is
 * deduplicated and sorted before becoming the query key, so requesting
 * the same set of products — regardless of the caller's array order or
 * duplicate entries — reuses the same cache entry instead of refetching.
 * Disabled entirely for an empty list; `getProductsBulk` also guards
 * this itself, so neither a stray call site nor this hook can trigger an
 * unnecessary request.
 */
export function useProductsBulk(ids: string[]) {
  const uniqueIds = [...new Set(ids)].sort();

  return useQuery({
    queryKey: productQueryKeys.bulk(uniqueIds),
    queryFn: ({ signal }) => getProductsBulk(uniqueIds, signal),
    enabled: uniqueIds.length > 0,
  });
}

/**
 * Resolves the full product detail (variants, specifications) for the
 * Product Details Page by slug. Never retries a 404 (see
 * `shouldRetryProductFetch`) — the page renders its not-found state
 * immediately instead of spinning through retries that can't succeed.
 */
export function useProductBySlug(slug: string) {
  return useQuery({
    queryKey: productQueryKeys.bySlug(slug),
    queryFn: ({ signal }) => getProductBySlug(slug, signal),
    retry: shouldRetryProductFetch,
  });
}
