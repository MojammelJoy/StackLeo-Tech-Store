export const REPORT_FORMATS = {
  CSV: "csv",
  JSON: "json",
  PDF: "pdf",
} as const;

export type ReportFormat = (typeof REPORT_FORMATS)[keyof typeof REPORT_FORMATS];
