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

/**
 * Mirrors apps/api's `ProductVariantResponseDto` exactly
 * (apps/api/src/modules/product/dto/product-variant-response.dto.ts).
 * `price`/`currency` are `null` when the variant inherits the parent
 * product's price/currency — see `resolveVariantPrice` in
 * `apps/web/src/lib/api/products.ts` for the fallback rule. Only
 * `isActive: true` variants may be selected for purchase.
 */
export interface ProductVariant {
  id: string;
  productId: string;
  sku: string;
  name: string;
  attributes: Record<string, string>;
  price: number | null;
  currency: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Mirrors apps/api's `ProductSpecificationResponseDto` exactly
 * (apps/api/src/modules/product/dto/product-specification-response.dto.ts). */
export interface ProductSpecification {
  id: string;
  productId: string;
  key: string;
  value: string;
  sortOrder: number;
}

/**
 * Mirrors apps/api's `ProductResponseDto` exactly
 * (apps/api/src/modules/product/dto/product-response.dto.ts) — what
 * `GET /api/v1/products/slug/:slug` and `GET /api/v1/products/:id`
 * return. `variants` may include inactive entries — callers must filter
 * on `isActive` themselves, never assume every entry is selectable.
 */
export interface ProductDetail {
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
  variants: ProductVariant[];
  specifications: ProductSpecification[];
}

/** What `GET /products/slug/:slug` (and `GET /products/:id`) return
 * under `data`. */
export interface ProductDetailResponse {
  product: ProductDetail;
}
