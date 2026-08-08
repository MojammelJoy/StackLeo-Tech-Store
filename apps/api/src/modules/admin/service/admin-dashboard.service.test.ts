import { describe, expect, it, vi } from "vitest";

import { AdminDashboardService } from "./admin-dashboard.service";

import type { AdminDashboardRepository } from "../repository";
import type { DashboardOverview } from "../types";

const OVERVIEW: DashboardOverview = {
  users: { total: 10, active: 8 },
  products: { total: 20 },
  categories: { total: 5 },
  brands: { total: 3 },
  orders: { total: 15, pending: 4, completed: 9, cancelled: 2 },
  inventory: { lowStockCount: 2, outOfStockCount: 1 },
  reviews: { pendingModerationCount: 6 },
  notifications: { unreadCount: 12 },
  coupons: { total: 4, active: 2 },
  payments: { pendingCount: 1, failedCount: 0 },
};

describe("AdminDashboardService", () => {
  it("returns the repository's overview unchanged", async () => {
    const dashboardRepository: AdminDashboardRepository = {
      getOverview: vi.fn().mockResolvedValue(OVERVIEW),
    };
    const service = new AdminDashboardService(dashboardRepository);

    const result = await service.getOverview();
    expect(result).toEqual(OVERVIEW);
  });
});
