import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DatePreset, PRESETS, ensureWithinRange, formatRange, fromISODate, getToday, normalizeRange, toISODate } from "../date";
import { OutsideFramePortal, PortalStrategy } from "../portal/OutsideFramePortal";
import { Popover } from "./Popover";
import "../styles/date-range-filter.css";

export type DateRange = { from: Date; to: Date };

type HashRange = { from?: Date; to?: Date };

type DateRangeFilterProps = {
  presets?: DatePreset[];
  dataMin?: Date;
  dataMax?: Date;
  onChange: (range: DateRange, presetId: string) => void;
  forcePortalStrategy?: PortalStrategy;
};

const DEFAULT_PRESET_ID = "last7";

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
  if (typeof window === "undefined") {
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
  window.parent?.postMessage(
    {
      type: "DATE_RANGE_CHANGED",
      range: {
        from: toISODate(range.from),
        to: toISODate(range.to),
      },
      presetId,
    },
    "*",
  );
}

function computeInitialState(presets: DatePreset[], dataMin?: Date, dataMax?: Date) {
  const today = getToday();
  const hashRange = parseHashRange();
  if (hashRange?.from && hashRange?.to) {
    const normalized = ensureWithinRange(normalizeRange(hashRange.from, hashRange.to), dataMin, dataMax);
    const presetId = toPresetIdWithFallback(presets, normalized, today);
    return { range: normalized, presetId };
  }
  const fallbackPreset = presets.find((preset) => preset.id === DEFAULT_PRESET_ID) ?? presets[0] ?? PRESETS[0];
  const range = ensureWithinRange(
    normalizeRange(fallbackPreset.from(today), fallbackPreset.to(today)),
    dataMin,
    dataMax,
  );
  return { range, presetId: fallbackPreset.id };
}

function toPresetIdWithFallback(presets: DatePreset[], range: DateRange, today: Date) {
  for (const preset of presets) {
    const presetRange = normalizeRange(preset.from(today), preset.to(today));
    if (toISODate(presetRange.from) === toISODate(range.from) && toISODate(presetRange.to) === toISODate(range.to)) {
      return preset.id;
    }
  }
  return "custom";
}

export const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
  presets = PRESETS,
  dataMin,
  dataMax,
  onChange,
  forcePortalStrategy = "auto",
}) => {
  const locale = typeof navigator !== "undefined" ? navigator.language : "en-US";
  const anchorRef = useRef<HTMLButtonElement | null>(null);
  const liveRegionRef = useRef<HTMLDivElement | null>(null);
  const today = useMemo(() => getToday(), []);

  const initial = useMemo(() => computeInitialState(presets, dataMin, dataMax), [presets, dataMin, dataMax]);

  const [committedRange, setCommittedRange] = useState<DateRange>(initial.range);
  const [committedPresetId, setCommittedPresetId] = useState(initial.presetId);
  const [draftRange, setDraftRange] = useState<DateRange>(initial.range);
  const [draftPresetId, setDraftPresetId] = useState(initial.presetId);
  const [open, setOpen] = useState(false);
  const notifiedInitialRef = useRef(false);

  useEffect(() => {
    updateHash(committedRange);
  }, [committedRange]);

  useEffect(() => {
    if (notifiedInitialRef.current) {
      return;
    }
    onChange(initial.range, initial.presetId);
    postRangeChanged(initial.range, initial.presetId);
    notifiedInitialRef.current = true;
  }, [initial, onChange]);

  const pillLabel = useMemo(() => formatRange(committedRange.from, committedRange.to, locale), [committedRange, locale]);

  const commitChange = useCallback(
    (range: DateRange, presetId: string) => {
      setCommittedRange(range);
      setCommittedPresetId(presetId);
      setDraftRange(range);
      setDraftPresetId(presetId);
      onChange(range, presetId);
      postRangeChanged(range, presetId);
      if (liveRegionRef.current) {
        liveRegionRef.current.textContent = formatRange(range.from, range.to, locale);
      }
    },
    [locale, onChange],
  );

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
    const fallbackPreset = presets.find((preset) => preset.id === DEFAULT_PRESET_ID) ?? presets[0];
    const raw = fallbackPreset
      ? normalizeRange(fallbackPreset.from(today), fallbackPreset.to(today))
      : normalizeRange(today, today);
    const normalized = ensureWithinRange(raw, dataMin, dataMax);
    const presetId = fallbackPreset ? fallbackPreset.id : DEFAULT_PRESET_ID;
    commitChange(normalized, presetId);
    setOpen(false);
    anchorRef.current?.focus();
  }, [commitChange, today, dataMin, dataMax, presets]);

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
        className="date-range-filter__pill"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <span className="date-range-filter__icon" aria-hidden="true" />
        <span className="date-range-filter__label">{pillLabel}</span>
        <span className="date-range-filter__chevron" aria-hidden="true" />
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
            onClear={handleClear}
            onClose={handleClose}
          />
        </OutsideFramePortal>
      ) : null}
    </div>
  );
};

