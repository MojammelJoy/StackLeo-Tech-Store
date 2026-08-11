import { bulkProductLookupResponseSchema, productDetailResponseSchema } from "@stackleo/validation";

import { apiRequest } from "./client";

import type {
  ApiSuccessResponse,
  BulkProductLookupItem,
  ProductDetail,
  ProductVariant,
} from "@stackleo/types";

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

/**
 * Resolves the full product detail (including variants and
 * specifications) for the Product Details Page. Anonymous-safe — the
 * backend's `extractCurrentUser` middleware means this works without a
 * session; a hidden/inactive/deleted/nonexistent product is
 * indistinguishable and surfaces as a 404 `ApiError` (see
 * apps/api's `ProductService.getBySlug`), which callers should render as
 * a not-found state rather than a generic error.
 *
 * `cache` defaults to unset (the browser's normal fetch caching) for
 * client-side callers. The Server Component page
 * (`app/products/[slug]/page.tsx`) must pass `"no-store"` explicitly:
 * Next.js's `fetch` patch caches Server Component requests indefinitely
 * by default, and a product's price/status/stock can change between
 * page loads — this is real, per-request storefront data, never
 * something Next's Data Cache should serve stale across visitors.
 */
export async function getProductBySlug(
  slug: string,
  signal?: AbortSignal,
  cache?: RequestCache,
): Promise<ProductDetail> {
  const response = await apiRequest<ApiSuccessResponse<unknown>>(
    `/api/v1/products/slug/${encodeURIComponent(slug)}`,
    { signal, cache },
  );
  return productDetailResponseSchema.parse(response.data).product;
}

/**
 * The effective sellable line for a product/variant selection: a
 * variant's own price/currency when it overrides them, otherwise the
 * parent product's — mirrors apps/api's `CartService.resolveSellableLine`
 * fallback rule (`variant.price ?? product.price`,
 * `variant.currency ?? product.currency`) exactly, so the price shown on
 * the PDP always matches what `POST /cart/items` will actually charge.
 */
export function resolveSelectedPrice(
  product: ProductDetail,
  variant: ProductVariant | null,
): { price: number; currency: string } {
  if (!variant) {
    return { price: product.price, currency: product.currency };
  }
  return {
    price: variant.price ?? product.price,
    currency: variant.currency ?? product.currency,
  };
}

/** The sku a cart line should use for a given selection — mirrors
 * apps/api's `CartService.resolveSellableLine`: the variant's own sku
 * when one is selected, otherwise the base product's. */
export function resolveSelectedSku(product: ProductDetail, variant: ProductVariant | null): string {
  return variant ? variant.sku : product.sku;
}
