/** The time bucket a metric series or dashboard KPI is aggregated at —
 * shared across every metric type rather than each one defining its
 * own. */
export const TIME_GRANULARITIES = {
  HOURLY: "hourly",
  DAILY: "daily",
  WEEKLY: "weekly",
  MONTHLY: "monthly",
  YEARLY: "yearly",
} as const;

export type TimeGranularity = (typeof TIME_GRANULARITIES)[keyof typeof TIME_GRANULARITIES];
