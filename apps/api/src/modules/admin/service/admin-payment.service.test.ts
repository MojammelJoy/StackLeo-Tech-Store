import { describe, expect, it, vi } from "vitest";

import { AdminPaymentService } from "./admin-payment.service";

import type { Payment, PaymentRepository } from "../../payment";
import type { AdminPaymentRepository, PaymentStatusSummary } from "../repository";

function buildPayment(overrides: Partial<Payment> = {}): Payment {
  return {
    id: "payment-1",
    transactionId: "PAY-00000001",
    sequenceNumber: 1,
    orderId: "order-1",
    userId: "user-1",
    method: "cash_on_delivery",
    provider: "manual",
    status: "pending",
    amount: 5000,
    currency: "BDT",
    providerRef: null,
    metadata: null,
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
    ...overrides,
  };
}

function buildPaymentRepository(overrides: Partial<PaymentRepository> = {}): PaymentRepository {
  return {
    findById: vi.fn(),
    findByTransactionId: vi.fn(),
    findByProviderRef: vi.fn(),
    findByOrderId: vi.fn().mockResolvedValue([]),
    findByUserId: vi.fn(),
    findAll: vi.fn().mockResolvedValue({ items: [], meta: {} }),
    create: vi.fn(),
    update: vi.fn(),
    recordOutcome: vi.fn(),
    findTransactionsByPaymentId: vi.fn(),
    addTransaction: vi.fn(),
    ...overrides,
  };
}

const ZERO_SUMMARY: PaymentStatusSummary = {
  pendingCount: 0,
  processingCount: 0,
  succeededCount: 0,
  failedCount: 0,
  cancelledCount: 0,
  partiallyRefundedCount: 0,
  refundedCount: 0,
};

describe("AdminPaymentService", () => {
  it("lists across every user via PaymentRepository.findAll (unscoped)", async () => {
    const findAll = vi.fn().mockResolvedValue({ items: [buildPayment()], meta: {} });
    const adminPaymentRepository: AdminPaymentRepository = {
      getStatusSummary: vi.fn().mockResolvedValue(ZERO_SUMMARY),
    };
    const service = new AdminPaymentService(
      adminPaymentRepository,
      buildPaymentRepository({ findAll }),
    );

    const result = await service.list({ pagination: {}, sort: [], filters: {} } as never, {});
    expect(findAll).toHaveBeenCalled();
    expect(result.items).toHaveLength(1);
  });

  it("lists every payment for an order regardless of who owns it", async () => {
    const findByOrderId = vi.fn().mockResolvedValue([buildPayment({ userId: "someone-else" })]);
    const adminPaymentRepository: AdminPaymentRepository = {
      getStatusSummary: vi.fn().mockResolvedValue(ZERO_SUMMARY),
    };
    const service = new AdminPaymentService(
      adminPaymentRepository,
      buildPaymentRepository({ findByOrderId }),
    );

    const result = await service.listForOrder("order-1");
    expect(findByOrderId).toHaveBeenCalledWith("order-1");
    expect(result).toHaveLength(1);
  });

  it("returns the payment status summary", async () => {
    const summary = { ...ZERO_SUMMARY, pendingCount: 3, failedCount: 1 };
    const adminPaymentRepository: AdminPaymentRepository = {
      getStatusSummary: vi.fn().mockResolvedValue(summary),
    };
    const service = new AdminPaymentService(adminPaymentRepository, buildPaymentRepository());

    const result = await service.getStatusSummary();
    expect(result).toEqual(summary);
  });
});
