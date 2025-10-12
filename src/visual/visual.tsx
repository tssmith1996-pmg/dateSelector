import powerbi from "powerbi-visuals-api";
import * as models from "powerbi-models";
import React from "react";
import { createRoot, Root } from "react-dom/client";
import { DateRangeFilter, DateRange } from "../components/DateRangeFilter";
import { PRESETS, ensureWithinRange, fromISODate, normalizeRange, toISODate } from "../date";

type VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
type VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
type VisualObjectInstance = powerbi.VisualObjectInstance;
type DataView = powerbi.DataView;
type DataViewObjects = powerbi.DataViewObjects;

type PersistedState = {
  range?: { from: string; to: string };
  presetId?: string;
};

type VisualSettings = {
  defaultPresetId?: string;
  minDate?: Date;
  maxDate?: Date;
  persistedState?: PersistedState;
};

type FilterTarget = models.IFilterColumnTarget;

function coerceDate(value: unknown): Date | undefined {
  if (value == null) {
    return undefined;
  }
  if (value instanceof Date) {
    return new Date(value.getTime());
  }
  if (typeof value === "string") {
    const fromPreset = fromISODate(value);
    if (fromPreset) {
      return fromPreset;
    }
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? undefined : parsed;
  }
  if (typeof value === "number") {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? undefined : parsed;
  }
  return undefined;
}

function parsePersistedState(value: unknown): PersistedState | undefined {
  if (typeof value !== "string" || !value.trim()) {
    return undefined;
  }
  try {
    const parsed = JSON.parse(value) as PersistedState;
    if (!parsed || typeof parsed !== "object") {
      return undefined;
    }
    return parsed;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn("Failed to parse persisted state", error);
    return undefined;
  }
}

function getObjects(dataView?: DataView): DataViewObjects | undefined {
  return dataView?.metadata?.objects ?? undefined;
}

function parseVisualSettings(dataView?: DataView): VisualSettings {
  const objects = getObjects(dataView);
  const defaults = objects?.defaults as powerbi.DataViewObject | undefined;
  const limits = objects?.limits as powerbi.DataViewObject | undefined;
  const state = objects?.state as powerbi.DataViewObject | undefined;

  return {
    defaultPresetId: (defaults?.defaultPreset as string | undefined) ?? undefined,
    minDate: coerceDate(limits?.minDate),
    maxDate: coerceDate(limits?.maxDate),
    persistedState: parsePersistedState(state?.payload),
  };
}

function findColumnTarget(dataView?: DataView): FilterTarget | undefined {
  const categories = dataView?.categorical?.categories;
  if (!categories || categories.length === 0) {
    return undefined;
  }
  const source = categories[0]?.source;
  const queryName = source?.queryName;
  if (!queryName) {
    return undefined;
  }
  const segments = queryName.split(".");
  if (segments.length < 2) {
    return undefined;
  }
  const column = segments.pop();
  const table = segments.join(".");
  if (!column || !table) {
    return undefined;
  }
  return { table, column };
}

function findExistingFilterRange(options: VisualUpdateOptions, target?: FilterTarget): DateRange | undefined {
  if (!target) {
    return undefined;
  }
  const filters = options.jsonFilters ?? [];
  for (const filter of filters) {
    const candidate = filter as models.IAdvancedFilter;
    if (!candidate?.target || !("conditions" in candidate)) {
      continue;
    }
    const candidateTarget = candidate.target as FilterTarget;
    if (candidateTarget.column !== target.column || candidateTarget.table !== target.table) {
      continue;
    }
    const lower = candidate.conditions?.find((condition) => condition.operator === "GreaterThanOrEqual");
    const upper = candidate.conditions?.find((condition) => condition.operator === "LessThanOrEqual");
    if (!lower || !upper) {
      continue;
    }
    const from = coerceDate(lower.value);
    const to = coerceDate(upper.value);
    if (from && to) {
      return normalizeRange(from, to);
    }
  }
  return undefined;
}

function getDataBounds(dataView?: DataView): { min?: Date; max?: Date } {
  const categories = dataView?.categorical?.categories;
  if (!categories || categories.length === 0) {
    return {};
  }
  const values = categories[0]?.values;
  if (!values || values.length === 0) {
    return {};
  }
  let min: Date | undefined;
  let max: Date | undefined;
  for (const value of values) {
    const date = coerceDate(value);
    if (!date) {
      continue;
    }
    if (!min || date < min) {
      min = date;
    }
    if (!max || date > max) {
      max = date;
    }
  }
  return { min, max };
}

function toPersistedPayload(range: DateRange, presetId: string): string {
  return JSON.stringify({
    range: { from: toISODate(range.from), to: toISODate(range.to) },
    presetId,
  });
}

function rangesEqual(a: DateRange | undefined, b: DateRange | undefined): boolean {
  if (!a || !b) {
    return false;
  }
  return toISODate(a.from) === toISODate(b.from) && toISODate(a.to) === toISODate(b.to);
}

export class PresetDateSlicerVisual implements powerbi.extensibility.visual.IVisual {
  private host: powerbi.extensibility.visual.IVisualHost;

  private rootElement: HTMLElement;

  private reactRoot: Root;

  private dataView?: DataView;

  private columnTarget?: FilterTarget;

  private currentRange?: DateRange;

  private currentPresetId?: string;

  constructor(options: VisualConstructorOptions) {
    this.host = options.host;
    this.rootElement = document.createElement("div");
    this.rootElement.className = "preset-date-slicer";
    options.element.appendChild(this.rootElement);
    this.reactRoot = createRoot(this.rootElement);
  }

  public update(options: VisualUpdateOptions): void {
    this.dataView = options.dataViews?.[0];
    this.columnTarget = findColumnTarget(this.dataView);
    const settings = parseVisualSettings(this.dataView);
    const bounds = getDataBounds(this.dataView);
    const appliedRange = findExistingFilterRange(options, this.columnTarget);

    const persistedRange = settings.persistedState?.range;
    const persisted = (() => {
      if (!persistedRange?.from || !persistedRange?.to) {
        return undefined;
      }
      const from = coerceDate(persistedRange.from);
      const to = coerceDate(persistedRange.to);
      return from && to ? normalizeRange(from, to) : undefined;
    })();

    const initialRange = appliedRange ?? persisted;

    const defaultRange = initialRange
      ? ensureWithinRange(initialRange, settings.minDate ?? bounds.min, settings.maxDate ?? bounds.max)
      : undefined;

    const defaultPresetId = appliedRange
      ? undefined
      : settings.persistedState?.presetId ?? settings.defaultPresetId ?? undefined;

    const handleChange = (range: DateRange, presetId: string) => {
      if (rangesEqual(this.currentRange, range) && this.currentPresetId === presetId) {
        return;
      }
      this.currentRange = range;
      this.currentPresetId = presetId;
      this.applyRangeFilter(range);
      this.persistState(range, presetId);
    };

    this.reactRoot.render(
      <DateRangeFilter
        presets={PRESETS}
        dataMin={settings.minDate ?? bounds.min}
        dataMax={settings.maxDate ?? bounds.max}
        defaultPresetId={defaultPresetId}
        defaultRange={defaultRange}
        onChange={handleChange}
      />,
    );

    if ((options.type & powerbi.VisualUpdateType.Resize) === 0 && defaultRange && !rangesEqual(this.currentRange, defaultRange)) {
      this.currentRange = defaultRange;
      this.currentPresetId = defaultPresetId;
      this.applyRangeFilter(defaultRange);
    }
  }

  public enumerateObjectInstances(options: powerbi.EnumerateVisualObjectInstancesOptions): VisualObjectInstance[] {
    if (options.objectName === "defaults") {
      return [
        {
          objectName: "defaults",
          properties: {
            defaultPreset: this.currentPresetId ?? "last7",
          },
          selector: undefined as unknown as powerbi.data.Selector,
        },
      ];
    }
    return [];
  }

  public destroy(): void {
    this.reactRoot.unmount();
    this.rootElement.remove();
  }

  private applyRangeFilter(range: DateRange): void {
    if (!this.columnTarget) {
      return;
    }

    const filter = new models.AdvancedFilter(this.columnTarget, "And", [
      { operator: "GreaterThanOrEqual", value: toISODate(range.from) },
      { operator: "LessThanOrEqual", value: toISODate(range.to) },
    ]);

    this.host.applyJsonFilter(filter, "defaults", "filter", powerbi.FilterAction.merge);
  }

  private persistState(range: DateRange, presetId: string): void {
    this.host.persistProperties({
      merge: [
        {
          objectName: "state",
          selector: undefined as unknown as powerbi.data.Selector,
          properties: {
            payload: toPersistedPayload(range, presetId),
          },
        },
        {
          objectName: "defaults",
          selector: undefined as unknown as powerbi.data.Selector,
          properties: {
            defaultPreset: presetId,
          },
        },
      ],
    });
  }
}

export default PresetDateSlicerVisual;
