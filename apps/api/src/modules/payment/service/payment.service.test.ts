import { describe, expect, it, vi } from "vitest";

import { createTestAuthenticatedUser } from "../../../testing";
import { PAYMENT_PROVIDERS, PAYMENT_STATUSES } from "../constants";

import { PaymentService } from "./payment.service";

import type { AuthenticatedUser } from "../../../auth";
import type { OrderLookupProvider, OrderPaymentSnapshot } from "../interfaces";
import type { PaymentProvider } from "../providers";
import type { PaymentRepository } from "../repository";
import type { Payment } from "../types";

function buildOrderSnapshot(overrides: Partial<OrderPaymentSnapshot> = {}): OrderPaymentSnapshot {
  return {
    id: "order-1",
    userId: "user-1",
    status: "pending",
    currency: "BDT",
    total: 5000,
    ...overrides,
  };
}

function buildPayment(overrides: Partial<Payment> = {}): Payment {
  return {
    id: "payment-1",
    transactionId: "TEST-PAY-00000001",
    sequenceNumber: 1,
    orderId: "order-1",
    userId: "user-1",
    method: "cash_on_delivery",
    provider: PAYMENT_PROVIDERS.MANUAL,
    status: PAYMENT_STATUSES.PENDING,
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
    findById: vi.fn().mockResolvedValue(null),
    findByTransactionId: vi.fn().mockResolvedValue(null),
    findByProviderRef: vi.fn().mockResolvedValue(null),
    findByOrderId: vi.fn().mockResolvedValue([]),
    findByUserId: vi.fn(),
    findAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    recordOutcome: vi.fn(),
    findTransactionsByPaymentId: vi.fn().mockResolvedValue([]),
    addTransaction: vi.fn(),
    ...overrides,
  };
}

function buildOrderLookup(overrides: Partial<OrderLookupProvider> = {}): OrderLookupProvider {
  return {
    getOwnedOrder: vi.fn().mockResolvedValue(buildOrderSnapshot()),
    ...overrides,
  };
}

function buildStripeProvider(overrides: Partial<PaymentProvider> = {}): PaymentProvider {
  return {
    name: PAYMENT_PROVIDERS.STRIPE,
    charge: vi.fn(),
    verify: vi.fn(),
    refund: vi.fn(),
    ...overrides,
  };
}

const ACTOR: AuthenticatedUser = createTestAuthenticatedUser({ id: "user-1" });

describe("PaymentService", () => {
  describe("create", () => {
    it("rejects when amount does not match the order total", async () => {
      const paymentRepository = buildPaymentRepository();
      const service = new PaymentService(paymentRepository, {}, buildOrderLookup());

      await expect(
        service.create(
          {
            orderId: "order-1",
            method: "cash_on_delivery",
            provider: PAYMENT_PROVIDERS.MANUAL,
            amount: 9999,
            currency: "BDT",
          },
          ACTOR,
        ),
      ).rejects.toThrow(/does not match/i);
      expect(paymentRepository.create).not.toHaveBeenCalled();
    });

    it("rejects when currency does not match the order currency", async () => {
      const paymentRepository = buildPaymentRepository();
      const service = new PaymentService(paymentRepository, {}, buildOrderLookup());

      await expect(
        service.create(
          {
            orderId: "order-1",
            method: "cash_on_delivery",
            provider: PAYMENT_PROVIDERS.MANUAL,
            amount: 5000,
            currency: "USD",
          },
          ACTOR,
        ),
      ).rejects.toThrow(/does not match/i);
      expect(paymentRepository.create).not.toHaveBeenCalled();
    });

    it("rejects paying for a cancelled order", async () => {
      const paymentRepository = buildPaymentRepository();
      const orderLookup = buildOrderLookup({
        getOwnedOrder: vi.fn().mockResolvedValue(buildOrderSnapshot({ status: "cancelled" })),
      });
      const service = new PaymentService(paymentRepository, {}, orderLookup);

      await expect(
        service.create(
          {
            orderId: "order-1",
            method: "cash_on_delivery",
            provider: PAYMENT_PROVIDERS.MANUAL,
            amount: 5000,
            currency: "BDT",
          },
          ACTOR,
        ),
      ).rejects.toThrow(/cancelled order/i);
    });

    it("rejects when the order already has a successful payment", async () => {
      const paymentRepository = buildPaymentRepository({
        findByOrderId: vi
          .fn()
          .mockResolvedValue([buildPayment({ status: PAYMENT_STATUSES.SUCCEEDED })]),
      });
      const service = new PaymentService(paymentRepository, {}, buildOrderLookup());

      await expect(
        service.create(
          {
            orderId: "order-1",
            method: "cash_on_delivery",
            provider: PAYMENT_PROVIDERS.MANUAL,
            amount: 5000,
            currency: "BDT",
          },
          ACTOR,
        ),
      ).rejects.toThrow(/already been paid/i);
      expect(paymentRepository.create).not.toHaveBeenCalled();
    });

    it("creates a cash-on-delivery payment without calling any gateway", async () => {
      const created = buildPayment();
      const paymentRepository = buildPaymentRepository({
        create: vi.fn().mockResolvedValue(created),
      });
      const service = new PaymentService(paymentRepository, {}, buildOrderLookup());

      const result = await service.create(
        {
          orderId: "order-1",
          method: "cash_on_delivery",
          provider: PAYMENT_PROVIDERS.MANUAL,
          amount: 5000,
          currency: "BDT",
        },
        ACTOR,
      );

      expect(result.status).toBe(PAYMENT_STATUSES.PENDING);
      expect(paymentRepository.recordOutcome).not.toHaveBeenCalled();
    });

    it("records a FAILED outcome when the gateway provider is unintegrated", async () => {
      const created = buildPayment({ provider: PAYMENT_PROVIDERS.STRIPE, method: "card" });
      const failed = buildPayment({
        provider: PAYMENT_PROVIDERS.STRIPE,
        status: PAYMENT_STATUSES.FAILED,
      });
      const paymentRepository = buildPaymentRepository({
        create: vi.fn().mockResolvedValue(created),
        recordOutcome: vi.fn().mockResolvedValue(failed),
      });
      const stripe = buildStripeProvider({
        charge: vi
          .fn()
          .mockRejectedValue(new Error("StripeProvider.charge is not implemented yet")),
      });
      const service = new PaymentService(
        paymentRepository,
        { [PAYMENT_PROVIDERS.STRIPE]: stripe },
        buildOrderLookup(),
      );

      const result = await service.create(
        {
          orderId: "order-1",
          method: "card",
          provider: PAYMENT_PROVIDERS.STRIPE,
          amount: 5000,
          currency: "BDT",
        },
        ACTOR,
      );

      expect(result.status).toBe(PAYMENT_STATUSES.FAILED);
      expect(paymentRepository.recordOutcome).toHaveBeenCalledWith(
        created.id,
        PAYMENT_STATUSES.FAILED,
        PAYMENT_STATUSES.PENDING,
        expect.objectContaining({ errorMessage: expect.stringContaining("not implemented") }),
      );
    });
  });

  describe("ownership", () => {
    it("reports a foreign payment as not found", async () => {
      const paymentRepository = buildPaymentRepository({
        findById: vi.fn().mockResolvedValue(buildPayment({ userId: "someone-else" })),
      });
      const service = new PaymentService(paymentRepository, {}, buildOrderLookup());

      await expect(service.getById("payment-1", ACTOR)).rejects.toThrow(/not found/i);
    });
  });

  describe("cancel", () => {
    it("cancels a pending payment", async () => {
      const payment = buildPayment({ status: PAYMENT_STATUSES.PENDING });
      const paymentRepository = buildPaymentRepository({
        findById: vi.fn().mockResolvedValue(payment),
        recordOutcome: vi
          .fn()
          .mockResolvedValue({ ...payment, status: PAYMENT_STATUSES.CANCELLED }),
      });
      const service = new PaymentService(paymentRepository, {}, buildOrderLookup());

      await service.cancel("payment-1", {}, ACTOR);

      expect(paymentRepository.recordOutcome).toHaveBeenCalledWith(
        "payment-1",
        PAYMENT_STATUSES.CANCELLED,
        PAYMENT_STATUSES.PENDING,
        expect.objectContaining({ type: "cancellation" }),
      );
    });

    it("rejects cancelling a succeeded payment", async () => {
      const payment = buildPayment({ status: PAYMENT_STATUSES.SUCCEEDED });
      const paymentRepository = buildPaymentRepository({
        findById: vi.fn().mockResolvedValue(payment),
      });
      const service = new PaymentService(paymentRepository, {}, buildOrderLookup());

      await expect(service.cancel("payment-1", {}, ACTOR)).rejects.toThrow(
        /can no longer be cancelled/i,
      );
      expect(paymentRepository.recordOutcome).not.toHaveBeenCalled();
    });
  });

  describe("retry", () => {
    it("rejects retrying a still-pending payment", async () => {
      const payment = buildPayment({ status: PAYMENT_STATUSES.PENDING });
      const paymentRepository = buildPaymentRepository({
        findById: vi.fn().mockResolvedValue(payment),
      });
      const service = new PaymentService(paymentRepository, {}, buildOrderLookup());

      await expect(service.retry("payment-1", {}, ACTOR)).rejects.toThrow(/cannot be retried/i);
      expect(paymentRepository.create).not.toHaveBeenCalled();
    });

    it("creates a new payment row when retrying a failed one", async () => {
      const failedPayment = buildPayment({ status: PAYMENT_STATUSES.FAILED });
      const retried = buildPayment({ id: "payment-2", status: PAYMENT_STATUSES.PENDING });
      const paymentRepository = buildPaymentRepository({
        findById: vi.fn().mockResolvedValue(failedPayment),
        create: vi.fn().mockResolvedValue(retried),
      });
      const service = new PaymentService(paymentRepository, {}, buildOrderLookup());

      await service.retry("payment-1", {}, ACTOR);

      expect(paymentRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ orderId: "order-1", amount: 5000, currency: "BDT" }),
      );
    });
  });

  describe("markCashOnDeliveryCollected", () => {
    it("rejects marking a non-manual payment collected", async () => {
      const payment = buildPayment({ provider: PAYMENT_PROVIDERS.STRIPE });
      const paymentRepository = buildPaymentRepository({
        findById: vi.fn().mockResolvedValue(payment),
      });
      const service = new PaymentService(paymentRepository, {}, buildOrderLookup());

      await expect(service.markCashOnDeliveryCollected("payment-1", ACTOR)).rejects.toThrow(
        /only cash-on-delivery/i,
      );
    });

    it("marks a pending cash-on-delivery payment succeeded", async () => {
      const payment = buildPayment({ status: PAYMENT_STATUSES.PENDING });
      const paymentRepository = buildPaymentRepository({
        findById: vi.fn().mockResolvedValue(payment),
        recordOutcome: vi
          .fn()
          .mockResolvedValue({ ...payment, status: PAYMENT_STATUSES.SUCCEEDED }),
      });
      const service = new PaymentService(paymentRepository, {}, buildOrderLookup());

      const result = await service.markCashOnDeliveryCollected("payment-1", ACTOR);

      expect(result.status).toBe(PAYMENT_STATUSES.SUCCEEDED);
    });
  });
});
