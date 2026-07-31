import { MANAGEMENT_MODULES } from "../constants";

import type { ManagementModuleDescriptor } from "../interfaces";

/**
 * The human-readable catalog of every management area this app
 * supports — static, declarative reference data (not a database query),
 * so it's fully populated here rather than left as a skeleton. What a
 * future admin-panel navigation menu would render one entry per.
 */
export function getManagementModuleCatalog(): ManagementModuleDescriptor[] {
  return [
    {
      key: MANAGEMENT_MODULES.DASHBOARD,
      label: "Dashboard",
      description: "Store-wide activity at a glance.",
    },
    {
      key: MANAGEMENT_MODULES.USER,
      label: "Users",
      description: "Manage registered customers and staff accounts.",
    },
    {
      key: MANAGEMENT_MODULES.PRODUCT,
      label: "Products",
      description: "Manage the product catalog.",
    },
    {
      key: MANAGEMENT_MODULES.CATEGORY,
      label: "Categories",
      description: "Manage product categories.",
    },
    { key: MANAGEMENT_MODULES.BRAND, label: "Brands", description: "Manage product brands." },
    {
      key: MANAGEMENT_MODULES.INVENTORY,
      label: "Inventory",
      description: "Manage stock levels and warehouses.",
    },
    { key: MANAGEMENT_MODULES.ORDER, label: "Orders", description: "Manage customer orders." },
    {
      key: MANAGEMENT_MODULES.PAYMENT,
      label: "Payments",
      description: "Manage payments and refunds.",
    },
    { key: MANAGEMENT_MODULES.COUPON, label: "Coupons", description: "Manage discount coupons." },
    { key: MANAGEMENT_MODULES.REVIEW, label: "Reviews", description: "Moderate customer reviews." },
    {
      key: MANAGEMENT_MODULES.NOTIFICATION,
      label: "Notifications",
      description: "Manage outbound notifications.",
    },
    {
      key: MANAGEMENT_MODULES.ROLE_PERMISSION,
      label: "Roles & Permissions",
      description: "Manage staff roles and their permissions.",
    },
    {
      key: MANAGEMENT_MODULES.SYSTEM_SETTINGS,
      label: "System Settings",
      description: "Manage store-wide configuration.",
    },
    {
      key: MANAGEMENT_MODULES.REPORTS,
      label: "Reports",
      description: "View and export operational reports.",
    },
    {
      key: MANAGEMENT_MODULES.AUDIT_LOG,
      label: "Audit Logs",
      description: "Review a history of admin actions (future).",
    },
  ];
}
