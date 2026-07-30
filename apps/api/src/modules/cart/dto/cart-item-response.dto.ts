/**
 * The public-facing shape of a CartItem. Adds one read-only
 * convenience the domain entity doesn't carry — `lineTotal` (`unitPrice
 * * quantity`) — computed by `mapper/`, never stored.
 */
export interface CartItemResponseDto {
  id: string;
  productId: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  selected: boolean;
  createdAt: Date;
  updatedAt: Date;
}
