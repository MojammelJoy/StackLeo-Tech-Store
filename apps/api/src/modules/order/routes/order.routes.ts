import { Router } from "express";

import { authenticate } from "../../../auth";
import { validateRequest } from "../../../common";
import { AddressPrismaRepository, AddressService } from "../../address";
import { CartPrismaRepository, CartService, ProductAvailabilityPrismaRepository } from "../../cart";
import { PERMISSIONS, requirePermission } from "../../rbac";
import { OrderController } from "../controller";
import { OrderPrismaRepository, ProductSnapshotPrismaRepository } from "../repository";
import { OrderService } from "../service";
import {
  cancelOrderSchema,
  createOrderSchema,
  orderIdParamsSchema,
  orderNumberParamsSchema,
  updateOrderStatusSchema,
} from "../validation";

import type { AddressSnapshotProvider, CartCheckoutProvider } from "../interfaces";

const orderRepository = new OrderPrismaRepository();
const productSnapshotRepository = new ProductSnapshotPrismaRepository();

/**
 * `OrderService.placeOrder`'s two integration points with sibling
 * modules — real `CartService`/`AddressService` instances, constructed
 * here (the composition root) exactly like every other cross-module
 * wiring in this app (see `routes/v1/index.ts`'s doc comment on why
 * each routes file constructs its own repository/service instances
 * rather than sharing them), each adapted down to the narrow interface
 * `OrderService` actually depends on — see
 * `interfaces/cart-checkout.interface.ts`/
 * `interfaces/address-snapshot-provider.interface.ts` for why.
 */
const cartService = new CartService(
  new CartPrismaRepository(),
  new ProductAvailabilityPrismaRepository(),
);
const cartCheckout: CartCheckoutProvider = {
  async getCartForCheckout(actor) {
    const cart = await cartService.getCartForUser(actor);
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
    await cartService.convertCart(cartId, actor);
  },
};

const addressService = new AddressService(new AddressPrismaRepository());
const addressSnapshot: AddressSnapshotProvider = {
  async getOwnedAddressSnapshot(actor, addressId) {
    const address = await addressService.getById(addressId, actor);
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
  orderRepository,
  productSnapshotRepository,
  cartCheckout,
  addressSnapshot,
);
const orderController = new OrderController(orderService);

/**
 * The full Order API surface, mounted at `/api/v1/orders` (see
 * `routes/v1/index.ts`). Every endpoint requires `authenticate` — this
 * module has no guest/public path at all, per this API's "authenticated
 * users only" requirement. `PATCH /orders/:id/status` is additionally
 * gated by `requirePermission(PERMISSIONS.ORDER_UPDATE)` — a staff-only
 * capability distinct from a customer's own self-service `cancel` (see
 * `OrderService`'s doc comment).
 */
export const orderRouter: Router = Router();

orderRouter.post(
  "/",
  authenticate,
  validateRequest({ body: createOrderSchema }),
  orderController.placeOrder,
);
orderRouter.get("/", authenticate, orderController.list);

orderRouter.get(
  "/number/:orderNumber",
  authenticate,
  validateRequest({ params: orderNumberParamsSchema }),
  orderController.getByOrderNumber,
);

orderRouter.get(
  "/:id",
  authenticate,
  validateRequest({ params: orderIdParamsSchema }),
  orderController.getById,
);
orderRouter.get(
  "/:id/timeline",
  authenticate,
  validateRequest({ params: orderIdParamsSchema }),
  orderController.getTimeline,
);
orderRouter.post(
  "/:id/cancel",
  authenticate,
  validateRequest({ params: orderIdParamsSchema, body: cancelOrderSchema }),
  orderController.cancel,
);
orderRouter.patch(
  "/:id/status",
  authenticate,
  requirePermission(PERMISSIONS.ORDER_UPDATE),
  validateRequest({ params: orderIdParamsSchema, body: updateOrderStatusSchema }),
  orderController.updateStatus,
);
