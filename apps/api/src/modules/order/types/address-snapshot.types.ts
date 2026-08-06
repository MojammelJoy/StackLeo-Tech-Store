/**
 * A frozen copy of the physical-address fields from `modules/address`'s
 * `Address` (never an import of that module, the same decoupling every
 * module in this monorepo keeps toward its siblings), captured at the
 * moment an order is placed. `Order.billingAddress`/`shippingAddress`
 * store this shape as JSON — the actual `Address` row the snapshot came
 * from can be edited or soft-deleted afterward without ever altering
 * historical order data (see `prisma/schema.prisma`'s `Order` doc
 * comment). Deliberately omits `id`/`type`/`label`/`isDefaultShipping`/
 * `isDefaultBilling`/`latitude`/`longitude`/timestamps — an address
 * book entry's own bookkeeping fields, not facts about the shipment
 * destination itself.
 */
export interface AddressSnapshot {
  recipientName: string;
  phone: string | null;
  line1: string;
  line2: string | null;
  city: string;
  district: string | null;
  division: string;
  postalCode: string;
  country: string;
}
