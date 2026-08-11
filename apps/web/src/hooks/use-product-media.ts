import { useQuery } from "@tanstack/react-query";

import { getProductMedia } from "../lib/api/media";

export const productMediaQueryKeys = {
  all: ["product-media"] as const,
  byProduct: (productId: string) => [...productMediaQueryKeys.all, productId] as const,
};

/**
 * Resolves the gallery images for one product. Deliberately a separate
 * query from `useProductBySlug` (not fetched eagerly together) so a
 * media-service failure never blocks the product name/price/variants/
 * purchase controls from rendering — the PDP treats this as a
 * non-fatal, independently-loading section (see `ProductGallery`'s
 * handling of `isError`). Disabled until a real `productId` is known.
 */
export function useProductMedia(productId: string | undefined) {
  return useQuery({
    queryKey: productMediaQueryKeys.byProduct(productId ?? ""),
    queryFn: ({ signal }) => getProductMedia(productId as string, signal),
    enabled: Boolean(productId),
  });
}
