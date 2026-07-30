import { z } from "zod";

import {
  ADDRESS_LATITUDE_MAX,
  ADDRESS_LATITUDE_MIN,
  ADDRESS_LONGITUDE_MAX,
  ADDRESS_LONGITUDE_MIN,
} from "../constants";

export const latitudeSchema = z.number().min(ADDRESS_LATITUDE_MIN).max(ADDRESS_LATITUDE_MAX);
export const longitudeSchema = z.number().min(ADDRESS_LONGITUDE_MIN).max(ADDRESS_LONGITUDE_MAX);
