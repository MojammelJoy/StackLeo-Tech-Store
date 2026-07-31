import type { SystemSettingResponseDto } from "../dto";
import type { SystemSetting } from "../types";

/** Contract `mapper/admin.mapper.ts` implements. Kept separate from
 * `mapper/` itself (mirroring `repository/`'s interface-vs-implementation
 * split) so a future alternate mapper — or a test double — can satisfy
 * the same shape without depending on the concrete implementation. */
export interface AdminMapper {
  toSystemSettingResponseDto(setting: SystemSetting): SystemSettingResponseDto;
  toSystemSettingResponseList(settings: SystemSetting[]): SystemSettingResponseDto[];
}
