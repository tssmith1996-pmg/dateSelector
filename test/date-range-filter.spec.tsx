import React from "react";
import { act } from "react-dom/test-utils";

(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;
import { createRoot, Root } from "react-dom/client";
import { DateRangeFilter } from "../src/components/DateRangeFilter";
import { PRESETS, getToday, normalizeRange, toISODate } from "../src/date";

describe("DateRangeFilter defaults", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    window.location.hash = "";
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
  });

  it("applies the provided default preset when no hash is present", async () => {
    const onChange = jest.fn();
    const preset = PRESETS.find((item) => item.id === "lastMonth");
    if (!preset) {
      throw new Error("Expected lastMonth preset to exist");
    }
    const today = getToday();
    const expected = normalizeRange(preset.from(today), preset.to(today));

    await act(async () => {
      root.render(
        <DateRangeFilter
          presets={PRESETS}
          onChange={onChange}
          forcePortalStrategy="iframe"
          defaultPresetId="lastMonth"
        />,
      );
    });

    expect(onChange).toHaveBeenCalled();
    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1];
    expect(toISODate(lastCall[0].from)).toBe(toISODate(expected.from));
    expect(toISODate(lastCall[0].to)).toBe(toISODate(expected.to));
    expect(lastCall[1]).toBe("lastMonth");
  });

  it("applies a custom default range when provided", async () => {
    const onChange = jest.fn();
    const from = new Date(2024, 0, 2);
    const to = new Date(2024, 0, 5);

    await act(async () => {
      root.render(
        <DateRangeFilter
          presets={PRESETS}
          onChange={onChange}
          forcePortalStrategy="iframe"
          defaultRange={{ from, to }}
        />,
      );
    });

    expect(onChange).toHaveBeenCalled();
    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1];
    expect(toISODate(lastCall[0].from)).toBe("2024-01-02");
    expect(toISODate(lastCall[0].to)).toBe("2024-01-05");
    expect(lastCall[1]).toBe("custom");
  });
});
