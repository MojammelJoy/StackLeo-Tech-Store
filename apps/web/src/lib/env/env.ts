/**
 * Typed, validated access to this app's `NEXT_PUBLIC_*` environment
 * variables. Next.js inlines `NEXT_PUBLIC_*` references at build time only
 * when referenced as a static `process.env.NEXT_PUBLIC_X` property access —
 * so each variable is read individually here rather than via a loop or
 * destructure, and this module must stay free of any non-`NEXT_PUBLIC_`
 * variable (anything else would be `undefined` in the browser bundle).
 */

interface PublicEnv {
  apiBaseUrl: string;
  siteName: string;
  siteTagline: string;
}

function readRequired(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(
      `Missing required environment variable "${name}". Copy apps/web/.env.example to ` +
        `apps/web/.env and set it.`,
    );
  }
  return value;
}

let cached: PublicEnv | undefined;

/** Validated once, then reused — every caller gets the same instance. */
export function getPublicEnv(): PublicEnv {
  if (!cached) {
    cached = {
      apiBaseUrl: readRequired("NEXT_PUBLIC_API_BASE_URL", process.env.NEXT_PUBLIC_API_BASE_URL),
      siteName: readRequired("NEXT_PUBLIC_SITE_NAME", process.env.NEXT_PUBLIC_SITE_NAME),
      siteTagline: readRequired("NEXT_PUBLIC_SITE_TAGLINE", process.env.NEXT_PUBLIC_SITE_TAGLINE),
    };
  }
  return cached;
}
