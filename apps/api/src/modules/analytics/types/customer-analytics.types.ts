/** `totalCustomers` is a current snapshot (`User.count()`), not scoped
 * to the requested range — "how many customer accounts exist right
 * now". `newCustomers` is `User.count()` scoped to `createdAt` within
 * the range. `activeCustomers` is the count of distinct `Order.userId`
 * within the range — a customer who placed at least one order in the
 * period, the only "activity" this schema can attribute to a customer
 * without inventing a definition. */
export interface CustomerAnalyticsSummary {
  totalCustomers: number;
  newCustomers: number;
  activeCustomers: number;
}

/** One customer's order activity over a date range. `email` is read
 * directly (never `passwordHash` or any other credential field). */
export interface CustomerPerformance {
  userId: string;
  email: string;
  orderCount: number;
  totalSpent: number;
  averageOrderValue: number;
}
