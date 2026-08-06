import { formatMoney } from "../utils";

import type { PaymentResponseDto, PaymentTransactionResponseDto } from "../dto";
import type { PaymentMapper } from "../interfaces";
import type { Payment, PaymentTransaction } from "../types";

function toResponseDto(payment: Payment): PaymentResponseDto {
  return {
    id: payment.id,
    transactionId: payment.transactionId,
    orderId: payment.orderId,
    userId: payment.userId,
    method: payment.method,
    provider: payment.provider,
    status: payment.status,
    amount: payment.amount,
    currency: payment.currency,
    formattedAmount: formatMoney({ amount: payment.amount, currency: payment.currency }),
    providerRef: payment.providerRef,
    metadata: payment.metadata,
    createdAt: payment.createdAt,
    updatedAt: payment.updatedAt,
  };
}

function toTransactionResponseDto(transaction: PaymentTransaction): PaymentTransactionResponseDto {
  return {
    id: transaction.id,
    paymentId: transaction.paymentId,
    type: transaction.type,
    status: transaction.status,
    amount: transaction.amount.amount,
    currency: transaction.amount.currency,
    formattedAmount: formatMoney(transaction.amount),
    providerRef: transaction.providerRef,
    errorMessage: transaction.errorMessage,
    createdAt: transaction.createdAt,
  };
}

function toTransactionResponseList(
  transactions: PaymentTransaction[],
): PaymentTransactionResponseDto[] {
  return transactions.map(toTransactionResponseDto);
}

/** The only place a `Payment`/`PaymentTransaction` is converted to its
 * public response-DTO shape — callers map through this instead of
 * building the DTO by hand. */
export const paymentMapper: PaymentMapper = {
  toResponseDto,
  toTransactionResponseDto,
  toTransactionResponseList,
};
