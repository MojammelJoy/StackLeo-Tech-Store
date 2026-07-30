import { z } from "zod";

import {
  ADDRESS_CITY_MAX_LENGTH,
  ADDRESS_DISTRICT_MAX_LENGTH,
  ADDRESS_DIVISION_MAX_LENGTH,
  ADDRESS_LABELS,
  ADDRESS_LINE_MAX_LENGTH,
  ADDRESS_PHONE_MAX_LENGTH,
  ADDRESS_RECIPIENT_NAME_MAX_LENGTH,
  ADDRESS_TYPES,
} from "../constants";
import { countryCodeSchema, latitudeSchema, longitudeSchema, postalCodeSchema } from "../schemas";

/**
 * Deliberately excludes `isDefault` — see `UpdateAddressInput`'s comment
 * in `types/address.types.ts` for why. No coordinate requirement here
 * (unlike `create-address.schema.ts`): a partial update touching only
 * e.g. `phone` shouldn't be forced to also supply coordinates it isn't
 * changing.
 */
export const updateAddressSchema = z
  .object({
    type: z.enum([ADDRESS_TYPES.BILLING, ADDRESS_TYPES.SHIPPING, ADDRESS_TYPES.BOTH]),
    label: z.enum([ADDRESS_LABELS.HOME, ADDRESS_LABELS.OFFICE, ADDRESS_LABELS.OTHER]),
    recipientName: z.string().min(1).max(ADDRESS_RECIPIENT_NAME_MAX_LENGTH),
    phone: z.string().max(ADDRESS_PHONE_MAX_LENGTH),
    line1: z.string().min(1).max(ADDRESS_LINE_MAX_LENGTH),
    line2: z.string().max(ADDRESS_LINE_MAX_LENGTH),
    city: z.string().min(1).max(ADDRESS_CITY_MAX_LENGTH),
    district: z.string().max(ADDRESS_DISTRICT_MAX_LENGTH),
    division: z.string().min(1).max(ADDRESS_DIVISION_MAX_LENGTH),
    postalCode: postalCodeSchema,
    country: countryCodeSchema,
    latitude: latitudeSchema,
    longitude: longitudeSchema,
  })
  .partial();
