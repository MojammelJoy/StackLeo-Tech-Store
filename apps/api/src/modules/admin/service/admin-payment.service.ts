import { paymentMapper } from "../../payment";

import type { PaginatedResult, ParsedQuery } from "../../../common";
import type { PaymentFilterOptions, PaymentRepository, PaymentResponseDto } from "../../payment";
import type { PaymentStatusSummaryResponseDto } from "../dto";
import type { AdminPaymentRepository } from "../repository";

/**
 * Read-only administrative payment visibility — "payment gateway
 * integration is NOT part of Admin API". `list`/`listForOrder` reuse
 * `modules/payment`'s own `PaymentRepository.findAll`/`findByOrderId`
 * directly: both are already unscoped there (the service-layer
 * ownership check lives in `PaymentService`, not the repository), so
 * there is nothing to duplicate. Only the status-summary aggregate is
 * genuinely new — see `AdminPaymentRepository`.
 */
export class AdminPaymentService {
  constructor(
    private readonly adminPaymentRepository: AdminPaymentRepository,
    private readonly paymentRepository: PaymentRepository,
  ) {}

  async list(
    query: ParsedQuery,
    filters: PaymentFilterOptions,
  ): Promise<PaginatedResult<PaymentResponseDto>> {
    const result = await this.paymentRepository.findAll(query, filters);
    return { items: result.items.map(paymentMapper.toResponseDto), meta: result.meta };
  }

  async listForOrder(orderId: string): Promise<PaymentResponseDto[]> {
    const payments = await this.paymentRepository.findByOrderId(orderId);
    return payments.map(paymentMapper.toResponseDto);
  }

  async getStatusSummary(): Promise<PaymentStatusSummaryResponseDto> {
    return this.adminPaymentRepository.getStatusSummary();
  }
}
