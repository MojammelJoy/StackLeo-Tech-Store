/**
 * Named date-range shortcuts every domain analytics endpoint accepts
 * alongside an explicit `from`/`to` pair — see
 * `utils/date-range.util.ts`'s `resolveDateRangePreset`. `CUSTOM` means
 * "use the request's own `from`/`to`" rather than resolving one of the
 * fixed windows below.
 */
export const DATE_RANGE_PRESETS = {
  TODAY: "today",
  YESTERDAY: "yesterday",
  LAST_7_DAYS: "last7days",
  LAST_30_DAYS: "last30days",
  CURRENT_MONTH: "currentMonth",
  PREVIOUS_MONTH: "previousMonth",
  CURRENT_YEAR: "currentYear",
  CUSTOM: "custom",
} as const;

export type DateRangePreset = (typeof DATE_RANGE_PRESETS)[keyof typeof DATE_RANGE_PRESETS];
