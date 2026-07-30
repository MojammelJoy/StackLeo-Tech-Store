import { z } from "zod";

import { SEARCH_ENTITY_TYPES } from "../constants";

export const entityTypeSchema = z.enum([
  SEARCH_ENTITY_TYPES.PRODUCT,
  SEARCH_ENTITY_TYPES.CATEGORY,
  SEARCH_ENTITY_TYPES.BRAND,
]);
