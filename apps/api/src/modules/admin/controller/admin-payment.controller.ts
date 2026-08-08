import { parseQuery, sendPaginatedResponse, sendSuccess } from "../../../common";
import { asyncHandler } from "../../../utils";
import { PAYMENT_FILTERABLE_FIELDS, PAYMENT_SORTABLE_FIELDS } from "../../payment";

import { requireParam } from "./shared";

import type { ParsedQuery } from "../../../common";
import type {
  PaymentFilterOptions,
  PaymentMethod,
  PaymentProviderName,
  PaymentStatus,
} from "../../payment";
import type { AdminPaymentService } from "../service";

/** Combines `common/`'s generic `parsed.filters` (status/method/
 * provider) into one typed `PaymentFilterOptions` — mirrors every other
 * module's `extractFilterOptions`. */
function extractFilterOptions(parsed: ParsedQuery): PaymentFilterOptions {
  const filters: PaymentFilterOptions = {};

  const status = parsed.filters.status;
  if (status) {
    filters.status = String(status.value) as PaymentStatus;
  }

  const method = parsed.filters.method;
  if (method) {
    filters.method = String(method.value) as PaymentMethod;
  }

  const provider = parsed.filters.provider;
  if (provider) {
    filters.provider = String(provider.value) as PaymentProviderName;
  }

  return filters;
}

/** Express handlers for read-only administrative payment visibility
 * (see `service/admin-payment.service.ts`). */
export class AdminPaymentController {
  constructor(private readonly adminPaymentService: AdminPaymentService) {}

  list = asyncHandler(async (req, res) => {
    const parsed = parseQuery(req.query, {
      sortableFields: PAYMENT_SORTABLE_FIELDS,
      filterableFields: PAYMENT_FILTERABLE_FIELDS,
    });
    const filters = extractFilterOptions(parsed);
    const result = await this.adminPaymentService.list(parsed, filters);
    sendPaginatedResponse(res, result.items, result.meta);
  });

  listForOrder = asyncHandler(async (req, res) => {
    const orderId = requireParam(req, "orderId");
    const payments = await this.adminPaymentService.listForOrder(orderId);
    sendSuccess(res, { payments });
  });

  getStatusSummary = asyncHandler(async (_req, res) => {
    const summary = await this.adminPaymentService.getStatusSummary();
    sendSuccess(res, { summary });
  });
}
