import type { PaymentResponseDto, PaymentTransactionResponseDto } from "../dto";
import type { Payment, PaymentTransaction } from "../types";

/** Contract `mapper/payment.mapper.ts` implements. Kept separate from
 * `mapper/` itself (mirroring `repository/`'s interface-vs-implementation
 * split) so a future alternate mapper — or a test double — can satisfy
 * the same shape without depending on the concrete implementation. */
export interface PaymentMapper {
  toResponseDto(payment: Payment): PaymentResponseDto;
  toTransactionResponseDto(transaction: PaymentTransaction): PaymentTransactionResponseDto;
  toTransactionResponseList(transactions: PaymentTransaction[]): PaymentTransactionResponseDto[];
}
