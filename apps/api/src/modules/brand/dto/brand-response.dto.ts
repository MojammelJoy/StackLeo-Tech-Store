import type { BrandStatus } from "../constants";

/**
 * The public-facing shape of a Brand. Structurally identical to the
 * domain entity today (nothing on `Brand` is sensitive), but kept
 * separate so a future internal-only field never needs a
 * "wait, does this leak?" audit — it simply isn't listed here. Built by
 * `mapper/`, never constructed ad hoc.
 */
export interface BrandResponseDto {
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
