import powerbi from "powerbi-visuals-api";
import React from "react";
import { act } from "react-dom/test-utils";

(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;
import { createRoot, Root } from "react-dom/client";
import { DateRangeFilter } from "../src/components/DateRangeFilter";
import { PRESETS, getToday, normalizeRange, toISODate } from "../src/date";
import { getVisualStrings } from "../src/utils/localization";

import DialogAction = powerbi.DialogAction;

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
          strings={STRINGS}
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
          strings={STRINGS}
        />,
      );
    });

    expect(onChange).toHaveBeenCalled();
    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1];
    expect(toISODate(lastCall[0].from)).toBe("2024-01-02");
    expect(toISODate(lastCall[0].to)).toBe("2024-01-05");
    expect(lastCall[1]).toBe("custom");
  });

  it("applies the dialog result when the host provides one", async () => {
    const onChange = jest.fn();
    const openDialog = jest.fn().mockResolvedValue({
      actionId: DialogAction.OK,
      resultState: {
        range: { from: "2024-01-02", to: "2024-01-05" },
        presetId: "custom",
      },
    });

    await act(async () => {
      root.render(
        <DateRangeFilter
          presets={PRESETS}
          onChange={onChange}
          openDialog={openDialog}
          forcePortalStrategy="iframe"
          strings={STRINGS}
        />,
      );
    });

    onChange.mockClear();

    const pill = container.querySelector<HTMLDivElement>(".date-range-filter__pill");
    if (!pill) {
      throw new Error("Expected pill trigger to exist");
    }

    await act(async () => {
      pill.click();
      await Promise.resolve();
    });

    expect(openDialog).toHaveBeenCalled();
    expect(onChange).toHaveBeenCalledTimes(1);
    const lastCall = onChange.mock.calls[0];
    expect(toISODate(lastCall[0].from)).toBe("2024-01-02");
    expect(toISODate(lastCall[0].to)).toBe("2024-01-05");
    expect(lastCall[1]).toBe("custom");
  });

  it("renders a labelled manual input when editing the start date", async () => {
    await act(async () => {
      root.render(
        <DateRangeFilter
          presets={PRESETS}
          onChange={jest.fn()}
          forcePortalStrategy="iframe"
          defaultRange={{ from: new Date(2024, 0, 2), to: new Date(2024, 0, 5) }}
          strings={STRINGS}
        />,
      );
    });

    const triggers = container.querySelectorAll<HTMLSpanElement>(
      ".date-range-filter__label-date",
    );
    const startTrigger = triggers[0];
    if (!startTrigger) {
      throw new Error("Expected start date trigger to exist");
    }

    await act(async () => {
      startTrigger.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    const input = container.querySelector<HTMLInputElement>(".date-range-filter__input");
    if (!input) {
      throw new Error("Expected manual input to appear");
    }
    expect(input.getAttribute("aria-label")).toBe(STRINGS.manualEntry.startLabel);

    const message = container.querySelector<HTMLParagraphElement>(
      ".date-range-filter__message",
    );
    if (!message) {
      throw new Error("Expected hint message to appear");
    }
    expect(message.textContent).toContain(STRINGS.manualEntry.formatHint);
    expect(input.getAttribute("aria-describedby")).toBe(message.id);
  });

  it("assigns distinct hint identifiers for start and end manual inputs", async () => {
    await act(async () => {
      root.render(
        <DateRangeFilter
          presets={PRESETS}
          onChange={jest.fn()}
          forcePortalStrategy="iframe"
          defaultRange={{ from: new Date(2024, 0, 2), to: new Date(2024, 0, 5) }}
          strings={STRINGS}
        />,
      );
    });

    const triggers = container.querySelectorAll<HTMLSpanElement>(
      ".date-range-filter__label-date",
    );
    const startTrigger = triggers[0];
    const endTrigger = triggers[1];
    if (!startTrigger || !endTrigger) {
      throw new Error("Expected both date triggers to exist");
    }

    await act(async () => {
      startTrigger.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    const startInput = container.querySelector<HTMLInputElement>(
      ".date-range-filter__input",
    );
    const startMessage = container.querySelector<HTMLParagraphElement>(
      ".date-range-filter__message",
    );
    if (!startInput || !startMessage) {
      throw new Error("Expected start manual edit elements to appear");
    }
    const startMessageId = startMessage.id;
    expect(startInput.getAttribute("aria-describedby")).toBe(startMessageId);

    await act(async () => {
      invokeKeyDown(startInput, "Escape");
    });

    await act(async () => {
      endTrigger.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    const endInput = container.querySelector<HTMLInputElement>(
      ".date-range-filter__input",
    );
    const endMessage = container.querySelector<HTMLParagraphElement>(
      ".date-range-filter__message",
    );
    if (!endInput || !endMessage) {
      throw new Error("Expected end manual edit elements to appear");
    }
    expect(endInput.getAttribute("aria-describedby")).toBe(endMessage.id);
    expect(endMessage.id).not.toBe(startMessageId);
  });
});
const STRINGS = getVisualStrings({
  getDisplayName: () => "",
} as powerbi.extensibility.ILocalizationManager);

function invokeKeyDown(node: HTMLInputElement, key: string) {
  const fiberKey = Object.keys(node).find((entry) => entry.startsWith("__reactFiber"));
  if (!fiberKey) {
    throw new Error("Expected React fiber key on input element");
  }
  const fiber = (node as unknown as Record<string, unknown>)[fiberKey] as {
    pendingProps?: { onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void };
    memoizedProps?: { onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void };
  };
  const props = fiber?.pendingProps ?? fiber?.memoizedProps;
  const handler = props?.onKeyDown;
  if (typeof handler !== "function") {
    throw new Error("Expected onKeyDown handler on manual input");
  }
  handler({
    key,
    preventDefault: () => {},
    stopPropagation: () => {},
  } as unknown as React.KeyboardEvent<HTMLInputElement>);
}

