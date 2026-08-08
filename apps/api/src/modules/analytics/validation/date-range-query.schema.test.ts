import { describe, expect, it } from "vitest";

import { comparisonQuerySchema } from "./comparison-query.schema";
import { dateRangeQuerySchema } from "./date-range-query.schema";

describe("dateRangeQuerySchema", () => {
  it("defaults to the last30days preset when no query params are given", () => {
    const result = dateRangeQuerySchema.parse({});
    expect(result.preset).toBe("last30days");
  });

  it("accepts a valid custom range", () => {
    const result = dateRangeQuerySchema.parse({
      preset: "custom",
      from: "2026-07-01T00:00:00.000Z",
      to: "2026-07-08T00:00:00.000Z",
    });
    expect(result.from).toBeInstanceOf(Date);
    expect(result.to).toBeInstanceOf(Date);
  });

  it("rejects a custom preset missing from/to", () => {
    expect(() => dateRangeQuerySchema.parse({ preset: "custom" })).toThrow();
  });

  it("rejects a custom range where to is before from", () => {
    expect(() =>
      dateRangeQuerySchema.parse({
        preset: "custom",
        from: "2026-07-08T00:00:00.000Z",
        to: "2026-07-01T00:00:00.000Z",
      }),
    ).toThrow();
  });

  it("rejects a custom range where to equals from", () => {
    expect(() =>
      dateRangeQuerySchema.parse({
        preset: "custom",
        from: "2026-07-01T00:00:00.000Z",
        to: "2026-07-01T00:00:00.000Z",
      }),
    ).toThrow();
  });

  it("rejects a custom range spanning more than the max allowed days", () => {
    expect(() =>
      dateRangeQuerySchema.parse({
        preset: "custom",
        from: "2000-01-01T00:00:00.000Z",
        to: "2026-01-01T00:00:00.000Z",
      }),
    ).toThrow();
  });

  it("rejects an unsupported preset value", () => {
    expect(() => dateRangeQuerySchema.parse({ preset: "lastWeekend" })).toThrow();
  });

  it("preserves unrelated query keys via passthrough (page/limit/sort)", () => {
    const result = dateRangeQuerySchema.parse({ page: "2", limit: "10", sort: "revenue:desc" });
    expect(result).toMatchObject({ page: "2", limit: "10", sort: "revenue:desc" });
  });
});

describe("comparisonQuerySchema", () => {
  it("requires a domain", () => {
    expect(() => comparisonQuerySchema.parse({})).toThrow();
  });

  it("rejects a domain outside the eligible comparison domains", () => {
    expect(() => comparisonQuerySchema.parse({ domain: "product" })).toThrow();
  });

  it("accepts a valid domain with a preset", () => {
    const result = comparisonQuerySchema.parse({ domain: "sales", preset: "last7days" });
    expect(result.domain).toBe("sales");
    expect(result.preset).toBe("last7days");
  });

  it("rejects a custom range for a valid domain when to is before from", () => {
    expect(() =>
      comparisonQuerySchema.parse({
        domain: "revenue",
        preset: "custom",
        from: "2026-07-08T00:00:00.000Z",
        to: "2026-07-01T00:00:00.000Z",
      }),
    ).toThrow();
  });
});
