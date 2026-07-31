import type { ReportRequest } from "./report-request.interface";
import type { ReportResult } from "./report-result.interface";

/** The report-generation abstraction `service/analytics.service.ts`
 * depends on — never a concrete generator directly, so swapping the
 * generation strategy (or a test double) never touches service code.
 * No actual report generation (querying data, rendering CSV/JSON/PDF)
 * happens in this foundation. */
export interface ReportGenerator {
  generate(request: ReportRequest): Promise<ReportResult>;
}
