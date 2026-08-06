/**
 * The Address API: domain types, DTOs (including billing/shipping-
 * narrowed variants) + Zod validation schemas (built from reusable
 * field-level schemas in `schemas/`), the repository contract plus its
 * Prisma implementation, the mapper/utility helpers that support it
 * all, and the controller/routes exposing it at `/api/v1/addresses`.
 * Authenticated users only — shipping-cost/delivery-estimation/order/
 * payment concerns are explicitly out of scope.
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
  DEFAULT_ADDRESS_CONTEXTS,
} from "./constants";
export type { AddressLabel, AddressType, DefaultAddressContext } from "./constants";

export type { Address, CreateAddressInput, UpdateAddressInput } from "./types";

export { countryCodeSchema, latitudeSchema, longitudeSchema, postalCodeSchema } from "./schemas";

export { addressIdParamsSchema, createAddressSchema, updateAddressSchema } from "./validation";
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
export type { AddressLookupOptions, AddressRepository } from "./repository";

export { AddressService } from "./service";

export { AddressController } from "./controller";

export { addressRouter } from "./routes";
