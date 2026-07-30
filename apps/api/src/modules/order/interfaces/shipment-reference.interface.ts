/**
 * What a future shipment/carrier integration would attach to an order
 * once one exists — the external tracking detail behind
 * `Order.fulfillmentStatus` (see `types/order.types.ts`). No carrier
 * API is ever called or imported here; this is only the shape a future
 * integration would produce.
 */
export interface ShipmentReference {
  carrier: string;
  trackingNumber: string;
  shippedAt: Date | null;
}
