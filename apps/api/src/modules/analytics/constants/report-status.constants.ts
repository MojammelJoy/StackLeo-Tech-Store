/** A generated report's lifecycle — report generation itself is out of
 * scope for this foundation (see `reports/report-generator.interface.ts`),
 * but the status a caller polls for needs somewhere to live. */
export const REPORT_STATUSES = {
  PENDING: "pending",
  GENERATING: "generating",
  COMPLETED: "completed",
  FAILED: "failed",
} as const;

export type ReportStatus = (typeof REPORT_STATUSES)[keyof typeof REPORT_STATUSES];
