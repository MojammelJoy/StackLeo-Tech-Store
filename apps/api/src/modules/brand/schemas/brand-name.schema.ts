import { z } from "zod";

import { BRAND_NAME_MAX_LENGTH, BRAND_NAME_MIN_LENGTH } from "../constants";

/** Reusable across `validation/create-brand.schema.ts` and `update-brand.schema.ts`. */
export const brandNameSchema = z.string().min(BRAND_NAME_MIN_LENGTH).max(BRAND_NAME_MAX_LENGTH);
