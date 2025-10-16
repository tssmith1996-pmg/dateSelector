jest.mock("primereact/api", () => ({ addLocale: jest.fn() }));

import { buildCalendarLocaleOptions, normalizeLocaleTag } from "../src/utils/calendarLocale";

describe("calendar locale utilities", () => {
  it("normalizes locales and always provides firstDayOfWeek", () => {
    const locales = ["en-us", "en", "en-AU", "fr-FR", "es-419", "ar-SA", "ja-JP", "invalid-locale"];
    for (const raw of locales) {
      const normalized = normalizeLocaleTag(raw);
      const options = buildCalendarLocaleOptions(normalized, undefined, 3);
      expect(typeof options.firstDayOfWeek).toBe("number");
      expect(options.firstDayOfWeek).toBeGreaterThanOrEqual(0);
      expect(options.firstDayOfWeek).toBeLessThan(7);
    }
  });

  it("respects explicit week start overrides", () => {
    const normalized = normalizeLocaleTag("de-DE");
    const options = buildCalendarLocaleOptions(normalized, 4, undefined);
    expect(options.firstDayOfWeek).toBe(4);
  });

  it("falls back to the default locale when Intl cannot resolve a tag", () => {
    const normalized = normalizeLocaleTag("no_such_locale");
    expect(normalized).toBe("en");
  });
});
