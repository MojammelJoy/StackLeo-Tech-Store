/** The public-facing shape of a SystemSetting. */
export interface SystemSettingResponseDto {
  key: string;
  value: string;
  description: string | null;
  updatedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}
