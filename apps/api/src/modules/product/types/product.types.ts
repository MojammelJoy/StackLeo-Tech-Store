import type { ProductStatus, ProductVisibility } from "../constants";

/**
 * The persisted Product domain entity — matches the `Product` model in
 * `prisma/schema.prisma`. `categoryId` is a bare foreign-key-shaped
 * field, not a dependency on a category module that doesn't exist.
 * `deletedAt` is this module's soft-delete marker — a non-null value
 * means the product is deleted; see `ProductRepository.delete`/
 * `restore`.
 */
export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sku: string;
  /** Minor currency unit (e.g. cents for USD) — avoids floating-point rounding. */
  price: number;
  /** ISO 4217 currency code, e.g. "USD". */
  currency: string;
  status: ProductStatus;
  visibility: ProductVisibility;
  categoryId: string | null;
  tags: string[];
  seoTitle: string | null;
  seoDescription: string | null;
  seoKeywords: string[];
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Repository-level creation input. `slug` is always supplied by the
 * service layer (see `utils/slug.util.ts`), never left for the
 * repository to derive — the repository only persists, it never
 * generates identifiers.
 */
export interface CreateProductInput {
  name: string;
  slug: string;
  description?: string | null;
  sku: string;
  price: number;
  currency: string;
  status?: ProductStatus;
  visibility?: ProductVisibility;
  categoryId?: string | null;
  tags?: string[];
  seoTitle?: string | null;
  seoDescription?: string | null;
  seoKeywords?: string[];
}

/**
 * Deliberately excludes `sku`, `slug`, `status`, and `visibility` — SKU
 * is an identifier (its own concern, not part of a general update);
 * slug is derived once at creation and kept stable for SEO; status and
 * visibility each have their own dedicated transition (see
 * `UpdateProductStatusInput`/`UpdateProductVisibilityInput`) so a
 * lifecycle change is never accidentally bundled into an unrelated
 * field edit.
 */
export interface UpdateProductInput {
  name?: string;
  description?: string | null;
  price?: number;
  currency?: string;
  categoryId?: string | null;
  tags?: string[];
  seoTitle?: string | null;
  seoDescription?: string | null;
  seoKeywords?: string[];
}

export interface UpdateProductStatusInput {
  status: ProductStatus;
}

export interface UpdateProductVisibilityInput {
  visibility: ProductVisibility;
}
