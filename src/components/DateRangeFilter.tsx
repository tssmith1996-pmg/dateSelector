import powerbi from "powerbi-visuals-api";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  DatePreset,
  PRESETS,
  ensureWithinRange,
  formatRange,
  fromISODate,
  getToday,
  normalizeRange,
  toISODate,
} from "../date";
import { OutsideFramePortal, PortalStrategy } from "../portal/OutsideFramePortal";
import { resolveDefaultRange, toPresetIdWithFallback } from "./dateRangeDefaults";
import { Popover } from "./Popover";
import { DateRange } from "../types/dateRange";
import { DateRangeDialogInitialState, DateRangeDialogResult } from "../dialogs/types";
import { VisualStrings } from "../types/localization";
import "../styles/date-range-filter.css";

import DialogAction = powerbi.DialogAction;

type HashRange = { from?: Date; to?: Date };

type DialogInvoker = (
  initialState: DateRangeDialogInitialState,
) => Promise<{ actionId: DialogAction; resultState?: unknown } | undefined>;

function isTopLevelWindow(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  try {
    return window.self === window.top;
  } catch (error) {
    return false;
  }
}

function getSameOriginParent(): Window | undefined {
  if (typeof window === "undefined") {
    return undefined;
  }
  if (window.parent === window) {
    return window;
  }
  try {
    const parentOrigin = window.parent.location?.origin;
    if (parentOrigin && parentOrigin === window.location?.origin) {
      return window.parent;
    }
  } catch (error) {
    return undefined;
  }
  return undefined;
}

type DateRangeFilterProps = {
  presets?: DatePreset[];
  dataMin?: Date;
  dataMax?: Date;
  onChange: (range: DateRange, presetId: string, info?: { reason: "initial" | "user" }) => void;
  forcePortalStrategy?: PortalStrategy;
  openDialog?: DialogInvoker;
  defaultPresetId?: string;
  defaultRange?: DateRange;
  localeOverride?: string;
  weekStartsOn?: number;
  pillStyle?: "compact" | "expanded";
  pillColors?: { background?: string; border?: string; text?: string };
  pillFontSize?: number;
  pillMinWidth?: number;
  showPresetLabels?: boolean;
  showQuickApply?: boolean;
  showClear?: boolean;
  isInteractive?: boolean;
  strings: VisualStrings;
};

function rangesEqual(a: DateRange | undefined, b: DateRange | undefined): boolean {
  if (!a || !b) {
    return false;
  }
  return toISODate(a.from) === toISODate(b.from) && toISODate(a.to) === toISODate(b.to);
}

function parseHashRange(): HashRange | null {
  if (typeof window === "undefined" || !window.location.hash) {
    return null;
  }
  const params = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const from = params.get("from");
  const to = params.get("to");
  if (!from || !to) {
    return null;
  }
  const parsedFrom = fromISODate(from);
  const parsedTo = fromISODate(to);
  if (!parsedFrom || !parsedTo) {
    return null;
  }
  return { from: parsedFrom, to: parsedTo };
}

function updateHash(range: DateRange) {
  if (typeof window === "undefined" || !isTopLevelWindow()) {
    return;
  }
  const params = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  params.set("from", toISODate(range.from));
  params.set("to", toISODate(range.to));
  const stringified = params.toString();
  window.history.replaceState(null, "", stringified ? `#${stringified}` : window.location.pathname);
}

function postRangeChanged(range: DateRange, presetId: string) {
  if (typeof window === "undefined") {
    return;
  }
  const parentWindow = getSameOriginParent();
  const targetOrigin = parentWindow?.location?.origin;
  if (!parentWindow || !targetOrigin) {
    return;
  }
  parentWindow.postMessage(
    {
      type: "DATE_RANGE_CHANGED",
      range: {
        from: toISODate(range.from),
        to: toISODate(range.to),
      },
      presetId,
    },
    targetOrigin,
  );
}

function computeInitialState(
  presets: DatePreset[],
  dataMin: Date | undefined,
  dataMax: Date | undefined,
  defaultPresetId: string | undefined,
  defaultRange: DateRange | undefined,
) {
  const today = getToday();
  const hashRange = parseHashRange();
  if (hashRange?.from && hashRange?.to) {
    const normalized = ensureWithinRange(normalizeRange(hashRange.from, hashRange.to), dataMin, dataMax);
    const presetId = toPresetIdWithFallback(presets, normalized, today);
    return { range: normalized, presetId };
  }
  return resolveDefaultRange(presets, dataMin, dataMax, today, defaultPresetId, defaultRange);
}

export const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
  presets = PRESETS,
  dataMin,
  dataMax,
  onChange,
  openDialog,
  forcePortalStrategy = "auto",
  defaultPresetId,
  defaultRange,
  localeOverride,
  weekStartsOn,
  pillStyle = "compact",
  pillColors,
  pillFontSize,
  pillMinWidth,
  showPresetLabels = true,
  showQuickApply = false,
  showClear = true,
  isInteractive = true,
  strings,
}) => {
  const locale = localeOverride && localeOverride.trim()
    ? localeOverride
    : typeof navigator !== "undefined"
      ? navigator.language
      : "en-US";
  const anchorRef = useRef<HTMLButtonElement | null>(null);
  const liveRegionRef = useRef<HTMLDivElement | null>(null);
  const today = useMemo(() => getToday(), []);

  const dataMinTime = dataMin?.getTime();
  const dataMaxTime = dataMax?.getTime();
  const defaultRangeKey = defaultRange
    ? `${defaultRange.from.getTime()}:${defaultRange.to.getTime()}`
    : "";

  const initial = useMemo(
    () => computeInitialState(presets, dataMin, dataMax, defaultPresetId, defaultRange),
    [presets, dataMinTime, dataMaxTime, defaultPresetId, defaultRangeKey],
  );

  const [committedRange, setCommittedRange] = useState<DateRange>(initial.range);
  const [committedPresetId, setCommittedPresetId] = useState(initial.presetId);
  const [draftRange, setDraftRange] = useState<DateRange>(initial.range);
  const [draftPresetId, setDraftPresetId] = useState(initial.presetId);
  const [open, setOpen] = useState(false);
  const initialSignatureRef = useRef<string>();
  const normalizedWeekStartsOn = useMemo(() => {
    if (typeof weekStartsOn !== "number" || Number.isNaN(weekStartsOn)) {
      return 1;
    }
    const rounded = Math.round(weekStartsOn);
    return ((rounded % 7) + 7) % 7;
  }, [weekStartsOn]);


  const commitChange = useCallback(
    (range: DateRange, presetId: string, options?: { force?: boolean }) => {
      const force = options?.force ?? false;
      let changed = force;
      setCommittedRange((previous) => {
        if (previous && rangesEqual(previous, range)) {
          return previous;
        }
        changed = true;
        return range;
      });
      setCommittedPresetId((previous) => {
        if (previous === presetId) {
          return previous;
        }
        changed = true;
        return presetId;
      });
      setDraftRange(range);
      setDraftPresetId(presetId);
      if (!changed && !force) {
        return;
      }
      onChange(range, presetId, { reason: force ? "initial" : "user" });
      if (isInteractive) {
        postRangeChanged(range, presetId);
      }
      if (liveRegionRef.current) {
        liveRegionRef.current.textContent = formatRange(range.from, range.to, locale);
      }
    },
    [isInteractive, locale, onChange],
  );

  const invokeDialog = useCallback(() => {
    if (!isInteractive) {
      return;
    }
    if (!openDialog) {
      setOpen((value) => !value);
      return;
    }
    const initialState: DateRangeDialogInitialState = {
      range: {
        from: toISODate(committedRange.from),
        to: toISODate(committedRange.to),
      },
      presetId: committedPresetId,
      dataMin: dataMin ? toISODate(dataMin) : undefined,
      dataMax: dataMax ? toISODate(dataMax) : undefined,
      presetIds: presets.map((preset) => preset.id),
      locale,
      weekStartsOn: normalizedWeekStartsOn,
      showPresetLabels,
      showQuickApply,
      showClear,
      defaultPresetId,
      defaultRange: defaultRange
        ? { from: toISODate(defaultRange.from), to: toISODate(defaultRange.to) }
        : undefined,
      strings,
    };
    openDialog(initialState)
      .then((result) => {
        if (!result || result.actionId !== DialogAction.OK || !result.resultState) {
          return;
        }
        const payload = result.resultState as DateRangeDialogResult;
        const from = payload.range?.from ? fromISODate(payload.range.from) : null;
        const to = payload.range?.to ? fromISODate(payload.range.to) : null;
        if (!from || !to) {
          return;
        }
        const normalized = ensureWithinRange(normalizeRange(from, to), dataMin, dataMax);
        const presetId =
          typeof payload.presetId === "string" && payload.presetId.trim()
            ? payload.presetId
            : toPresetIdWithFallback(presets, normalized, today);
        commitChange(normalized, presetId);
      })
      .catch((error) => {
        console.warn("Failed to open date range dialog", error);
      })
      .finally(() => {
        anchorRef.current?.focus();
      });
  }, [
    isInteractive,
    openDialog,
    committedRange,
    committedPresetId,
    dataMin,
    dataMax,
    presets,
    locale,
    normalizedWeekStartsOn,
    showPresetLabels,
    showQuickApply,
    showClear,
    defaultPresetId,
    defaultRange,
    strings,
    today,
    commitChange,
  ]);

  useEffect(() => {
    updateHash(committedRange);
  }, [committedRange]);

  useEffect(() => {
    if (!isInteractive) {
      setOpen(false);
    }
  }, [isInteractive]);

  useEffect(() => {
    const signature = `${initial.presetId}:${initial.range.from.getTime()}:${initial.range.to.getTime()}`;
    if (initialSignatureRef.current === signature) {
      return;
    }
    initialSignatureRef.current = signature;
    commitChange(initial.range, initial.presetId, { force: true });
  }, [commitChange, initial]);

  const pillLabel = useMemo(() => formatRange(committedRange.from, committedRange.to, locale), [committedRange, locale]);

  const handlePresetDraft = useCallback(
    (presetId: string) => {
      const preset = presets.find((p) => p.id === presetId);
      if (!preset) {
        return;
      }
      const presetRange = ensureWithinRange(
        normalizeRange(preset.from(today), preset.to(today)),
        dataMin,
        dataMax,
      );
      setDraftRange(presetRange);
      setDraftPresetId(presetId);
    },
    [presets, today, dataMin, dataMax],
  );

  const handleCalendarDraft = useCallback((range: DateRange) => {
    setDraftRange(range);
    setDraftPresetId(toPresetIdWithFallback(presets, range, today));
  }, [presets, today]);

  const handleApply = useCallback(() => {
    commitChange(draftRange, draftPresetId);
    setOpen(false);
    anchorRef.current?.focus();
  }, [commitChange, draftRange, draftPresetId]);

  const handleClear = useCallback(() => {
    const resolved = resolveDefaultRange(presets, dataMin, dataMax, today, defaultPresetId, defaultRange);
    commitChange(resolved.range, resolved.presetId);
    setOpen(false);
    anchorRef.current?.focus();
  }, [commitChange, presets, dataMin, dataMax, today, defaultPresetId, defaultRange]);

  const handleQuickApply = useCallback(() => {
    const todayRange = ensureWithinRange(
      normalizeRange(today, today),
      dataMin,
      dataMax,
    );
    const presetId = toPresetIdWithFallback(presets, todayRange, today);
    commitChange(todayRange, presetId);
    setOpen(false);
    anchorRef.current?.focus();
  }, [commitChange, dataMin, dataMax, presets, today]);

  const handleClose = useCallback(() => {
    setOpen(false);
    setDraftRange(committedRange);
    setDraftPresetId(committedPresetId);
    anchorRef.current?.focus();
  }, [committedRange, committedPresetId]);

  useEffect(() => {
    if (!open) {
      return;
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        handleClose();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, handleClose]);

  return (
    <div className="date-range-filter">
      <button
        ref={anchorRef}
        type="button"
        className={[
          "date-range-filter__pill",
          pillStyle === "expanded"
            ? "date-range-filter__pill--expanded"
            : "date-range-filter__pill--compact",
          !isInteractive ? "date-range-filter__pill--disabled" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        aria-haspopup="dialog"
        aria-expanded={openDialog ? undefined : open}
        aria-disabled={!isInteractive}
        aria-label={strings.pill.ariaLabel}
        title={!isInteractive ? strings.pill.disabledMessage : undefined}
        onClick={(event) => {
          if (!isInteractive) {
            event.preventDefault();
            return;
          }
          invokeDialog();
        }}
        style={{
          backgroundColor: pillColors?.background,
          borderColor: pillColors?.border,
          color: pillColors?.text,
          fontSize: pillFontSize ? `${pillFontSize}px` : undefined,
          minWidth: pillMinWidth ? `${pillMinWidth}px` : undefined,
        }}
      >
        <span className="date-range-filter__icon" aria-hidden="true">
          <svg viewBox="0 0 16 16" focusable="false" aria-hidden="true">
            <path d="M5 1.5a.5.5 0 0 0-1 0V2h-.5A2.5 2.5 0 0 0 1 4.5v8A2.5 2.5 0 0 0 3.5 15h9A2.5 2.5 0 0 0 15 12.5v-8A2.5 2.5 0 0 0 12.5 2H12v-.5a.5.5 0 0 0-1 0V2H5V1.5Z" />
            <path d="M14 6H2v6.5A1.5 1.5 0 0 0 3.5 14h9a1.5 1.5 0 0 0 1.5-1.5V6Z" />
          </svg>
        </span>
        <span className="date-range-filter__label">{pillLabel}</span>
        <span className="date-range-filter__chevron" aria-hidden="true">
          <svg viewBox="0 0 12 8" focusable="false" aria-hidden="true">
            <path d="M1.41.58 6 5.17 10.59.58 12 2 6 8 0 2z" />
          </svg>
        </span>
      </button>
      <div ref={liveRegionRef} className="visually-hidden" aria-live="polite" />
      {open ? (
        <OutsideFramePortal anchorRef={anchorRef} strategy={forcePortalStrategy}>
          <Popover
            range={draftRange}
            onRangeChange={handleCalendarDraft}
            presetId={draftPresetId}
            committedPresetId={committedPresetId}
            presets={presets}
            locale={locale}
            dataMin={dataMin}
            dataMax={dataMax}
            onPresetSelect={handlePresetDraft}
            onApply={handleApply}
            onClear={showClear ? handleClear : undefined}
            onClose={handleClose}
            showQuickApply={showQuickApply}
          onQuickApply={showQuickApply ? handleQuickApply : undefined}
          showClear={showClear}
          showPresetLabels={showPresetLabels}
          weekStartsOn={normalizedWeekStartsOn}
          strings={strings}
        />
        </OutsideFramePortal>
      ) : null}
    </div>
  );
};

