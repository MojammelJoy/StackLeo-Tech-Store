import type { ProductStatus } from "../constants";

/**
 * The persisted Product domain entity. Not a Prisma-generated type — no
 * `Product` model exists in `prisma/schema.prisma` yet (out of scope for
 * this foundation, along with category/brand/inventory). `categoryId` is
 * a bare foreign-key-shaped field, not a dependency on a category module
 * that doesn't exist.
 */
export interface Product {
  id: string;
  name: string;
  description: string | null;
  sku: string;
  /** Minor currency unit (e.g. cents for USD) — avoids floating-point rounding. */
  price: number;
  /** ISO 4217 currency code, e.g. "USD". */
  currency: string;
  status: ProductStatus;
  categoryId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Repository-level creation input. `description`/`categoryId` are
 * `string | null | undefined` — `null` means "explicitly none",
 * `undefined` means "not provided" — a distinction the API-facing DTOs
 * (see `dto/`) deliberately collapse to `undefined` only.
 */
export interface CreateProductInput {
  name: string;
  description?: string | null;
  sku: string;
  price: number;
  currency: string;
  status?: ProductStatus;
  categoryId?: string | null;
}

export interface UpdateProductInput {
  name?: string;
  description?: string | null;
  price?: number;
  currency?: string;
  status?: ProductStatus;
  categoryId?: string | null;
}
