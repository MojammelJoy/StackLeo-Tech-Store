export type ProductStatus = "draft" | "active" | "archived";
export type ProductVisibility = "public" | "private";

/**
 * A product's chosen display image for compact storefront contexts
 * (cart lines, wishlist tiles) — mirrors apps/api's
 * `ProductDisplayImageDto` exactly
 * (apps/api/src/modules/product/dto/bulk-product-response.dto.ts).
 */
export interface ProductDisplayImage {
  id: string;
  url: string;
  altText: string | null;
}

/**
 * Mirrors apps/api's `BulkProductResponseDto` exactly
 * (apps/api/src/modules/product/dto/bulk-product-response.dto.ts) — what
 * `GET /api/v1/products/bulk` returns for each product. `price`/
 * `currency` here are informational only — never used for cart money
 * math, which always comes from `CartItem.unitPrice`/`lineTotal` and
 * `Cart.summary` instead (see `cart.ts`'s doc comments).
 */
export interface BulkProductLookupItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sku: string;
  price: number;
  currency: string;
  status: ProductStatus;
  visibility: ProductVisibility;
  categoryId: string | null;
  tags: string[];
  seoTitle: string | null;
  seoDescription: string | null;
  seoKeywords: string[];
  createdAt: string;
  updatedAt: string;
  image: ProductDisplayImage | null;
}

/** What `GET /products/bulk` returns under `data`. */
export interface BulkProductLookupResponse {
  products: BulkProductLookupItem[];
}
