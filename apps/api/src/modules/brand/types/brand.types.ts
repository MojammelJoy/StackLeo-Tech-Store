import type { BrandStatus, BrandVisibility } from "../constants";

/**
 * The persisted Brand domain entity — matches the `Brand` model in
 * `prisma/schema.prisma`. Unlike `Category`, a `Brand` has no
 * self-reference — brands are a flat list, not a hierarchy.
 */
export interface Brand {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  logoAltText: string | null;
  logoUpdatedAt: Date | null;
  websiteUrl: string | null;
  status: BrandStatus;
  visibility: BrandVisibility;
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
 * repository to derive.
 */
export interface CreateBrandInput {
  name: string;
  slug: string;
  description?: string | null;
  websiteUrl?: string | null;
  status?: BrandStatus;
  visibility?: BrandVisibility;
  seoTitle?: string | null;
  seoDescription?: string | null;
  seoKeywords?: string[];
}

/**
 * Deliberately excludes `slug`, `status`, and `visibility` — slug is
 * derived once at creation and kept stable for SEO; status and
 * visibility each have their own dedicated transition (see
 * `UpdateBrandStatusInput`/`UpdateBrandVisibilityInput`), mirroring
 * `modules/product`/`modules/category`. Also excludes `logoUrl`/
 * `logoAltText` — logo metadata has its own dedicated operation (see
 * `UpdateBrandLogoInput`), mirroring the User API's avatar-metadata
 * endpoint, so a content edit can never accidentally touch it.
 */
export interface UpdateBrandInput {
  name?: string;
  description?: string | null;
  websiteUrl?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  seoKeywords?: string[];
}

export interface UpdateBrandStatusInput {
  status: BrandStatus;
}

export interface UpdateBrandVisibilityInput {
  visibility: BrandVisibility;
}

/** `logoUrl: null` clears the logo (also clearing `logoAltText`);
 * `logoUrl` non-null sets/replaces it. `logoUpdatedAt` is always
 * server-set to "now" by the repository, never client-supplied. */
export interface UpdateBrandLogoInput {
  logoUrl: string | null;
  logoAltText?: string | null;
}
