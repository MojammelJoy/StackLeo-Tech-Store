/**
 * What a future inventory-reservation step (holding stock for an order
 * before it's confirmed — see `modules/inventory`'s own foundation)
 * would need per order item. Never imports `modules/inventory` — this
 * is only the shape a future integration between the two modules would
 * pass across the boundary; nothing in this foundation reserves,
 * decrements, or otherwise touches actual stock.
 */
export interface InventoryReservationRequest {
  orderItemId: string;
  productId: string;
  sku: string;
  quantity: number;
}
