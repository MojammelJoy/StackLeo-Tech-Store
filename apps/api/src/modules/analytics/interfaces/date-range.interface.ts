/** A shared shape reused by every query/report/dashboard concept in
 * this foundation — `utils/date-range.util.ts`, `utils/query-range.util.ts`,
 * `metrics/`, `reports/`, and `dashboards/` all build on this one
 * definition rather than each redeclaring `{ from: Date; to: Date }`. */
export interface DateRange {
  from: Date;
  to: Date;
}
