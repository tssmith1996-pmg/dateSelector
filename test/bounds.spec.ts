import { mergeBounds } from "../src/utils/bounds";

describe("mergeBounds", () => {
  it("uses next bounds when provided", () => {
    const existing = { min: new Date("2024-01-01"), max: new Date("2024-12-31") };
    const next = { min: new Date("2024-02-01"), max: new Date("2024-08-31") };
    const result = mergeBounds(existing, next);
    expect(result.min).toEqual(new Date("2024-02-01"));
    expect(result.max).toEqual(new Date("2024-08-31"));
    expect(result.min).not.toBe(next.min);
    expect(result.max).not.toBe(next.max);
  });

  it("falls back to existing bounds when next is missing", () => {
    const existing = { min: new Date("2024-01-01"), max: new Date("2024-03-01") };
    const result = mergeBounds(existing, {});
    expect(result.min).toEqual(existing.min);
    expect(result.max).toEqual(existing.max);
    expect(result.min).not.toBe(existing.min);
    expect(result.max).not.toBe(existing.max);
  });

  it("handles undefined inputs", () => {
    expect(mergeBounds(undefined, undefined)).toEqual({});
  });
});
