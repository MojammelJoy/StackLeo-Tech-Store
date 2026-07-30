import type { CartStatus } from "../constants";
import type { CartSummary } from "../types";
import type { CartItemResponseDto } from "./cart-item-response.dto";

/**
 * The public-facing shape of a Cart, including its items and their
 * computed `CartSummary` — the realistic "get my cart" response shape.
 * Built by `mapper/`, never constructed ad hoc.
 */
export interface CartResponseDto {
  id: string;
  userId: string | null;
  guestToken: string | null;
  currency: string;
  status: CartStatus;
  items: CartItemResponseDto[];
  summary: CartSummary;
  createdAt: Date;
  updatedAt: Date;
}
