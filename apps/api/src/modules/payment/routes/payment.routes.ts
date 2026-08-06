import { Router } from "express";

import { authenticate } from "../../../auth";
import { validateRequest } from "../../../common";
import { AddressPrismaRepository, AddressService } from "../../address";
import { CartPrismaRepository, CartService, ProductAvailabilityPrismaRepository } from "../../cart";
import { OrderPrismaRepository, OrderService, ProductSnapshotPrismaRepository } from "../../order";
import { PAYMENT_PROVIDERS } from "../constants";
import { PaymentController } from "../controller";
import { BkashProvider, NagadProvider, SslcommerzProvider, StripeProvider } from "../providers";
import { PaymentPrismaRepository } from "../repository";
import { PaymentService } from "../service";
import {
  cancelPaymentSchema,
  createPaymentSchema,
  paymentIdParamsSchema,
  paymentOrderIdParamsSchema,
  retryPaymentSchema,
  transactionIdParamsSchema,
  verifyPaymentSchema,
} from "../validation";

import type { AddressSnapshotProvider, CartCheckoutProvider } from "../../order";
import type { PaymentProviderName } from "../constants";
import type { OrderLookupProvider } from "../interfaces";
import type { PaymentProvider } from "../providers";

const paymentRepository = new PaymentPrismaRepository();

/**
 * The `PaymentProvider` registry — one entry per gateway `PAYMENT_PROVIDERS`
 * knows about, `PAYMENT_PROVIDERS.MANUAL` (cash on delivery) deliberately
 * absent since it needs no gateway class at all (see
 * `PaymentService.attemptCharge`'s doc comment). Every config below is a
 * placeholder: none of these classes' methods read `this.config` (they
 * unconditionally throw `NotImplementedError` — see `providers/`'s doc
 * comments), so there are no real credentials to source from `config/`
 * yet. This registry is exactly "prepare the architecture so payment
 * providers can be plugged in later through interfaces" — swapping a
 * real Stripe/SSLCommerz/bKash/Nagad SDK integration in later means
 * replacing one class here, never touching `PaymentService`.
 */
const paymentProviders: Partial<Record<PaymentProviderName, PaymentProvider>> = {
  [PAYMENT_PROVIDERS.STRIPE]: new StripeProvider({ secretKey: "", webhookSecret: "" }),
  [PAYMENT_PROVIDERS.SSLCOMMERZ]: new SslcommerzProvider({
    storeId: "",
    storePassword: "",
    sandbox: true,
  }),
  [PAYMENT_PROVIDERS.BKASH]: new BkashProvider({
    appKey: "",
    appSecret: "",
    username: "",
    password: "",
    sandbox: true,
  }),
  [PAYMENT_PROVIDERS.NAGAD]: new NagadProvider({
    merchantId: "",
    merchantPrivateKey: "",
    nagadPublicKey: "",
    sandbox: true,
  }),
};

/**
 * `PaymentService.create`/`retry`'s only integration point with
 * `modules/order` — a real `OrderService` instance, constructed here
 * (the composition root) exactly like every other cross-module wiring
 * in this app, adapted down to the narrow `OrderLookupProvider`
 * interface — see that interface's doc comment for why. Reuses
 * `modules/order`'s own `CartCheckoutProvider`/`AddressSnapshotProvider`
 * adapters (it needs a real `OrderService` for the same reasons
 * `modules/order/routes/order.routes.ts` does).
 */
const cartServiceForOrder = new CartService(
  new CartPrismaRepository(),
  new ProductAvailabilityPrismaRepository(),
);
const cartCheckoutForOrder: CartCheckoutProvider = {
  async getCartForCheckout(actor) {
    const cart = await cartServiceForOrder.getCartForUser(actor);
    return {
      id: cart.id,
      currency: cart.currency,
      items: cart.items.map((item) => ({
        productId: item.productId,
        sku: item.sku,
        quantity: item.quantity,
      })),
    };
  },
  async markCartConverted(cartId, actor) {
    await cartServiceForOrder.convertCart(cartId, actor);
  },
};

const addressServiceForOrder = new AddressService(new AddressPrismaRepository());
const addressSnapshotForOrder: AddressSnapshotProvider = {
  async getOwnedAddressSnapshot(actor, addressId) {
    const address = await addressServiceForOrder.getById(addressId, actor);
    return {
      recipientName: address.recipientName,
      phone: address.phone,
      line1: address.line1,
      line2: address.line2,
      city: address.city,
      district: address.district,
      division: address.division,
      postalCode: address.postalCode,
      country: address.country,
    };
  },
};

const orderService = new OrderService(
  new OrderPrismaRepository(),
  new ProductSnapshotPrismaRepository(),
  cartCheckoutForOrder,
  addressSnapshotForOrder,
);
const orderLookup: OrderLookupProvider = {
  async getOwnedOrder(actor, orderId) {
    const order = await orderService.getById(orderId, actor);
    return {
      id: order.id,
      userId: order.userId,
      status: order.status,
      currency: order.summary.currency,
      total: order.summary.total,
    };
  },
};

const paymentService = new PaymentService(paymentRepository, paymentProviders, orderLookup);
const paymentController = new PaymentController(paymentService);

/**
 * The full Payment API surface, mounted at `/api/v1/payments` (see
 * `routes/v1/index.ts`). Every endpoint requires `authenticate` — this
 * module has no guest/public path at all, per this API's "authenticated
 * users only" requirement.
 */
export const paymentRouter: Router = Router();

paymentRouter.post(
  "/",
  authenticate,
  validateRequest({ body: createPaymentSchema }),
  paymentController.create,
);
paymentRouter.get("/", authenticate, paymentController.list);

paymentRouter.get(
  "/transaction/:transactionId",
  authenticate,
  validateRequest({ params: transactionIdParamsSchema }),
  paymentController.getByTransactionId,
);
paymentRouter.get(
  "/order/:orderId",
  authenticate,
  validateRequest({ params: paymentOrderIdParamsSchema }),
  paymentController.listForOrder,
);

paymentRouter.get(
  "/:id",
  authenticate,
  validateRequest({ params: paymentIdParamsSchema }),
  paymentController.getById,
);
paymentRouter.get(
  "/:id/transactions",
  authenticate,
  validateRequest({ params: paymentIdParamsSchema }),
  paymentController.getTransactions,
);
paymentRouter.post(
  "/:id/verify",
  authenticate,
  validateRequest({ params: paymentIdParamsSchema, body: verifyPaymentSchema }),
  paymentController.verify,
);
paymentRouter.post(
  "/:id/retry",
  authenticate,
  validateRequest({ params: paymentIdParamsSchema, body: retryPaymentSchema }),
  paymentController.retry,
);
paymentRouter.post(
  "/:id/cancel",
  authenticate,
  validateRequest({ params: paymentIdParamsSchema, body: cancelPaymentSchema }),
  paymentController.cancel,
);
paymentRouter.post(
  "/:id/collect",
  authenticate,
  validateRequest({ params: paymentIdParamsSchema }),
  paymentController.markCollected,
);
