/**
 * Reusable address infrastructure: domain types, DTOs (including
 * billing/shipping-narrowed variants) + Zod validation schemas (built
 * from reusable field-level schemas in `schemas/`), the repository
 * contract (plus its currently-skeletal Prisma implementation), a
 * skeleton service, and the mapper/utility helpers that support it all.
 * No controllers, routes, CRUD implementation, or business logic
 * (shipping/order/payment concerns) live here.
 */
export {
  ADDRESS_CITY_MAX_LENGTH,
  ADDRESS_COUNTRY_CODE_LENGTH,
  ADDRESS_DISTRICT_MAX_LENGTH,
  ADDRESS_DIVISION_MAX_LENGTH,
  ADDRESS_FILTERABLE_FIELDS,
  ADDRESS_LABELS,
  ADDRESS_LATITUDE_MAX,
  ADDRESS_LATITUDE_MIN,
  ADDRESS_LINE_MAX_LENGTH,
  ADDRESS_LONGITUDE_MAX,
  ADDRESS_LONGITUDE_MIN,
  ADDRESS_PHONE_MAX_LENGTH,
  ADDRESS_POSTAL_CODE_MAX_LENGTH,
  ADDRESS_RECIPIENT_NAME_MAX_LENGTH,
  ADDRESS_SORTABLE_FIELDS,
  ADDRESS_TYPES,
} from "./constants";
export type { AddressLabel, AddressType } from "./constants";

export type { Address, CreateAddressInput, UpdateAddressInput } from "./types";

export { countryCodeSchema, latitudeSchema, longitudeSchema, postalCodeSchema } from "./schemas";

export { createAddressSchema, updateAddressSchema } from "./validation";
export type {
  AddressResponseDto,
  BillingAddressDto,
  CreateAddressDto,
  ShippingAddressDto,
  UpdateAddressDto,
} from "./dto";

export type { AddressFilterOptions, AddressMapper, ShippableAddress } from "./interfaces";

export {
  areCoordinatesRequired,
  findDefaultAddress,
  formatAddressLine,
  hasCoordinates,
  toShippableAddress,
} from "./utils";

export { addressMapper } from "./mapper";

export { AddressPrismaRepository } from "./repository";
export type { AddressRepository } from "./repository";

export { AddressService } from "./service";
