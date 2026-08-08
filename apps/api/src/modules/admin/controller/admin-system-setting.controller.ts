import { HTTP_STATUS, parseQuery, sendPaginatedResponse, sendSuccess } from "../../../common";
import { asyncHandler } from "../../../utils";
import { ADMIN_FILTERABLE_FIELDS, ADMIN_SORTABLE_FIELDS } from "../constants";

import { requireAuthenticatedUser, requireParam } from "./shared";

import type { ParsedQuery } from "../../../common";
import type { CreateSystemSettingDto, UpdateSystemSettingDto } from "../dto";
import type { SystemSettingFilterOptions } from "../interfaces";
import type { AdminService } from "../service";

/** Combines `common/`'s generic `parsed.filters` (`keyPrefix`) into one
 * typed `SystemSettingFilterOptions` — mirrors every other module's
 * `extractFilterOptions`. */
function extractFilterOptions(parsed: ParsedQuery): SystemSettingFilterOptions {
  const filters: SystemSettingFilterOptions = {};

  const keyPrefix = parsed.filters.keyPrefix;
  if (keyPrefix) {
    filters.keyPrefix = String(keyPrefix.value);
  }

  return filters;
}

/** Express handlers for administrative system-settings management. */
export class AdminSystemSettingController {
  constructor(private readonly adminService: AdminService) {}

  list = asyncHandler(async (req, res) => {
    const parsed = parseQuery(req.query, {
      sortableFields: ADMIN_SORTABLE_FIELDS,
      filterableFields: ADMIN_FILTERABLE_FIELDS,
    });
    const filters = extractFilterOptions(parsed);
    const result = await this.adminService.listSystemSettings(parsed, filters);
    sendPaginatedResponse(res, result.items, result.meta);
  });

  getByKey = asyncHandler(async (req, res) => {
    const key = requireParam(req, "key");
    const setting = await this.adminService.getSystemSetting(key);
    sendSuccess(res, { setting });
  });

  create = asyncHandler(async (req, res) => {
    const actor = requireAuthenticatedUser(req);
    const dto = req.body as CreateSystemSettingDto;
    const setting = await this.adminService.createSystemSetting(dto, actor);
    sendSuccess(res, { setting }, { statusCode: HTTP_STATUS.CREATED });
  });

  update = asyncHandler(async (req, res) => {
    const actor = requireAuthenticatedUser(req);
    const key = requireParam(req, "key");
    const dto = req.body as UpdateSystemSettingDto;
    const setting = await this.adminService.updateSystemSetting(key, dto, actor);
    sendSuccess(res, { setting });
  });

  delete = asyncHandler(async (req, res) => {
    const actor = requireAuthenticatedUser(req);
    const key = requireParam(req, "key");
    await this.adminService.deleteSystemSetting(key, actor);
    sendSuccess(res, { message: "System setting deleted" });
  });
}
