import type { ProductStatus } from "../constants";

/**
 * The public-facing shape of a Product. Structurally identical to the
 * domain entity today (nothing on `Product` is sensitive), but kept
 * separate so a future internal-only field never needs a
 * "wait, does this leak?" audit — it simply isn't listed here. Built by
 * `mapper/`, never constructed ad hoc.
 */
export interface ProductResponseDto {
  id: string;
  name: string;
  description: string | null;
  sku: string;
  price: number;
  currency: string;
  status: ProductStatus;
  categoryId: string | null;
  createdAt: Date;
  updatedAt: Date;
}
