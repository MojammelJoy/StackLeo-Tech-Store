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
import { areCoordinatesRequired } from "../utils";

/**
 * `latitude`/`longitude` are required together in production (see
 * `utils/coordinates.util.ts`'s `areCoordinatesRequired`) and optional
 * (individually or together) outside it — the same prod-vs-dev split
 * `modules/brand`'s URL schema and `modules/inventory`'s movement
 * schema already use elsewhere in this app.
 */
export const createAddressSchema = z
  .object({
    type: z.enum([ADDRESS_TYPES.BILLING, ADDRESS_TYPES.SHIPPING, ADDRESS_TYPES.BOTH]),
    label: z
      .enum([ADDRESS_LABELS.HOME, ADDRESS_LABELS.OFFICE, ADDRESS_LABELS.OTHER])
      .default(ADDRESS_LABELS.HOME),
    recipientName: z.string().min(1).max(ADDRESS_RECIPIENT_NAME_MAX_LENGTH),
    phone: z.string().max(ADDRESS_PHONE_MAX_LENGTH).optional(),
    line1: z.string().min(1).max(ADDRESS_LINE_MAX_LENGTH),
    line2: z.string().max(ADDRESS_LINE_MAX_LENGTH).optional(),
    city: z.string().min(1).max(ADDRESS_CITY_MAX_LENGTH),
    district: z.string().max(ADDRESS_DISTRICT_MAX_LENGTH).optional(),
    division: z.string().min(1).max(ADDRESS_DIVISION_MAX_LENGTH),
    postalCode: postalCodeSchema,
    country: countryCodeSchema,
    latitude: latitudeSchema.optional(),
    longitude: longitudeSchema.optional(),
  })
  .refine((data) => !areCoordinatesRequired() || data.latitude !== undefined, {
    message: "Latitude is required",
    path: ["latitude"],
  })
  .refine((data) => !areCoordinatesRequired() || data.longitude !== undefined, {
    message: "Longitude is required",
    path: ["longitude"],
  });
