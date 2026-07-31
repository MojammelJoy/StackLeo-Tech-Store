import { z } from "zod";

import { REVIEW_TITLE_MAX_LENGTH } from "../constants";

export const titleSchema = z.string().max(REVIEW_TITLE_MAX_LENGTH);
