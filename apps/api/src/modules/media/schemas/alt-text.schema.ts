import { z } from "zod";

import { MEDIA_ALT_TEXT_MAX_LENGTH } from "../constants";

export const altTextSchema = z.string().max(MEDIA_ALT_TEXT_MAX_LENGTH);
