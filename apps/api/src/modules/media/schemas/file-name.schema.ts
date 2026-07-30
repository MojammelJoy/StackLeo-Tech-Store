import { z } from "zod";

import { MEDIA_FILE_NAME_MAX_LENGTH } from "../constants";

export const fileNameSchema = z.string().min(1).max(MEDIA_FILE_NAME_MAX_LENGTH);
