import { BUILT_IN_PRESETS, mergePresetLists, resolvePreset } from "../src/presets";
import { PresetContext, PresetDefinition } from "../src/types";

describe("presets", () => {
  const context: PresetContext = {
    today: new Date("2024-01-15"),
    firstDayOfWeek: 1,
  };

  it("merges custom presets without duplicates", () => {
    const custom: PresetDefinition[] = [
      { key: "custom", label: "Custom", expression: "TODAY" },
      { key: "today", label: "Override", expression: "TODAY" }
    ];
    const merged = mergePresetLists(BUILT_IN_PRESETS, custom);
    expect(merged.find((p) => p.key === "custom")).toBeDefined();
    const todayCount = merged.filter((p) => p.key === "today").length;
    expect(todayCount).toBe(1);
  });

  it("resolves preset expressions", () => {
    const preset = BUILT_IN_PRESETS.find((p) => p.key === "ytd");
    const result = resolvePreset(preset!, context);
    expect(result.range).toBeDefined();
    expect(result.range?.start.getFullYear()).toBe(2024);
  });
});
