/**
 * The admin dashboard's operational summary — lightweight counts only,
 * each backed by a single indexed `COUNT`/`groupBy` query (see
 * `repository/admin-dashboard.repository.prisma.ts`). Deliberately no
 * historical trends, revenue figures, or time-series data — that's
 * Analytics API territory, explicitly out of scope for this module.
 */
export interface DashboardOverview {
  users: {
    total: number;
    active: number;
  };
  products: {
    total: number;
  };
  categories: {
    total: number;
  };
  brands: {
    total: number;
  };
  orders: {
    total: number;
    pending: number;
    completed: number;
    cancelled: number;
  };
  inventory: {
    lowStockCount: number;
    outOfStockCount: number;
  };
  reviews: {
    pendingModerationCount: number;
  };
  notifications: {
    unreadCount: number;
  };
  coupons: {
    total: number;
    active: number;
  };
  payments: {
    pendingCount: number;
    failedCount: number;
  };
}
