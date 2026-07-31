import type { PaymentTransactionStatus, PaymentTransactionType } from "../constants";
import type { Money } from "./money.types";

export interface PaymentTransaction {
  id: string;
  paymentId: string;
  type: PaymentTransactionType;
  status: PaymentTransactionStatus;
  amount: Money;
  providerRef: string | null;
  errorMessage: string | null;
  createdAt: Date;
}

export interface CreatePaymentTransactionInput {
  paymentId: string;
  type: PaymentTransactionType;
  amount: Money;
  status?: PaymentTransactionStatus;
  providerRef?: string | null;
  errorMessage?: string | null;
}
