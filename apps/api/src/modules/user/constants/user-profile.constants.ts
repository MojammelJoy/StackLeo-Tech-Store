export const USER_DISPLAY_NAME_MAX_LENGTH = 100;
export const USER_BIO_MAX_LENGTH = 500;
export const USER_PHONE_NUMBER_MAX_LENGTH = 30;
export const USER_AVATAR_URL_MAX_LENGTH = 2048;

export const USER_THEME_VALUES = ["system", "light", "dark"] as const;

export const USER_LOCALE_MAX_LENGTH = 10;
export const USER_TIMEZONE_MAX_LENGTH = 64;

/** Deliberately the same order of magnitude as `modules/auth`'s
 * `PASSWORD_RESET_TOKEN_TTL_MS` — like a password reset, a confirmed
 * email change grants meaningful control over the account, so the
 * window to use it should stay short. */
export const EMAIL_CHANGE_TOKEN_TTL_MS = 60 * 60 * 1000;
