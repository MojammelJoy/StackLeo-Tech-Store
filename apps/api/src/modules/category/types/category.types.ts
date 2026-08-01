import type { CategoryStatus, CategoryVisibility } from "../constants";

/**
 * The persisted Category domain entity — matches the `Category` model
 * in `prisma/schema.prisma`. `parentId` self-references another
 * `Category`, giving categories a tree shape; `null` means "top-level."
 */
export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parentId: string | null;
  status: CategoryStatus;
  visibility: CategoryVisibility;
  sortOrder: number;
  seoTitle: string | null;
  seoDescription: string | null;
  seoKeywords: string[];
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * A `Category` plus its already-loaded children, recursively — the
 * shape `utils/tree.util.ts`'s `buildCategoryForest`/
 * `buildCategorySubtree` produce from a flat `Category[]`. Domain-level
 * (not a response DTO): `mapper/category.mapper.ts`'s
 * `toTreeResponseDto` converts one of these into the public
 * `CategoryTreeResponseDto` shape.
 */
export interface CategoryNode extends Category {
  children: CategoryNode[];
}

/**
 * Repository-level creation input. `slug` is always supplied by the
 * service layer (see `utils/slug.util.ts`), never left for the
 * repository to derive.
 */
export interface CreateCategoryInput {
  name: string;
  slug: string;
  description?: string | null;
  parentId?: string | null;
  status?: CategoryStatus;
  visibility?: CategoryVisibility;
  sortOrder?: number;
  seoTitle?: string | null;
  seoDescription?: string | null;
  seoKeywords?: string[];
}

/**
 * Deliberately excludes `slug`, `status`, and `visibility` — slug is
 * derived once at creation and kept stable for SEO; status and
 * visibility each have their own dedicated transition (see
 * `UpdateCategoryStatusInput`/`UpdateCategoryVisibilityInput`), mirroring
 * `modules/product`'s `UpdateProductInput`. `parentId` — re-parenting —
 * stays on the general update: unlike a lifecycle transition, moving a
 * category is just another attribute edit, gated by the same cycle/
 * depth validation regardless of which endpoint changes it.
 */
export interface UpdateCategoryInput {
  name?: string;
  description?: string | null;
  parentId?: string | null;
  sortOrder?: number;
  seoTitle?: string | null;
  seoDescription?: string | null;
  seoKeywords?: string[];
}

export interface UpdateCategoryStatusInput {
  status: CategoryStatus;
}

export interface UpdateCategoryVisibilityInput {
  visibility: CategoryVisibility;
}
