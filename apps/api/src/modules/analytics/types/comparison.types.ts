import type { DateRange } from "../interfaces";

/** One metric's current-vs-previous-period comparison — "never divide
 * by zero": `percentageChange` is `0` whenever `previous` is `0` (see
 * `utils/growth-rate.util.ts`'s `calculateGrowthRate`), not
 * `Infinity`/`NaN`. */
export interface ComparisonMetric {
  key: string;
  label: string;
  current: number;
  previous: number;
  difference: number;
  percentageChange: number;
}

export interface ComparisonResult {
  currentRange: DateRange;
  previousRange: DateRange;
  metrics: ComparisonMetric[];
}
