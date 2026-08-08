import { Router } from "express";

import { authenticate } from "../../../auth";
import { validateRequest } from "../../../common";
import { AddressPrismaRepository, AddressService } from "../../address";
import { CartPrismaRepository, CartService, ProductAvailabilityPrismaRepository } from "../../cart";
import {
  OrderPrismaRepository,
  OrderService,
  ProductSnapshotPrismaRepository,
  cancelOrderSchema,
  orderIdParamsSchema,
  orderNumberParamsSchema,
  updateOrderStatusSchema,
} from "../../order";
import { PERMISSIONS, requirePermission } from "../../rbac";
import { AdminOrderController } from "../controller";
import { AdminOrderPrismaRepository } from "../repository";
import { AdminOrderService } from "../service";

import type { AddressSnapshotProvider, CartCheckoutProvider } from "../../order";

const adminOrderRepository = new AdminOrderPrismaRepository();
const orderRepository = new OrderPrismaRepository();
const productSnapshotRepository = new ProductSnapshotPrismaRepository();

/**
 * `OrderService`'s cart/address integration points — required to
 * construct a real instance (mirroring
 * `modules/order/routes/order.routes.ts`'s own composition exactly),
 * even though this router only ever calls `updateStatus`, which touches
 * neither.
 */
const cartServiceForOrder = new CartService(
  new CartPrismaRepository(),
  new ProductAvailabilityPrismaRepository(),
);
const cartCheckout: CartCheckoutProvider = {
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
const addressSnapshot: AddressSnapshotProvider = {
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
  orderRepository,
  productSnapshotRepository,
  cartCheckout,
  addressSnapshot,
);

const adminOrderService = new AdminOrderService(
  adminOrderRepository,
  orderRepository,
  orderService,
);
const adminOrderController = new AdminOrderController(adminOrderService);

/**
 * Mounted at `/api/v1/admin/orders`. `order:read` gates every lookup/
 * listing endpoint; `order:update` gates status changes and
 * administrative cancellation — mirrors `modules/order`'s own split
 * (customers self-cancel, staff progress status), just extended with a
 * dedicated read permission for admin-wide visibility (see
 * `PERMISSIONS.ORDER_READ`'s doc comment).
 */
export const adminOrderRouter: Router = Router();

adminOrderRouter.get(
  "/",
  authenticate,
  requirePermission(PERMISSIONS.ORDER_READ),
  adminOrderController.list,
);
adminOrderRouter.get(
  "/number/:orderNumber",
  authenticate,
  requirePermission(PERMISSIONS.ORDER_READ),
  validateRequest({ params: orderNumberParamsSchema }),
  adminOrderController.getByOrderNumber,
);
adminOrderRouter.get(
  "/:id",
  authenticate,
  requirePermission(PERMISSIONS.ORDER_READ),
  validateRequest({ params: orderIdParamsSchema }),
  adminOrderController.getById,
);
adminOrderRouter.get(
  "/:id/timeline",
  authenticate,
  requirePermission(PERMISSIONS.ORDER_READ),
  validateRequest({ params: orderIdParamsSchema }),
  adminOrderController.getTimeline,
);
adminOrderRouter.patch(
  "/:id/status",
  authenticate,
  requirePermission(PERMISSIONS.ORDER_UPDATE),
  validateRequest({ params: orderIdParamsSchema, body: updateOrderStatusSchema }),
  adminOrderController.updateStatus,
);
adminOrderRouter.post(
  "/:id/cancel",
  authenticate,
  requirePermission(PERMISSIONS.ORDER_UPDATE),
  validateRequest({ params: orderIdParamsSchema, body: cancelOrderSchema }),
  adminOrderController.cancel,
);
