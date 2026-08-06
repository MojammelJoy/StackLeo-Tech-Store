export const ADDRESS_RECIPIENT_NAME_MAX_LENGTH = 100;
export const ADDRESS_PHONE_MAX_LENGTH = 20;
export const ADDRESS_LINE_MAX_LENGTH = 200;
export const ADDRESS_CITY_MAX_LENGTH = 100;
export const ADDRESS_DIVISION_MAX_LENGTH = 100;
export const ADDRESS_DISTRICT_MAX_LENGTH = 100;
export const ADDRESS_POSTAL_CODE_MAX_LENGTH = 20;

/** ISO 3166-1 alpha-2 country code length, e.g. "US", "BD". */
export const ADDRESS_COUNTRY_CODE_LENGTH = 2;

export const ADDRESS_LATITUDE_MIN = -90;
export const ADDRESS_LATITUDE_MAX = 90;
export const ADDRESS_LONGITUDE_MIN = -180;
export const ADDRESS_LONGITUDE_MAX = 180;

/**
 * What a saved address is used for. `BOTH` means the same address
 * serves as billing and shipping — a common "same as shipping" case —
 * rather than requiring two identical entries.
 */
export const ADDRESS_TYPES = {
  BILLING: "billing",
  SHIPPING: "shipping",
  BOTH: "both",
} as const;

export type AddressType = (typeof ADDRESS_TYPES)[keyof typeof ADDRESS_TYPES];

export const ADDRESS_LABELS = {
  HOME: "home",
  OFFICE: "office",
  OTHER: "other",
} as const;

export type AddressLabel = (typeof ADDRESS_LABELS)[keyof typeof ADDRESS_LABELS];

export const ADDRESS_SORTABLE_FIELDS = ["createdAt", "updatedAt"] as const;
export const ADDRESS_FILTERABLE_FIELDS = [
  "type",
  "label",
  "isDefaultShipping",
  "isDefaultBilling",
  "country",
] as const;

/** Which independent "default" slot an operation targets —
 * `AddressRepository.findDefaultByUserId`/`unsetDefaultForUser`/
 * `setDefaultForUser` and `AddressService.setDefaultShipping`/
 * `setDefaultBilling` are all parameterized by this rather than
 * overloading `AddressType`, since `type: "both"` is a valid address
 * type but never a valid default *context* — see `Address`'s doc
 * comment in `types/address.types.ts` for why shipping/billing defaults
 * are independent in the first place. */
export const DEFAULT_ADDRESS_CONTEXTS = {
  SHIPPING: "shipping",
  BILLING: "billing",
} as const;

export type DefaultAddressContext =
  (typeof DEFAULT_ADDRESS_CONTEXTS)[keyof typeof DEFAULT_ADDRESS_CONTEXTS];
