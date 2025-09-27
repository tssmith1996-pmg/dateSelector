import { parseDateMath } from "../src/dateMath";
import { PresetContext } from "../src/types";

describe("parseDateMath", () => {
  const context: PresetContext = {
    today: new Date("2024-03-15"),
    firstDayOfWeek: 1,
  };

  it("resolves TODAY", () => {
    const result = parseDateMath("TODAY", context);
    expect(result.range?.start.toISOString().substring(0, 10)).toEqual("2024-03-15");
  });

  it("resolves LAST 7 DAYS", () => {
    const result = parseDateMath("LAST 7 DAYS", context);
    expect(result.range?.start.toISOString().substring(0, 10)).toEqual("2024-03-09");
    expect(result.range?.end.toISOString().substring(0, 10)).toEqual("2024-03-15");
  });

  it("supports explicit range", () => {
    const result = parseDateMath("TODAY-1 DAYS..TODAY+1 DAYS", context);
    expect(result.range?.start.toISOString().substring(0, 10)).toEqual("2024-03-14");
    expect(result.range?.end.toISOString().substring(0, 10)).toEqual("2024-03-16");
  });

  it("clamps to scope", () => {
    const scopedContext: PresetContext = { ...context, min: new Date("2024-03-10"), max: new Date("2024-03-20") };
    const result = parseDateMath("LAST 14 DAYS", scopedContext);
    expect(result.range?.start.toISOString().substring(0, 10)).toEqual("2024-03-10");
  });
});
