import type { ReportFormat, ReportStatus } from "../constants";

/** What generating a report produces (or is in the process of
 * producing) — `downloadUrl`/`generatedAt` are `null` until `status`
 * reaches `REPORT_STATUSES.COMPLETED`. */
export interface ReportResult {
  id: string;
  reportType: string;
  format: ReportFormat;
  status: ReportStatus;
  downloadUrl: string | null;
  generatedAt: Date | null;
  createdAt: Date;
}
