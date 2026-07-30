import type { CategoryStatus } from "../constants";

/**
 * The public-facing shape of a Category. Structurally identical to the
 * domain entity today (nothing on `Category` is sensitive), but kept
 * separate so a future internal-only field never needs a
 * "wait, does this leak?" audit — it simply isn't listed here. Built by
 * `mapper/`, never constructed ad hoc.
 */
export interface CategoryResponseDto {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parentId: string | null;
  status: CategoryStatus;
  createdAt: Date;
  updatedAt: Date;
}
