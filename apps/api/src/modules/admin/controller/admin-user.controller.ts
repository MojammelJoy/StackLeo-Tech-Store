import { parseQuery, sendPaginatedResponse, sendSuccess } from "../../../common";
import { asyncHandler } from "../../../utils";
import { USER_FILTERABLE_FIELDS, USER_SORTABLE_FIELDS } from "../../user";

import { requireAuthenticatedUser, requireParam } from "./shared";

import type { UpdateUserRolesDto, UpdateUserStatusDto } from "../dto";
import type { AdminUserService } from "../service";

/** Express handlers for administrative user management. */
export class AdminUserController {
  constructor(private readonly adminUserService: AdminUserService) {}

  list = asyncHandler(async (req, res) => {
    const parsed = parseQuery(req.query, {
      sortableFields: USER_SORTABLE_FIELDS,
      filterableFields: USER_FILTERABLE_FIELDS,
    });
    const result = await this.adminUserService.list(parsed);
    sendPaginatedResponse(res, result.items, result.meta);
  });

  getById = asyncHandler(async (req, res) => {
    const id = requireParam(req, "id");
    const user = await this.adminUserService.getById(id);
    sendSuccess(res, { user });
  });

  setActive = asyncHandler(async (req, res) => {
    const actor = requireAuthenticatedUser(req);
    const id = requireParam(req, "id");
    const dto = req.body as UpdateUserStatusDto;
    const user = await this.adminUserService.setActive(id, dto, actor);
    sendSuccess(res, { user });
  });

  updateRoles = asyncHandler(async (req, res) => {
    const actor = requireAuthenticatedUser(req);
    const id = requireParam(req, "id");
    const dto = req.body as UpdateUserRolesDto;
    const user = await this.adminUserService.updateRoles(id, dto, actor);
    sendSuccess(res, { user });
  });
}
