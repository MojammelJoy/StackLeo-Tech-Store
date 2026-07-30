/**
 * The subset of an address a future shipping-rate/carrier integration
 * would actually need — geographic fields only, never `label`/
 * `isDefault`/`recipientName`/`phone` (those describe the address book
 * entry, not the shipment destination). Built by
 * `utils/shippable-address.util.ts`'s `toShippableAddress`. No shipping
 * module exists yet; this only shapes what one would eventually consume.
 */
export interface ShippableAddress {
  line1: string;
  line2: string | null;
  city: string;
  district: string | null;
  division: string;
  postalCode: string;
  country: string;
  latitude: number | null;
  longitude: number | null;
}
