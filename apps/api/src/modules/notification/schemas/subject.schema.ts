import { z } from "zod";

import { NOTIFICATION_SUBJECT_MAX_LENGTH } from "../constants";

export const subjectSchema = z.string().min(1).max(NOTIFICATION_SUBJECT_MAX_LENGTH);
