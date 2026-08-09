export type CategoryStatus = "draft" | "active" | "archived";
export type CategoryVisibility = "public" | "private";

/**
 * Mirrors apps/api's `CategoryResponseDto` exactly
 * (apps/api/src/modules/category/dto/category-response.dto.ts) — the
 * public wire shape of a category, as returned by every read endpoint
 * under `/api/v1/categories`. Dates arrive as ISO strings over JSON, not
 * `Date` instances. Has no image/media field — the backend doesn't expose
 * one for categories today.
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
  createdAt: string;
  updatedAt: string;
}
