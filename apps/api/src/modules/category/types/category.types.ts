import type { CategoryStatus } from "../constants";

/**
 * The persisted Category domain entity. Not a Prisma-generated type — no
 * `Category` model exists in `prisma/schema.prisma` yet (out of scope
 * for this foundation). `parentId` self-references another `Category`,
 * giving categories a tree shape; `null` means "top-level."
 */
export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parentId: string | null;
  status: CategoryStatus;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Repository-level creation input. `description`/`parentId` are
 * `string | null | undefined` — `null` means "explicitly none",
 * `undefined` means "not provided" — a distinction the API-facing DTOs
 * (see `dto/`) deliberately collapse to `undefined` only.
 */
export interface CreateCategoryInput {
  name: string;
  slug: string;
  description?: string | null;
  parentId?: string | null;
  status?: CategoryStatus;
}

/**
 * Deliberately excludes `slug`: renaming a category's slug is a distinct
 * operation (URL/redirect implications) from a general profile update,
 * mirroring why `UpdateProductInput` excludes `sku`.
 */
export interface UpdateCategoryInput {
  name?: string;
  description?: string | null;
  parentId?: string | null;
  status?: CategoryStatus;
}
