import { z } from "zod";

import { ADDRESS_COUNTRY_CODE_LENGTH } from "../constants";

/** ISO 3166-1 alpha-2, e.g. "US", "BD". Uppercased so "us"/"US" are treated identically. */
export const countryCodeSchema = z
  .string()
  .length(ADDRESS_COUNTRY_CODE_LENGTH)
  .transform((value) => value.toUpperCase());
