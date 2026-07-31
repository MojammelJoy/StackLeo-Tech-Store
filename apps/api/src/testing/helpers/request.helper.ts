import type { AuthenticatedUser } from "../../auth";
import type { Request } from "express";

export interface MockRequestOptions {
  body?: unknown;
  params?: Record<string, string>;
  query?: Record<string, unknown>;
  headers?: Record<string, string>;
  cookies?: Record<string, string>;
  user?: AuthenticatedUser;
}

/**
 * A fake Express `Request` for unit-testing middleware or a
 * controller-level function directly, without an HTTP server. Header
 * lookups are case-insensitive via `get`, matching Express's own
 * behavior; everything else is a plain object a test can assert
 * against directly.
 */
export function buildMockRequest(options: MockRequestOptions = {}): Request {
  const headers = options.headers ?? {};
  return {
    body: options.body ?? {},
    params: options.params ?? {},
    query: options.query ?? {},
    headers,
    cookies: options.cookies ?? {},
    user: options.user,
    get: (name: string) => headers[name.toLowerCase()],
  } as unknown as Request;
}
