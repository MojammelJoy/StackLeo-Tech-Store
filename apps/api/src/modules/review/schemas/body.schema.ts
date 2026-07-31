import { z } from "zod";

import { REVIEW_BODY_MAX_LENGTH, REVIEW_BODY_MIN_LENGTH } from "../constants";

export const bodySchema = z.string().min(REVIEW_BODY_MIN_LENGTH).max(REVIEW_BODY_MAX_LENGTH);
