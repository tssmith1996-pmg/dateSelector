import { ensureWithinRange, formatRange, normalizeRange, startOfDay, toISODate } from "../src/date";

describe("date utilities", () => {
  it("normalizes inverted ranges", () => {
    const start = new Date(2023, 4, 5);
    const end = new Date(2023, 4, 1);
    const normalized = normalizeRange(start, end);
    expect(toISODate(normalized.from)).toBe("2023-05-01");
    expect(toISODate(normalized.to)).toBe("2023-05-05");
  });

  it("clamps ranges to min and max", () => {
    const min = new Date(2023, 0, 1);
    const max = new Date(2023, 0, 31);
    const range = ensureWithinRange(
      {
        from: startOfDay(new Date(2022, 11, 25)),
        to: new Date(2023, 1, 5),
      },
      min,
      max,
    );
    expect(toISODate(range.from)).toBe("2023-01-01");
    expect(toISODate(range.to)).toBe("2023-01-31");
  });

  it("formats ranges with localized output", () => {
    const from = new Date(Date.UTC(2022, 1, 17));
    const to = new Date(Date.UTC(2022, 1, 21));
    const label = formatRange(from, to, "en-US");
    expect(label).toBe("February 17, 2022 – February 21, 2022");
  });
});
