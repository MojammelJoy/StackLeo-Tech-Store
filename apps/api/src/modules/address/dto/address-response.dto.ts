import type { AddressLabel, AddressType } from "../constants";

/**
 * The public-facing shape of an Address. Adds one read-only convenience
 * the domain entity doesn't carry — `formattedAddress` (see
 * `utils/address-formatter.util.ts`'s `formatAddressLine`) — computed by
 * `mapper/`, never stored.
 */
export interface AddressResponseDto {
  id: string;
  type: AddressType;
  label: AddressLabel;
  isDefault: boolean;
  recipientName: string;
  phone: string | null;
  line1: string;
  line2: string | null;
  city: string;
  district: string | null;
  division: string;
  postalCode: string;
  country: string;
  latitude: number | null;
  longitude: number | null;
  formattedAddress: string;
  createdAt: Date;
  updatedAt: Date;
}
