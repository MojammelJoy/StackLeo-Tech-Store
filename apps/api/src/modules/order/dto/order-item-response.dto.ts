/**
 * The public-facing shape of an OrderItem. Adds one read-only
 * convenience the domain entity doesn't carry — `lineTotal` (`unitPrice
 * * quantity`) — computed by `mapper/`, never stored. Mirrors
 * `modules/cart`'s `CartItemResponseDto`.
 */
export interface OrderItemResponseDto {
  id: string;
  productId: string;
  sku: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  createdAt: Date;
  updatedAt: Date;
}
