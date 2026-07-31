import type { SystemSettingResponseDto } from "../dto";
import type { AdminMapper } from "../interfaces";
import type { SystemSetting } from "../types";

function toSystemSettingResponseDto(setting: SystemSetting): SystemSettingResponseDto {
  return {
    key: setting.key,
    value: setting.value,
    description: setting.description,
    updatedBy: setting.updatedBy,
    createdAt: setting.createdAt,
    updatedAt: setting.updatedAt,
  };
}

function toSystemSettingResponseList(settings: SystemSetting[]): SystemSettingResponseDto[] {
  return settings.map(toSystemSettingResponseDto);
}

/** The only place a `SystemSetting` is converted to its public
 * response-DTO shape — callers map through this instead of building the
 * DTO by hand. */
export const adminMapper: AdminMapper = {
  toSystemSettingResponseDto,
  toSystemSettingResponseList,
};
