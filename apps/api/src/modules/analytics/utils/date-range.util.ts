import type { DateRange } from "../interfaces";

const MS_PER_DAY = 1000 * 60 * 60 * 24;

export function buildDateRange(from: Date, to: Date): DateRange {
  return { from, to };
}

/** Whole days between `range.from` and `range.to` — pure date
 * arithmetic, no timezone/calendar-aware logic beyond that. */
export function getDaysBetween(range: DateRange): number {
  return Math.round((range.to.getTime() - range.from.getTime()) / MS_PER_DAY);
}
