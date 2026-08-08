import { parseQuery, sendPaginatedResponse, sendSuccess } from "../../../common";
import { asyncHandler } from "../../../utils";
import { ORDER_FILTERABLE_FIELDS, ORDER_SORTABLE_FIELDS } from "../../order";

import { requireAuthenticatedUser, requireParam } from "./shared";

import type { ParsedQuery } from "../../../common";
import type {
  CancelOrderDto,
  FulfillmentStatus,
  OrderFilterOptions,
  OrderStatus,
  PaymentStatus,
  UpdateOrderStatusDto,
} from "../../order";
import type { AdminOrderService } from "../service";

/** Combines `common/`'s generic `parsed.filters` (status/paymentStatus/
 * fulfillmentStatus) into one typed `OrderFilterOptions` — mirrors every
 * other module's `extractFilterOptions`. */
function extractFilterOptions(parsed: ParsedQuery): OrderFilterOptions {
  const filters: OrderFilterOptions = {};

  const status = parsed.filters.status;
  if (status) {
    filters.status = String(status.value) as OrderStatus;
  }

  const paymentStatus = parsed.filters.paymentStatus;
  if (paymentStatus) {
    filters.paymentStatus = String(paymentStatus.value) as PaymentStatus;
  }

  const fulfillmentStatus = parsed.filters.fulfillmentStatus;
  if (fulfillmentStatus) {
    filters.fulfillmentStatus = String(fulfillmentStatus.value) as FulfillmentStatus;
  }

  return filters;
}

/** Express handlers for administrative order management. */
export class AdminOrderController {
  constructor(private readonly adminOrderService: AdminOrderService) {}

  list = asyncHandler(async (req, res) => {
    const parsed = parseQuery(req.query, {
      sortableFields: ORDER_SORTABLE_FIELDS,
      filterableFields: ORDER_FILTERABLE_FIELDS,
    });
    const filters = extractFilterOptions(parsed);
    const result = await this.adminOrderService.list(parsed, filters);
    sendPaginatedResponse(res, result.items, result.meta);
  });

  getById = asyncHandler(async (req, res) => {
    const id = requireParam(req, "id");
    const order = await this.adminOrderService.getById(id);
    sendSuccess(res, { order });
  });

  getByOrderNumber = asyncHandler(async (req, res) => {
    const orderNumber = requireParam(req, "orderNumber");
    const order = await this.adminOrderService.getByOrderNumber(orderNumber);
    sendSuccess(res, { order });
  });

  getTimeline = asyncHandler(async (req, res) => {
    const id = requireParam(req, "id");
    const timeline = await this.adminOrderService.getTimeline(id);
    sendSuccess(res, { timeline });
  });

  updateStatus = asyncHandler(async (req, res) => {
    const actor = requireAuthenticatedUser(req);
    const id = requireParam(req, "id");
    const dto = req.body as UpdateOrderStatusDto;
    const order = await this.adminOrderService.updateStatus(id, dto, actor);
    sendSuccess(res, { order });
  });

  cancel = asyncHandler(async (req, res) => {
    const actor = requireAuthenticatedUser(req);
    const id = requireParam(req, "id");
    const dto = req.body as CancelOrderDto;
    const order = await this.adminOrderService.cancel(id, dto, actor);
    sendSuccess(res, { order });
  });
}
