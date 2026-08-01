import type { UserPreferences } from "../types";

export interface UserPreferencesResponseDto {
  locale: string;
  timezone: string;
  currency: string;
  theme: string;
  marketingEmailsOptIn: boolean;
  orderUpdatesOptIn: boolean;
  updatedAt: Date;
}

export function toUserPreferencesResponseDto(
  preferences: UserPreferences,
): UserPreferencesResponseDto {
  return {
    locale: preferences.locale,
    timezone: preferences.timezone,
    currency: preferences.currency,
    theme: preferences.theme,
    marketingEmailsOptIn: preferences.marketingEmailsOptIn,
    orderUpdatesOptIn: preferences.orderUpdatesOptIn,
    updatedAt: preferences.updatedAt,
  };
}
