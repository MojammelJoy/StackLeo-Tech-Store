import type { BrandStatus } from "../constants";

/**
 * The persisted Brand domain entity. Not a Prisma-generated type — no
 * `Brand` model exists in `prisma/schema.prisma` yet (out of scope for
 * this foundation). Unlike `Category`, a `Brand` has no self-reference —
 * brands are a flat list, not a hierarchy.
 */
export interface Brand {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  websiteUrl: string | null;
  status: BrandStatus;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Repository-level creation input. `description`/`logoUrl`/`websiteUrl`
 * are `string | null | undefined` — `null` means "explicitly none",
 * `undefined` means "not provided" — a distinction the API-facing DTOs
 * (see `dto/`) deliberately collapse to `undefined` only.
 */
export interface CreateBrandInput {
  name: string;
  slug: string;
  description?: string | null;
  logoUrl?: string | null;
  websiteUrl?: string | null;
  status?: BrandStatus;
}

/**
 * Deliberately excludes `slug`: renaming a brand's slug is a distinct
 * operation (URL/redirect implications) from a general profile update,
 * mirroring why `UpdateProductInput`/`UpdateCategoryInput` exclude
 * `sku`/`slug`.
 */
export interface UpdateBrandInput {
  name?: string;
  description?: string | null;
  logoUrl?: string | null;
  websiteUrl?: string | null;
  status?: BrandStatus;
}
