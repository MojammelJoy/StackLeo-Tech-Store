import { z } from "zod";

import { MODERATION_STATUSES } from "../constants";

export const moderateReviewSchema = z.object({
  status: z.enum([
    MODERATION_STATUSES.PENDING,
    MODERATION_STATUSES.APPROVED,
    MODERATION_STATUSES.REJECTED,
    MODERATION_STATUSES.FLAGGED,
  ]),
});
