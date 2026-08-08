export interface PaymentStatusBreakdown {
  status: string;
  count: number;
  amount: number;
}

export interface PaymentMethodBreakdown {
  method: string;
  count: number;
}

export interface PaymentProviderBreakdown {
  provider: string;
  count: number;
}

/** All scoped to `Payment.createdAt` within the range. `successfulCount`/
 * `failedCount`/`pendingCount` are read directly from `statusDistribution`
 * (never a separate query) — see
 * `repository/analytics.repository.prisma.ts`'s `getPaymentSummary`. */
export interface PaymentAnalyticsSummary {
  statusDistribution: PaymentStatusBreakdown[];
  methodDistribution: PaymentMethodBreakdown[];
  providerDistribution: PaymentProviderBreakdown[];
  successfulCount: number;
  failedCount: number;
  pendingCount: number;
}
