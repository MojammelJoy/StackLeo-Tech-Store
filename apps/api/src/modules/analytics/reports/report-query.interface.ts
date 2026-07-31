import type { ReportFormat, ReportStatus } from "../constants";

/** Report-history filter criteria, layered on top of `common/`'s
 * generic `ParsedQuery` (pagination/sort/search). Shared between
 * `repository/` (the contract) and `service/` (the skeleton). */
export interface ReportFilterOptions {
  reportType?: string;
  status?: ReportStatus;
  format?: ReportFormat;
}
