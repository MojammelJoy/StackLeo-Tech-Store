/**
 * A minimal cookie-jar-aware HTTP client for integration tests. Built
 * instead of pulling in `supertest` (not a dependency of this app,
 * and the task instructions forbid adding unnecessary dependencies) —
 * `fetch` is already a global in this Node runtime (>=22, see
 * `package.json`'s `engines`), the same approach
 * `modules/analytics/routes/analytics.routes.test.ts` already
 * established for one route file; this generalizes it into a reusable
 * client every integration suite needs, since `modules/auth` returns
 * both the access and refresh token as httpOnly cookies, never in the
 * JSON body (see `auth/utils/cookie.utils.ts`) — a plain `fetch` call
 * would otherwise silently drop them.
 */
export interface ApiResponse<T = unknown> {
  status: number;
  body: T;
  headers: Headers;
}

export class TestHttpClient {
  private cookies = new Map<string, string>();

  constructor(private readonly baseUrl: string) {}

  private cookieHeader(): string | undefined {
    if (this.cookies.size === 0) {
      return undefined;
    }
    return [...this.cookies.entries()].map(([name, value]) => `${name}=${value}`).join("; ");
  }

  private captureCookies(headers: Headers): void {
    const setCookies = typeof headers.getSetCookie === "function" ? headers.getSetCookie() : [];
    for (const raw of setCookies) {
      const pair = raw.split(";")[0] ?? "";
      const separatorIndex = pair.indexOf("=");
      if (separatorIndex === -1) continue;
      const name = pair.slice(0, separatorIndex).trim();
      const value = pair.slice(separatorIndex + 1).trim();
      this.cookies.set(name, value);
    }
  }

  /** Directly sets a cookie (e.g. to simulate a stale/forged token)
   * without going through a real login response. */
  setCookie(name: string, value: string): void {
    this.cookies.set(name, value);
  }

  clearCookies(): void {
    this.cookies.clear();
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
    extraHeaders?: Record<string, string>,
  ): Promise<ApiResponse<T>> {
    const headers: Record<string, string> = { ...extraHeaders };
    if (body !== undefined) {
      headers["Content-Type"] = "application/json";
    }
    const cookieHeader = this.cookieHeader();
    if (cookieHeader) {
      headers.Cookie = cookieHeader;
    }

    const response = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    this.captureCookies(response.headers);

    const text = await response.text();
    const parsedBody = text.length > 0 ? (JSON.parse(text) as T) : (undefined as T);

    return { status: response.status, body: parsedBody, headers: response.headers };
  }

  get<T = unknown>(path: string, extraHeaders?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>("GET", path, undefined, extraHeaders);
  }

  post<T = unknown>(
    path: string,
    body?: unknown,
    extraHeaders?: Record<string, string>,
  ): Promise<ApiResponse<T>> {
    return this.request<T>("POST", path, body, extraHeaders);
  }

  patch<T = unknown>(
    path: string,
    body?: unknown,
    extraHeaders?: Record<string, string>,
  ): Promise<ApiResponse<T>> {
    return this.request<T>("PATCH", path, body, extraHeaders);
  }

  delete<T = unknown>(
    path: string,
    extraHeaders?: Record<string, string>,
  ): Promise<ApiResponse<T>> {
    return this.request<T>("DELETE", path, undefined, extraHeaders);
  }
}
