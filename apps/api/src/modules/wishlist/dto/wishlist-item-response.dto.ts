import type { ProductReference } from "../interfaces";

/** The public-facing shape of a WishlistItem. Built by `mapper/`, never constructed ad hoc. */
export interface WishlistItemResponseDto extends ProductReference {
  id: string;
  priceAtAdd: number;
  notifyOnAvailability: boolean;
  createdAt: Date;
  updatedAt: Date;
}
