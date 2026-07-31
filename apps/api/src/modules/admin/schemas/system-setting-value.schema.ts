import { z } from "zod";

import { SYSTEM_SETTING_VALUE_MAX_LENGTH } from "../constants";

export const systemSettingValueSchema = z.string().max(SYSTEM_SETTING_VALUE_MAX_LENGTH);
