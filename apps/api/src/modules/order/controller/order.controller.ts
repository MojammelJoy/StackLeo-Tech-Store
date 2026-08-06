import { HTTP_STATUS, parseQuery, sendPaginatedResponse, sendSuccess } from "../../../common";
import { BadRequestError, UnauthorizedError } from "../../../errors";
import { asyncHandler } from "../../../utils";
import { ORDER_FILTERABLE_FIELDS, ORDER_SORTABLE_FIELDS } from "../constants";

import type { AuthenticatedUser } from "../../../auth";
import type { FilterParams } from "../../../common";
import type { FulfillmentStatus, OrderStatus, PaymentStatus } from "../constants";
import type { CancelOrderDto, CreateOrderDto, UpdateOrderStatusDto } from "../dto";
import type { OrderFilterOptions } from "../interfaces";
import type { OrderService } from "../service";
import type { Request } from "express";

function requireAuthenticatedUser(req: Request): AuthenticatedUser {
  if (!req.user) {
    throw new UnauthorizedError("Authentication required");
  }
  return req.user;
}

function requireParam(req: Request, key: string): string {
  const value = req.params[key];
  if (!value) {
    throw new BadRequestError(`"${key}" parameter is required`);
  }
  return value;
}

/** Combines `common/`'s generic `parsed.filters` into a typed
 * `OrderFilterOptions` the service can hand straight to the repository
 * — every field here corresponds 1:1 to `ORDER_FILTERABLE_FIELDS`. */
function extractFilterOptions(filters: FilterParams): OrderFilterOptions {
  const options: OrderFilterOptions = {};

  const status = filters.status;
  if (status) {
    options.status = String(status.value) as OrderStatus;
  }
  const paymentStatus = filters.paymentStatus;
  if (paymentStatus) {
    options.paymentStatus = String(paymentStatus.value) as PaymentStatus;
  }
  const fulfillmentStatus = filters.fulfillmentStatus;
  if (fulfillmentStatus) {
    options.fulfillmentStatus = String(fulfillmentStatus.value) as FulfillmentStatus;
  }

  return options;
}

/**
 * Express handlers for every Order API endpoint. Each method is an
 * `asyncHandler`-wrapped arrow function (bound automatically, so
 * `routes/order.routes.ts` can reference `orderController.x` directly)
 * and does only three things: read the request, call one
 * `OrderService` method, and send the response — no business logic
 * lives here, mirroring every other module's controller.
 *
 * Every endpoint requires `authenticate` at the route layer — this
 * module has no public/guest path at all, so every handler here calls
 * `requireAuthenticatedUser` unconditionally. `updateStatus` alone is
 * additionally gated by `requirePermission(PERMISSIONS.ORDER_UPDATE)`
 * at the route layer (staff-only) — see `modules/rbac`'s
 * `PERMISSIONS.ORDER_UPDATE` doc comment.
 */
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  placeOrder = asyncHandler(async (req, res) => {
    const actor = requireAuthenticatedUser(req);
    const dto = req.body as CreateOrderDto;
    const order = await this.orderService.placeOrder(actor, dto);
    sendSuccess(res, { order }, { statusCode: HTTP_STATUS.CREATED });
  });

  list = asyncHandler(async (req, res) => {
    const actor = requireAuthenticatedUser(req);
    const parsed = parseQuery(req.query, {
      sortableFields: ORDER_SORTABLE_FIELDS,
      filterableFields: ORDER_FILTERABLE_FIELDS,
    });
    const filters = extractFilterOptions(parsed.filters);
    const result = await this.orderService.listForUser(actor, parsed, filters);
    sendPaginatedResponse(res, result.items, result.meta);
  });

  getById = asyncHandler(async (req, res) => {
    const actor = requireAuthenticatedUser(req);
    const id = requireParam(req, "id");
    const order = await this.orderService.getById(id, actor);
    sendSuccess(res, { order });
  });

  getByOrderNumber = asyncHandler(async (req, res) => {
    const actor = requireAuthenticatedUser(req);
    const orderNumber = requireParam(req, "orderNumber");
    const order = await this.orderService.getByOrderNumber(orderNumber, actor);
    sendSuccess(res, { order });
  });

  getTimeline = asyncHandler(async (req, res) => {
    const actor = requireAuthenticatedUser(req);
    const id = requireParam(req, "id");
    const timeline = await this.orderService.getTimeline(id, actor);
    sendSuccess(res, { timeline });
  });

  cancel = asyncHandler(async (req, res) => {
    const actor = requireAuthenticatedUser(req);
    const id = requireParam(req, "id");
    const dto = req.body as CancelOrderDto;
    const order = await this.orderService.cancel(id, actor, dto);
    sendSuccess(res, { order });
  });

  updateStatus = asyncHandler(async (req, res) => {
    const actor = requireAuthenticatedUser(req);
    const id = requireParam(req, "id");
    const dto = req.body as UpdateOrderStatusDto;
    const order = await this.orderService.updateStatus(id, dto, actor);
    sendSuccess(res, { order });
  });
}
