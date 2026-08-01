/**
 * A purchasable variation of a `Product` — matches the `ProductVariant`
 * model in `prisma/schema.prisma`. `price`/`currency` are `null` when
 * the variant simply uses its parent product's price; `attributes` is a
 * flat string-to-string map (e.g. `{ color: "Red", size: "M" }`) rather
 * than arbitrary JSON, so every variant's shape stays predictable
 * without a category/attribute-schema system, which is out of scope.
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
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProductVariantInput {
  productId: string;
  sku: string;
  name: string;
  attributes: Record<string, string>;
  price?: number | null;
  currency?: string | null;
  isActive?: boolean;
}

export interface UpdateProductVariantInput {
  name?: string;
  attributes?: Record<string, string>;
  price?: number | null;
  currency?: string | null;
  isActive?: boolean;
}
