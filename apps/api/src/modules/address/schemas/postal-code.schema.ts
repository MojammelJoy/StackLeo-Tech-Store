import { z } from "zod";

import { ADDRESS_POSTAL_CODE_MAX_LENGTH } from "../constants";

export const postalCodeSchema = z.string().min(1).max(ADDRESS_POSTAL_CODE_MAX_LENGTH);
