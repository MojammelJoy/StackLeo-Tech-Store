export type JwtTokenType = "access" | "refresh";

/**
 * Claims supplied by the caller when signing an access token. `roles` is
 * always an array — empty when the subject has none — never optional, so
 * downstream code never has to guard against it being missing. No
 * concrete role values exist yet; this is the mechanism, not a role
 * system.
 */
export interface AccessTokenClaims {
  sub: string;
  roles: string[];
}

export interface RefreshTokenClaims {
  sub: string;
}

export interface AccessTokenPayload extends AccessTokenClaims {
  type: "access";
  iat: number;
  exp: number;
}

export interface RefreshTokenPayload extends RefreshTokenClaims {
  type: "refresh";
  iat: number;
  exp: number;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}
