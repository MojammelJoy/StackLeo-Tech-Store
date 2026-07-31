import type { ReportFormat } from "../constants";

export interface ReportRequest {
  reportType: string;
  from: Date;
  to: Date;
  format: ReportFormat;
}
