import { useQuery } from "@tanstack/react-query";

import { getProductsBulk } from "../lib/api/products";

export const productQueryKeys = {
  all: ["products"] as const,
  bulk: (ids: string[]) => [...productQueryKeys.all, "bulk", ids] as const,
};

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
