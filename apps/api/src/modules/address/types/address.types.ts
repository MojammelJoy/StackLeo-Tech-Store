import type { AddressLabel, AddressType } from "../constants";

/**
 * The persisted Address domain entity. Not a Prisma-generated type — no
 * `Address` model exists in `prisma/schema.prisma` yet (out of scope
 * for this foundation). Always owned by a user — unlike
 * `modules/cart`/`modules/wishlist`, there's no guest concept here (an
 * address book only makes sense once there's an account to attach it
 * to). `district` is nullable since not every country's address format
 * uses one; `division`/`city`/`postalCode`/`country` are not, since
 * those are close to universal.
 */
export interface Address {
  id: string;
  userId: string;
  type: AddressType;
  label: AddressLabel;
  /** Set via `AddressService.setDefault`, never a direct field write — see `UpdateAddressInput`'s comment. */
  isDefault: boolean;
  recipientName: string;
  phone: string | null;
  line1: string;
  line2: string | null;
  city: string;
  district: string | null;
  division: string;
  postalCode: string;
  /** ISO 3166-1 alpha-2, e.g. "US", "BD". */
  country: string;
  /** Future support — see `interfaces/shippable-address.interface.ts` and `utils/coordinates.util.ts`. Nothing in this foundation geocodes an address or uses these for a real shipping calculation. */
  latitude: number | null;
  longitude: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateAddressInput {
  userId: string;
  type: AddressType;
  label: AddressLabel;
  recipientName: string;
  phone?: string | null;
  line1: string;
  line2?: string | null;
  city: string;
  district?: string | null;
  division: string;
  postalCode: string;
  country: string;
  latitude?: number | null;
  longitude?: number | null;
}

/**
 * Deliberately excludes `isDefault`: making an address the default is a
 * distinct operation (`AddressService.setDefault`, which must also
 * unset the previous default) from editing the address itself,
 * mirroring why `modules/wishlist`'s `UpdateWishlistInput` excludes
 * `shareToken`.
 */
export interface UpdateAddressInput {
  type?: AddressType;
  label?: AddressLabel;
  recipientName?: string;
  phone?: string | null;
  line1?: string;
  line2?: string | null;
  city?: string;
  district?: string | null;
  division?: string;
  postalCode?: string;
  country?: string;
  latitude?: number | null;
  longitude?: number | null;
}
