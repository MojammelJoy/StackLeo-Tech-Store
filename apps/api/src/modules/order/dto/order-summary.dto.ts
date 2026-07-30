import type { OrderSummary } from "../types";

/**
 * The public-facing shape of an `OrderSummary` — structurally identical
 * today, kept as its own named DTO (rather than reusing the domain type
 * directly) since "Order Summary DTO" is its own explicit deliverable
 * for this foundation, independent of whatever `OrderResponseDto`
 * composes it into.
 */
export type OrderSummaryDto = OrderSummary;
