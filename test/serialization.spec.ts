import { serializeRange, deserializeRange } from "../src/dateMath";
import { VisualPersistedState, SelectionMode, PersistedPayload } from "../src/types";

describe("serialization", () => {
  it("roundtrips a date range", () => {
    const original = {
      start: new Date("2024-04-01"),
      end: new Date("2024-04-15"),
    };
    const serialized = serializeRange(original);
    const restored = deserializeRange(serialized);
    expect(restored.start.toISOString().substring(0, 10)).toBe("2024-04-01");
    expect(restored.end.toISOString().substring(0, 10)).toBe("2024-04-15");
  });

  it("serializes visual state", () => {
    const state: VisualPersistedState = {
      ranges: [{ start: new Date("2024-05-01"), end: new Date("2024-05-10") }],
      presetKey: "today",
      displayMode: "popup",
      selectionMode: "range" as SelectionMode,
      allowMultiple: true,
      firstDayOfWeek: 1,
      version: 1,
    };
    const payload: PersistedPayload = {
      ...state,
      ranges: state.ranges.map(serializeRange),
    };
    const json = JSON.stringify(payload);
    const parsed = JSON.parse(json) as PersistedPayload;
    expect(parsed.ranges[0].start).toBe("2024-05-01");
    const restored = parsed.ranges.map(deserializeRange);
    expect(restored[0].end.toISOString().substring(0, 10)).toBe("2024-05-10");
  });
});
