import { DATE_RANGE_PRESETS } from "../constants";

import type { DateRangePreset } from "../constants";
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

/** The period immediately preceding `range`, with the same duration —
 * `[from - duration, from)`, so it never overlaps `range` itself. Every
 * comparison-analytics endpoint ("this period vs previous period")
 * derives its previous range this way. */
export function getPreviousPeriodRange(range: DateRange): DateRange {
  const durationMs = range.to.getTime() - range.from.getTime();
  return {
    from: new Date(range.from.getTime() - durationMs),
    to: new Date(range.from.getTime()),
  };
}

function startOfUtcDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

/**
 * Resolves one of the non-`custom` date-range presets to a concrete
 * `DateRange`, anchored at `now` (always passed in, never read
 * internally — callers, and tests, control "the current moment").
 * Every boundary is UTC-based: every date column this module reports on
 * is a Postgres `timestamptz`, and nothing else in this app defines a
 * broader business timezone (`UserPreferences.timezone` is a cosmetic,
 * per-user display preference, never consulted by reporting logic) — so
 * UTC is the one timezone every layer already agrees on. `to` is always
 * exclusive, matching every repository query's `lt: range.to`.
 *
 * `last7days`/`last30days` are rolling windows ending "now" (today's
 * partial UTC day is included), not 7/30 fully-completed prior days —
 * the more common dashboard convention.
 */
export function resolveDateRangePreset(
  preset: Exclude<DateRangePreset, "custom">,
  now: Date,
): DateRange {
  const todayStart = startOfUtcDay(now);
  switch (preset) {
    case DATE_RANGE_PRESETS.TODAY:
      return { from: todayStart, to: new Date(todayStart.getTime() + MS_PER_DAY) };
    case DATE_RANGE_PRESETS.YESTERDAY:
      return { from: new Date(todayStart.getTime() - MS_PER_DAY), to: todayStart };
    case DATE_RANGE_PRESETS.LAST_7_DAYS:
      return {
        from: new Date(todayStart.getTime() - 6 * MS_PER_DAY),
        to: new Date(todayStart.getTime() + MS_PER_DAY),
      };
    case DATE_RANGE_PRESETS.LAST_30_DAYS:
      return {
        from: new Date(todayStart.getTime() - 29 * MS_PER_DAY),
        to: new Date(todayStart.getTime() + MS_PER_DAY),
      };
    case DATE_RANGE_PRESETS.CURRENT_MONTH:
      return {
        from: new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)),
        to: new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1)),
      };
    case DATE_RANGE_PRESETS.PREVIOUS_MONTH:
      return {
        from: new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1)),
        to: new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)),
      };
    case DATE_RANGE_PRESETS.CURRENT_YEAR:
      return {
        from: new Date(Date.UTC(now.getUTCFullYear(), 0, 1)),
        to: new Date(Date.UTC(now.getUTCFullYear() + 1, 0, 1)),
      };
    default:
      return { from: todayStart, to: new Date(todayStart.getTime() + MS_PER_DAY) };
  }
}
