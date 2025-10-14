import powerbi from "powerbi-visuals-api";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { createRoot, Root } from "react-dom/client";
import DialogConstructorOptions = powerbi.extensibility.visual.DialogConstructorOptions;
import DialogAction = powerbi.DialogAction;
import { DatePreset, PRESETS, ensureWithinRange, fromISODate, getToday, normalizeRange, toISODate } from "../date";
import { Popover } from "../components/Popover";
import { resolveDefaultRange, toPresetIdWithFallback } from "../components/dateRangeDefaults";
import { DateRange } from "../types/dateRange";
import { DateRangeDialogInitialState, DateRangeDialogResult } from "./types";
import "../styles/date-range-dialog.css";

function coerceISODate(value?: string | null): Date | undefined {
  if (!value) {
    return undefined;
  }
  const parsed = fromISODate(value);
  return parsed ?? undefined;
}

function buildPresets(ids: string[] | undefined): DatePreset[] {
  if (!ids || ids.length === 0) {
    return PRESETS;
  }
  const presetMap = new Map(PRESETS.map((preset) => [preset.id, preset]));
  const resolved: DatePreset[] = [];
  for (const id of ids) {
    const preset = presetMap.get(id);
    if (preset) {
      resolved.push(preset);
    }
  }
  return resolved.length > 0 ? resolved : PRESETS;
}

type DateRangeDialogViewProps = {
  host: powerbi.extensibility.visual.IDialogHost;
  initialState: DateRangeDialogInitialState;
};

const DateRangeDialogView: React.FC<DateRangeDialogViewProps> = ({ host, initialState }) => {
  const strings = initialState.strings;
  const presets = useMemo(() => {
    const base = buildPresets(initialState.presetIds);
    return base.map((preset) => {
      const key = preset.id as keyof typeof strings.presetLabels;
      const label = strings.presetLabels[key] ?? preset.label;
      return { ...preset, label };
    });
  }, [initialState.presetIds, strings]);
  const locale = initialState.locale && initialState.locale.trim()
    ? initialState.locale
    : typeof navigator !== "undefined"
      ? navigator.language
      : "en-US";
  const dataMin = useMemo(() => coerceISODate(initialState.dataMin), [initialState.dataMin]);
  const dataMax = useMemo(() => coerceISODate(initialState.dataMax), [initialState.dataMax]);
  const defaultRange = useMemo(() => {
    if (!initialState.defaultRange) {
      return undefined;
    }
    const from = coerceISODate(initialState.defaultRange.from);
    const to = coerceISODate(initialState.defaultRange.to);
    if (!from || !to) {
      return undefined;
    }
    return ensureWithinRange(normalizeRange(from, to), dataMin, dataMax);
  }, [initialState.defaultRange, dataMin, dataMax]);

  const today = useMemo(() => getToday(), []);
  const normalizedWeekStartsOn = useMemo(() => {
    const raw = initialState.weekStartsOn;
    if (typeof raw !== "number" || Number.isNaN(raw)) {
      return 1;
    }
    const rounded = Math.round(raw);
    return ((rounded % 7) + 7) % 7;
  }, [initialState.weekStartsOn]);

  const initialRange = useMemo(() => {
    const from = coerceISODate(initialState.range.from) ?? today;
    const to = coerceISODate(initialState.range.to) ?? today;
    return ensureWithinRange(normalizeRange(from, to), dataMin, dataMax);
  }, [initialState.range.from, initialState.range.to, dataMin, dataMax, today]);

  const initialPresetId = useMemo(() => {
    const candidate = presets.find((preset) => preset.id === initialState.presetId);
    if (candidate) {
      const presetRange = normalizeRange(candidate.from(today), candidate.to(today));
      if (
        presetRange.from.getTime() === initialRange.from.getTime() &&
        presetRange.to.getTime() === initialRange.to.getTime()
      ) {
        return candidate.id;
      }
    }
    return toPresetIdWithFallback(presets, initialRange, today);
  }, [presets, initialState.presetId, initialRange, today]);

  const [draftRange, setDraftRange] = useState<DateRange>(initialRange);
  const [draftPresetId, setDraftPresetId] = useState(initialPresetId);

  const handlePresetSelect = useCallback(
    (presetId: string) => {
      const preset = presets.find((item) => item.id === presetId);
      if (!preset) {
        return;
      }
      const presetRange = ensureWithinRange(normalizeRange(preset.from(today), preset.to(today)), dataMin, dataMax);
      setDraftRange(presetRange);
      setDraftPresetId(presetId);
    },
    [presets, today, dataMin, dataMax],
  );

  const handleRangeChange = useCallback(
    (range: DateRange) => {
      setDraftRange(range);
      setDraftPresetId(toPresetIdWithFallback(presets, range, today));
    },
    [presets, today],
  );

  const closeWithResult = useCallback(
    (action: DialogAction, result?: DateRangeDialogResult) => {
      host.close(action, result);
    },
    [host],
  );

  const emitResult = useCallback(
    (range: DateRange, presetId: string) => {
      closeWithResult(DialogAction.OK, {
        range: { from: toISODate(range.from), to: toISODate(range.to) },
        presetId,
      });
    },
    [closeWithResult],
  );

  const handleApply = useCallback(() => {
    emitResult(draftRange, draftPresetId);
  }, [emitResult, draftRange, draftPresetId]);

  const handleClear = useCallback(() => {
    const resolved = resolveDefaultRange(
      presets,
      dataMin,
      dataMax,
      today,
      initialState.defaultPresetId,
      defaultRange,
    );
    emitResult(resolved.range, resolved.presetId);
  }, [presets, dataMin, dataMax, today, initialState.defaultPresetId, defaultRange, emitResult]);

  const handleQuickApply = useCallback(() => {
    const todayRange = ensureWithinRange(normalizeRange(today, today), dataMin, dataMax);
    const presetId = toPresetIdWithFallback(presets, todayRange, today);
    emitResult(todayRange, presetId);
  }, [dataMin, dataMax, emitResult, presets, today]);

  const handleClose = useCallback(() => {
    host.close(DialogAction.Cancel);
  }, [host]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        host.close(DialogAction.Cancel);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [host]);

  return (
    <div className="date-range-dialog">
      <Popover
        range={draftRange}
        onRangeChange={handleRangeChange}
        presetId={draftPresetId}
        committedPresetId={initialPresetId}
        presets={presets}
        locale={locale}
        dataMin={dataMin}
        dataMax={dataMax}
        onPresetSelect={handlePresetSelect}
        onApply={handleApply}
        onClear={initialState.showClear ? handleClear : undefined}
        onClose={handleClose}
        showQuickApply={initialState.showQuickApply}
        onQuickApply={initialState.showQuickApply ? handleQuickApply : undefined}
        showClear={initialState.showClear}
        showPresetLabels={initialState.showPresetLabels}
        weekStartsOn={normalizedWeekStartsOn}
        strings={strings}
      />
    </div>
  );
};

export class DateRangeDialog {
  public static readonly id = "PresetDateRangeDialog";

  private root: Root;

  constructor(options: DialogConstructorOptions, initialState: DateRangeDialogInitialState) {
    this.root = createRoot(options.element);
    this.root.render(<DateRangeDialogView host={options.host} initialState={initialState} />);
  }

  public destroy(): void {
    this.root.unmount();
  }
}

type DialogRegistry = Record<string, unknown>;

const registryHost = globalThis as typeof globalThis & { dialogRegistry?: DialogRegistry };
registryHost.dialogRegistry = registryHost.dialogRegistry || {};
registryHost.dialogRegistry[DateRangeDialog.id] = DateRangeDialog;
