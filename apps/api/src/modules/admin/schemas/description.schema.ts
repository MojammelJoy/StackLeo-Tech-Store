import { z } from "zod";

import { SYSTEM_SETTING_DESCRIPTION_MAX_LENGTH } from "../constants";

export const descriptionSchema = z.string().max(SYSTEM_SETTING_DESCRIPTION_MAX_LENGTH);
