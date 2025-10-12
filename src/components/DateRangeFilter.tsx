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
  defaultPresetId?: string;
  defaultRange?: DateRange;
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

function toPresetIdWithFallback(presets: DatePreset[], range: DateRange, today: Date) {
  for (const preset of presets) {
    const presetRange = normalizeRange(preset.from(today), preset.to(today));
    if (toISODate(presetRange.from) === toISODate(range.from) && toISODate(presetRange.to) === toISODate(range.to)) {
      return preset.id;
    }
  }
  return "custom";
}

function findPresetById(presets: DatePreset[], id?: string | null): DatePreset | undefined {
  if (!id) {
    return undefined;
  }
  return presets.find((preset) => preset.id === id);
}

function resolveDefaultRange(
  presets: DatePreset[],
  dataMin: Date | undefined,
  dataMax: Date | undefined,
  today: Date,
  defaultPresetId?: string,
  defaultRange?: DateRange,
) {
  if (defaultRange) {
    const normalized = ensureWithinRange(
      normalizeRange(defaultRange.from, defaultRange.to),
      dataMin,
      dataMax,
    );
    const presetExists = defaultPresetId ? presets.some((preset) => preset.id === defaultPresetId) : false;
    const presetId = presetExists ? defaultPresetId! : toPresetIdWithFallback(presets, normalized, today);
    return { range: normalized, presetId };
  }

  const fallbackCandidates: DatePreset[] = [];
  const provided = findPresetById(presets, defaultPresetId) ?? findPresetById(PRESETS, defaultPresetId);
  if (provided) {
    fallbackCandidates.push(provided);
  }
  const defaultPreset = findPresetById(presets, DEFAULT_PRESET_ID) ?? findPresetById(PRESETS, DEFAULT_PRESET_ID);
  if (defaultPreset) {
    fallbackCandidates.push(defaultPreset);
  }
  if (presets.length > 0) {
    fallbackCandidates.push(presets[0]);
  }
  if (PRESETS.length > 0) {
    fallbackCandidates.push(PRESETS[0]);
  }

  for (const candidate of fallbackCandidates) {
    if (!candidate) {
      continue;
    }
    const range = ensureWithinRange(
      normalizeRange(candidate.from(today), candidate.to(today)),
      dataMin,
      dataMax,
    );
    return { range, presetId: candidate.id };
  }

  const normalized = ensureWithinRange(normalizeRange(today, today), dataMin, dataMax);
  return { range: normalized, presetId: defaultPresetId ?? DEFAULT_PRESET_ID };
}

function rangesEqual(a: DateRange, b: DateRange): boolean {
  return toISODate(a.from) === toISODate(b.from) && toISODate(a.to) === toISODate(b.to);
}

export const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
  presets = PRESETS,
  dataMin,
  dataMax,
  onChange,
  forcePortalStrategy = "auto",
  defaultPresetId,
  defaultRange,
}) => {
  const locale = typeof navigator !== "undefined" ? navigator.language : "en-US";
  const anchorRef = useRef<HTMLButtonElement | null>(null);
  const liveRegionRef = useRef<HTMLDivElement | null>(null);
  const today = useMemo(() => getToday(), []);

  const initial = useMemo(
    () => computeInitialState(presets, dataMin, dataMax, defaultPresetId, defaultRange),
    [presets, dataMin, dataMax, defaultPresetId, defaultRange],
  );

  const [committedRange, setCommittedRange] = useState<DateRange>(initial.range);
  const [committedPresetId, setCommittedPresetId] = useState(initial.presetId);
  const [draftRange, setDraftRange] = useState<DateRange>(initial.range);
  const [draftPresetId, setDraftPresetId] = useState(initial.presetId);
  const [open, setOpen] = useState(false);
  const initialAppliedRef = useRef(false);
  const previousInitialRef = useRef(initial);

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

  useEffect(() => {
    updateHash(committedRange);
  }, [committedRange]);

  useEffect(() => {
    if (initialAppliedRef.current) {
      return;
    }
    initialAppliedRef.current = true;
    commitChange(initial.range, initial.presetId);
  }, [commitChange, initial]);

  useEffect(() => {
    const previous = previousInitialRef.current;
    if (
      previous &&
      (previous.presetId !== initial.presetId || !rangesEqual(previous.range, initial.range))
    ) {
      commitChange(initial.range, initial.presetId);
    }
    previousInitialRef.current = initial;
  }, [initial, commitChange]);

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

