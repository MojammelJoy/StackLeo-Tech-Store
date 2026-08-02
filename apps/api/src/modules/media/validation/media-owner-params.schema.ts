import { z } from "zod";

import { MEDIA_OWNER_TYPES } from "../constants";

export const mediaOwnerParamsSchema = z.object({
  ownerType: z.enum([
    MEDIA_OWNER_TYPES.PRODUCT,
    MEDIA_OWNER_TYPES.BRAND,
    MEDIA_OWNER_TYPES.CATEGORY,
    MEDIA_OWNER_TYPES.USER,
  ]),
  ownerId: z.string().min(1),
});
