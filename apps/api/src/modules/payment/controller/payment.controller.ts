import { HTTP_STATUS, parseQuery, sendPaginatedResponse, sendSuccess } from "../../../common";
import { BadRequestError, UnauthorizedError } from "../../../errors";
import { asyncHandler } from "../../../utils";
import { PAYMENT_FILTERABLE_FIELDS, PAYMENT_SORTABLE_FIELDS } from "../constants";

import type { AuthenticatedUser } from "../../../auth";
import type { FilterParams } from "../../../common";
import type { PaymentMethod, PaymentProviderName, PaymentStatus } from "../constants";
import type { CancelPaymentDto, CreatePaymentDto, RetryPaymentDto, VerifyPaymentDto } from "../dto";
import type { PaymentFilterOptions } from "../interfaces";
import type { PaymentService } from "../service";
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
 * `PaymentFilterOptions` the service can hand straight to the
 * repository — every field here corresponds 1:1 to
 * `PAYMENT_FILTERABLE_FIELDS`. */
function extractFilterOptions(filters: FilterParams): PaymentFilterOptions {
  const options: PaymentFilterOptions = {};

  const status = filters.status;
  if (status) {
    options.status = String(status.value) as PaymentStatus;
  }
  const method = filters.method;
  if (method) {
    options.method = String(method.value) as PaymentMethod;
  }
  const provider = filters.provider;
  if (provider) {
    options.provider = String(provider.value) as PaymentProviderName;
  }

  return options;
}

/**
 * Express handlers for every Payment API endpoint. Each method is an
 * `asyncHandler`-wrapped arrow function (bound automatically, so
 * `routes/payment.routes.ts` can reference `paymentController.x`
 * directly) and does only three things: read the request, call one
 * `PaymentService` method, and send the response — no business logic
 * lives here, mirroring every other module's controller.
 *
 * Every endpoint requires `authenticate` at the route layer — this
 * module has no public/guest path at all, so every handler here calls
 * `requireAuthenticatedUser` unconditionally.
 */
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  create = asyncHandler(async (req, res) => {
    const actor = requireAuthenticatedUser(req);
    const dto = req.body as CreatePaymentDto;
    const payment = await this.paymentService.create(dto, actor);
    sendSuccess(res, { payment }, { statusCode: HTTP_STATUS.CREATED });
  });

  list = asyncHandler(async (req, res) => {
    const actor = requireAuthenticatedUser(req);
    const parsed = parseQuery(req.query, {
      sortableFields: PAYMENT_SORTABLE_FIELDS,
      filterableFields: PAYMENT_FILTERABLE_FIELDS,
    });
    const filters = extractFilterOptions(parsed.filters);
    const result = await this.paymentService.listForUser(actor, parsed, filters);
    sendPaginatedResponse(res, result.items, result.meta);
  });

  listForOrder = asyncHandler(async (req, res) => {
    const actor = requireAuthenticatedUser(req);
    const orderId = requireParam(req, "orderId");
    const payments = await this.paymentService.listForOrder(orderId, actor);
    sendSuccess(res, { payments });
  });

  getById = asyncHandler(async (req, res) => {
    const actor = requireAuthenticatedUser(req);
    const id = requireParam(req, "id");
    const payment = await this.paymentService.getById(id, actor);
    sendSuccess(res, { payment });
  });

  getByTransactionId = asyncHandler(async (req, res) => {
    const actor = requireAuthenticatedUser(req);
    const transactionId = requireParam(req, "transactionId");
    const payment = await this.paymentService.getByTransactionId(transactionId, actor);
    sendSuccess(res, { payment });
  });

  getTransactions = asyncHandler(async (req, res) => {
    const actor = requireAuthenticatedUser(req);
    const id = requireParam(req, "id");
    const transactions = await this.paymentService.getTransactions(id, actor);
    sendSuccess(res, { transactions });
  });

  verify = asyncHandler(async (req, res) => {
    const actor = requireAuthenticatedUser(req);
    const id = requireParam(req, "id");
    const dto = req.body as VerifyPaymentDto;
    const payment = await this.paymentService.verify(id, dto, actor);
    sendSuccess(res, { payment });
  });

  retry = asyncHandler(async (req, res) => {
    const actor = requireAuthenticatedUser(req);
    const id = requireParam(req, "id");
    const dto = req.body as RetryPaymentDto;
    const payment = await this.paymentService.retry(id, dto, actor);
    sendSuccess(res, { payment }, { statusCode: HTTP_STATUS.CREATED });
  });

  cancel = asyncHandler(async (req, res) => {
    const actor = requireAuthenticatedUser(req);
    const id = requireParam(req, "id");
    const dto = req.body as CancelPaymentDto;
    const payment = await this.paymentService.cancel(id, dto, actor);
    sendSuccess(res, { payment });
  });

  markCollected = asyncHandler(async (req, res) => {
    const actor = requireAuthenticatedUser(req);
    const id = requireParam(req, "id");
    const payment = await this.paymentService.markCashOnDeliveryCollected(id, actor);
    sendSuccess(res, { payment });
  });
}
