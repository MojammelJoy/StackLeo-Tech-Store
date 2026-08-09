import { getPublicEnv } from "../env/env";

export type ApiRequestMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface ApiRequestOptions<TBody = unknown> {
  method?: ApiRequestMethod;
  body?: TBody;
  headers?: HeadersInit;
  signal?: AbortSignal;
  cache?: RequestCache;
}

/**
 * Thrown for any non-2xx response. Carries the parsed response body
 * (`payload`) so callers can read backend-specific error details without
 * this client knowing the shape of any particular endpoint's error format.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly payload: unknown;

  constructor(message: string, status: number, payload: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

async function parseResponseBody(response: Response): Promise<unknown> {
  if (response.status === 204) {
    return undefined;
  }

  const text = await response.text();
  if (text.length === 0) {
    return undefined;
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return text;
  }

  return JSON.parse(text) as unknown;
}

/**
 * Reads `payload.error.message` — the shape every apps/api error response
 * actually uses (see `common/types/api-response.types.ts`'s
 * `ApiErrorResponse`). Previously checked for a top-level `payload.message`,
 * which no backend response has ever sent, so this always fell through to
 * the generic fallback instead of the real, user-facing backend message.
 */
function extractErrorMessage(payload: unknown, fallback: string): string {
  if (payload && typeof payload === "object" && "error" in payload) {
    const { error } = payload as { error: unknown };
    if (error && typeof error === "object" && "message" in error) {
      const { message } = error as { message: unknown };
      if (typeof message === "string" && message.length > 0) {
        return message;
      }
    }
  }
  return fallback;
}

/**
 * The actual network call — no 401/refresh handling. `apiRequest` (below)
 * wraps this with silent-refresh-and-retry; the refresh attempt itself
 * also calls this directly (never `apiRequest`), which is what makes
 * recursion structurally impossible rather than merely guarded against.
 */
async function performRequest<TResponse, TBody>(
  path: string,
  options: ApiRequestOptions<TBody>,
): Promise<TResponse> {
  const { apiBaseUrl } = getPublicEnv();
  const { method = "GET", body, headers, signal, cache } = options;
  const hasBody = body !== undefined;

  const response = await fetch(`${apiBaseUrl}${path}`, {
    method,
    credentials: "include",
    cache,
    signal,
    headers: {
      Accept: "application/json",
      ...(hasBody ? { "Content-Type": "application/json" } : {}),
      ...headers,
    },
    body: hasBody ? JSON.stringify(body) : undefined,
  });

  const payload = await parseResponseBody(response);

  if (!response.ok) {
    throw new ApiError(
      extractErrorMessage(payload, `Request to "${path}" failed with status ${response.status}`),
      response.status,
      payload,
    );
  }

  return payload as TResponse;
}

const AUTH_REFRESH_PATH = "/api/v1/auth/refresh";

/**
 * Paths that must never trigger a silent refresh attempt on 401. Refresh
 * itself is excluded structurally (see `performRequest`'s doc comment),
 * not just here — this list additionally covers the three endpoints where
 * a 401 means something silent refresh can't fix (wrong credentials, or
 * "you're already logged out"), so retrying after a spurious refresh
 * would be nonsensical rather than merely redundant.
 */
const REFRESH_EXCLUDED_PATHS = [
  "/api/v1/auth/login",
  "/api/v1/auth/register",
  "/api/v1/auth/logout",
  AUTH_REFRESH_PATH,
];

function isExcludedFromRefresh(path: string): boolean {
  return REFRESH_EXCLUDED_PATHS.some((excluded) => path.startsWith(excluded));
}

/**
 * At most one refresh request in flight at a time, shared by every
 * caller that observes a 401 while it's pending — this is what makes
 * concurrent 401s coalesce into a single `POST /refresh` instead of one
 * per failed request. Reset to `null` once settled so a later,
 * independent 401 can trigger a fresh attempt.
 */
let inFlightRefresh: Promise<boolean> | null = null;

function attemptSilentRefresh(): Promise<boolean> {
  if (!inFlightRefresh) {
    inFlightRefresh = performRequest<unknown, undefined>(AUTH_REFRESH_PATH, { method: "POST" })
      .then(() => true)
      .catch(() => false)
      .finally(() => {
        inFlightRefresh = null;
      });
  }
  return inFlightRefresh;
}

/**
 * Generic, typed HTTP client for the StackLeo API. Every request is sent
 * with `credentials: "include"` so the backend's httpOnly session cookie
 * is attached automatically — this module never reads or stores the
 * cookie itself. Deliberately has no knowledge of specific endpoints
 * (products, auth, cart, ...); those live in each feature's own module,
 * built on top of `apiRequest`.
 *
 * A 401 on any request other than the auth endpoints above triggers
 * exactly one silent `POST /refresh` + retry: if the (possibly shared)
 * refresh succeeds, the original request is retried once via
 * `performRequest` directly — never through `apiRequest` again — so a
 * second failure simply propagates instead of looping. If refresh fails,
 * the original 401 is re-thrown unchanged, so existing callers (e.g.
 * `getCurrentUser`'s `error.status === 401` check) see the same error
 * they always have.
 *
 * @param path Endpoint path starting with "/", e.g. "/api/v1/products".
 *   Joined directly onto `NEXT_PUBLIC_API_BASE_URL`.
 */
export async function apiRequest<TResponse = unknown, TBody = unknown>(
  path: string,
  options: ApiRequestOptions<TBody> = {},
): Promise<TResponse> {
  try {
    return await performRequest<TResponse, TBody>(path, options);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401 && !isExcludedFromRefresh(path)) {
      const refreshed = await attemptSilentRefresh();
      if (refreshed) {
        return performRequest<TResponse, TBody>(path, options);
      }
    }
    throw error;
  }
}
