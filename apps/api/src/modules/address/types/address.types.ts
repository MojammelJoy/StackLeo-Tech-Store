import type { AddressLabel, AddressType } from "../constants";

/**
 * The persisted Address domain entity. Always owned by a user — unlike
 * `modules/cart`/`modules/wishlist`, there's no guest concept here (an
 * address book only makes sense once there's an account to attach it
 * to). `district` is nullable since not every country's address format
 * uses one; `division`/`city`/`postalCode`/`country` are not, since
 * those are close to universal.
 *
 * `isDefaultShipping`/`isDefaultBilling` are two independent flags, not
 * one shared `isDefault` — a `type: "both"` address can be the default
 * for one context without the other, which a single flag can't
 * represent (see `prisma/schema.prisma`'s `Address` doc comment for the
 * full reasoning). Both are set only via
 * `AddressService.setDefaultShipping`/`setDefaultBilling`, never a
 * direct field write — see `UpdateAddressInput`'s comment.
 */
export interface Address {
  id: string;
  userId: string;
  type: AddressType;
  label: AddressLabel;
  isDefaultShipping: boolean;
  isDefaultBilling: boolean;
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
  /** Soft-delete marker — see `AddressService.delete`/`restore`. */
  deletedAt: Date | null;
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
 * Deliberately excludes `isDefaultShipping`/`isDefaultBilling`: making
 * an address a default is a distinct operation
 * (`AddressService.setDefaultShipping`/`setDefaultBilling`, which must
 * also unset the previous default in that context) from editing the
 * address itself, mirroring why `modules/wishlist`'s
 * `UpdateWishlistInput` excludes `shareToken`.
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
