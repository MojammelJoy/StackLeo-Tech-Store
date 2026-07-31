import type { MetricSeries } from "./metric-series.interface";

/** The public-facing shape of a `MetricSeries` — reused verbatim, the
 * same way `modules/order`'s `OrderSummaryDto` reuses `OrderSummary`:
 * nothing internal to hide here. */
export type MetricSeriesResponseDto = MetricSeries;
