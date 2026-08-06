import { HTTP_STATUS, parseQuery, sendPaginatedResponse, sendSuccess } from "../../../common";
import { BadRequestError, UnauthorizedError } from "../../../errors";
import { asyncHandler } from "../../../utils";
import { ADDRESS_FILTERABLE_FIELDS, ADDRESS_SORTABLE_FIELDS } from "../constants";

import type { AuthenticatedUser } from "../../../auth";
import type { FilterParams } from "../../../common";
import type { AddressLabel, AddressType } from "../constants";
import type { CreateAddressDto, UpdateAddressDto } from "../dto";
import type { AddressFilterOptions } from "../interfaces";
import type { AddressService } from "../service";
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

function toBoolean(value: unknown): boolean | undefined {
  if (value === "true") return true;
  if (value === "false") return false;
  return undefined;
}

/** Combines `common/`'s generic `parsed.filters` into a typed
 * `AddressFilterOptions` the service can hand straight to the
 * repository — every field here corresponds 1:1 to
 * `ADDRESS_FILTERABLE_FIELDS`. */
function extractFilterOptions(filters: FilterParams): AddressFilterOptions {
  const options: AddressFilterOptions = {};

  const type = filters.type;
  if (type) {
    options.type = String(type.value) as AddressType;
  }
  const label = filters.label;
  if (label) {
    options.label = String(label.value) as AddressLabel;
  }
  const country = filters.country;
  if (country) {
    options.country = String(country.value);
  }
  const isDefaultShipping = toBoolean(filters.isDefaultShipping?.value);
  if (isDefaultShipping !== undefined) {
    options.isDefaultShipping = isDefaultShipping;
  }
  const isDefaultBilling = toBoolean(filters.isDefaultBilling?.value);
  if (isDefaultBilling !== undefined) {
    options.isDefaultBilling = isDefaultBilling;
  }

  return options;
}

/**
 * Express handlers for every Address API endpoint. Each method is an
 * `asyncHandler`-wrapped arrow function (bound automatically, so
 * `routes/address.routes.ts` can reference `addressController.x`
 * directly) and does only three things: read the request, call one
 * `AddressService` method, and send the response — no business logic
 * lives here, mirroring every other module's controller.
 *
 * Every endpoint requires `authenticate` at the route layer — this
 * module has no public/anonymous path at all (an address book only
 * makes sense once there's an account), so every handler here calls
 * `requireAuthenticatedUser` unconditionally.
 */
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  list = asyncHandler(async (req, res) => {
    const actor = requireAuthenticatedUser(req);
    const parsed = parseQuery(req.query, {
      sortableFields: ADDRESS_SORTABLE_FIELDS,
      filterableFields: ADDRESS_FILTERABLE_FIELDS,
    });
    const filters = extractFilterOptions(parsed.filters);
    const result = await this.addressService.listForUser(actor, parsed, filters);
    sendPaginatedResponse(res, result.items, result.meta);
  });

  getById = asyncHandler(async (req, res) => {
    const actor = requireAuthenticatedUser(req);
    const id = requireParam(req, "id");
    const address = await this.addressService.getById(id, actor);
    sendSuccess(res, { address });
  });

  create = asyncHandler(async (req, res) => {
    const actor = requireAuthenticatedUser(req);
    const dto = req.body as CreateAddressDto;
    const address = await this.addressService.create(dto, actor);
    sendSuccess(res, { address }, { statusCode: HTTP_STATUS.CREATED });
  });

  update = asyncHandler(async (req, res) => {
    const actor = requireAuthenticatedUser(req);
    const id = requireParam(req, "id");
    const dto = req.body as UpdateAddressDto;
    const address = await this.addressService.update(id, dto, actor);
    sendSuccess(res, { address });
  });

  delete = asyncHandler(async (req, res) => {
    const actor = requireAuthenticatedUser(req);
    const id = requireParam(req, "id");
    await this.addressService.delete(id, actor);
    sendSuccess(res, { message: "Address deleted" });
  });

  restore = asyncHandler(async (req, res) => {
    const actor = requireAuthenticatedUser(req);
    const id = requireParam(req, "id");
    const address = await this.addressService.restore(id, actor);
    sendSuccess(res, { address });
  });

  setDefaultShipping = asyncHandler(async (req, res) => {
    const actor = requireAuthenticatedUser(req);
    const id = requireParam(req, "id");
    const address = await this.addressService.setDefaultShipping(id, actor);
    sendSuccess(res, { address });
  });

  setDefaultBilling = asyncHandler(async (req, res) => {
    const actor = requireAuthenticatedUser(req);
    const id = requireParam(req, "id");
    const address = await this.addressService.setDefaultBilling(id, actor);
    sendSuccess(res, { address });
  });
}
