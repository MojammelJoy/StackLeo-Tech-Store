import { z } from "zod";

import { REPORT_TYPE_MAX_LENGTH } from "../constants";

export const reportTypeSchema = z.string().min(1).max(REPORT_TYPE_MAX_LENGTH);
