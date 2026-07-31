import { z } from "zod";

import { SUPPORTED_CURRENCIES } from "../constants";

export const currencyCodeSchema = z.enum(SUPPORTED_CURRENCIES);
