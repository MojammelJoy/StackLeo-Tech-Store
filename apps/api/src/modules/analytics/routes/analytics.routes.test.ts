import express from "express";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { errorHandler, requestId } from "../../../middlewares";
import {
  buildAuthHeader,
  createTestAuthenticatedUser,
  signTestAccessToken,
} from "../../../testing";

import { analyticsRouter } from "./analytics.routes";

import type { Server } from "node:http";

/**
 * Behavioral auth/RBAC coverage for the Analytics API surface. Every
 * other module in this app's test suite unit-tests only at the service
 * layer (see `modules/coupon/service/coupon.service.test.ts` and its
 * siblings) since `AnalyticsService` itself never checks permissions —
 * that's `authenticate`/`requirePermission(PERMISSIONS.ANALYTICS_READ)`
 * in `analytics.routes.ts`. Verifying that gate actually rejects
 * unauthenticated/under-permissioned requests needs a real (if
 * ephemeral, DB-free) HTTP server: both middlewares reject *before* the
 * request ever reaches `AnalyticsController`/`AnalyticsService`/Prisma,
 * so this never touches a database connection — safe and fast to run in
 * this DB-less unit-test environment.
 */
describe("analyticsRouter — auth and RBAC gating", () => {
  let server: Server;
  let baseUrl: string;

  beforeAll(async () => {
    const app = express();
    app.use(requestId);
    app.use("/analytics", analyticsRouter);
    app.use(errorHandler);

    await new Promise<void>((resolve) => {
      server = app.listen(0, resolve);
    });
    const address = server.address();
    const port = typeof address === "object" && address ? address.port : 0;
    baseUrl = `http://127.0.0.1:${port}`;
  });

  afterAll(async () => {
    await new Promise<void>((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve()));
    });
  });

  const protectedPaths = [
    "/analytics/dashboard",
    "/analytics/sales/summary",
    "/analytics/revenue/summary",
    "/analytics/orders/summary",
    "/analytics/products/top",
    "/analytics/products/catalog-snapshot",
    "/analytics/categories/top",
    "/analytics/customers/summary",
    "/analytics/inventory/summary",
    "/analytics/coupons/summary",
    "/analytics/reviews/summary",
    "/analytics/payments/summary",
    "/analytics/comparison?domain=sales",
  ];

  it.each(protectedPaths)("rejects an unauthenticated request to %s with 401", async (path) => {
    const response = await fetch(`${baseUrl}${path}`);
    expect(response.status).toBe(401);
  });

  it.each(protectedPaths)(
    "rejects an authenticated request without analytics:read to %s with 403",
    async (path) => {
      const token = signTestAccessToken(createTestAuthenticatedUser());
      const response = await fetch(`${baseUrl}${path}`, {
        headers: { Authorization: buildAuthHeader(token) },
      });
      expect(response.status).toBe(403);
    },
  );

  it("returns a JSON body identifying the failure as unauthorized, not a generic 500", async () => {
    const response = await fetch(`${baseUrl}/analytics/dashboard`);
    const body = (await response.json()) as { error?: { statusCode?: number } };
    expect(body.error?.statusCode).toBe(401);
  });
});
