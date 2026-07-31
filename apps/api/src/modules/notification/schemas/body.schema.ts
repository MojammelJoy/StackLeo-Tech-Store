import { z } from "zod";

import { NOTIFICATION_BODY_MAX_LENGTH } from "../constants";

export const bodySchema = z.string().min(1).max(NOTIFICATION_BODY_MAX_LENGTH);
