/** System-setting-specific filter criteria, layered on top of
 * `common/`'s generic `ParsedQuery` (pagination/sort/search). Shared
 * between `repository/` (the contract) and `service/` (the skeleton). */
export interface SystemSettingFilterOptions {
  keyPrefix?: string;
}
