import { vi } from "vitest";

import type { Response } from "express";
import type { Mock } from "vitest";

/** A chainable fake Express `Response` — every method returns the same
 * mock object, mirroring Express's real chaining (`res.status(200).json(...)`),
 * so assertions can inspect any of `status`/`json`/`send`/`cookie`/
 * `clearCookie`/`setHeader`/`end` after exercising a middleware or
 * controller-level function. */
export interface MockResponse extends Partial<Response> {
  status: Mock;
  json: Mock;
  send: Mock;
  cookie: Mock;
  clearCookie: Mock;
  setHeader: Mock;
  end: Mock;
}

export function buildMockResponse(): MockResponse {
  const res = {} as MockResponse;
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  res.send = vi.fn().mockReturnValue(res);
  res.cookie = vi.fn().mockReturnValue(res);
  res.clearCookie = vi.fn().mockReturnValue(res);
  res.setHeader = vi.fn().mockReturnValue(res);
  res.end = vi.fn().mockReturnValue(res);
  return res;
}
