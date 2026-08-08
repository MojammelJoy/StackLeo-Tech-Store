import { Router } from "express";

import { authenticate } from "../../../auth";
import { validateRequest } from "../../../common";
import { PaymentPrismaRepository, paymentOrderIdParamsSchema } from "../../payment";
import { PERMISSIONS, requirePermission } from "../../rbac";
import { AdminPaymentController } from "../controller";
import { AdminPaymentPrismaRepository } from "../repository";
import { AdminPaymentService } from "../service";

const adminPaymentRepository = new AdminPaymentPrismaRepository();
const paymentRepository = new PaymentPrismaRepository();
const adminPaymentService = new AdminPaymentService(adminPaymentRepository, paymentRepository);
const adminPaymentController = new AdminPaymentController(adminPaymentService);

/**
 * Mounted at `/api/v1/admin/payments`. Read-only — see
 * `service/admin-payment.service.ts`'s doc comment: no gateway
 * integration, capture, or refund processing lives here. Route order
 * matters: `/summary` is registered before `/order/:orderId` /
 * generic paths so Express never mistakes that literal segment for a
 * param.
 */
export const adminPaymentRouter: Router = Router();

adminPaymentRouter.get(
  "/",
  authenticate,
  requirePermission(PERMISSIONS.PAYMENT_READ),
  adminPaymentController.list,
);
adminPaymentRouter.get(
  "/summary",
  authenticate,
  requirePermission(PERMISSIONS.PAYMENT_READ),
  adminPaymentController.getStatusSummary,
);
adminPaymentRouter.get(
  "/order/:orderId",
  authenticate,
  requirePermission(PERMISSIONS.PAYMENT_READ),
  validateRequest({ params: paymentOrderIdParamsSchema }),
  adminPaymentController.listForOrder,
);
