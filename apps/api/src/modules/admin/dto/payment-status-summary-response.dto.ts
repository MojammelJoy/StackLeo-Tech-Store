import type { PaymentStatusSummary } from "../repository";

/** The "payment status summary" deliverable — reuses `PaymentStatusSummary`
 * verbatim (see `dto/dashboard-overview-response.dto.ts` for the same
 * pattern). */
export type PaymentStatusSummaryResponseDto = PaymentStatusSummary;
