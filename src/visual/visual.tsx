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
  raw?: string;
};

type DefaultsSettings = {
  presetId?: string;
  weekStartsOn?: number;
  locale?: string;
};

type LimitsSettings = {
  minDate?: Date;
  maxDate?: Date;
};

type PillSettings = {
  style?: "compact" | "expanded";
  showPresetLabels?: boolean;
  backgroundColor?: string;
  borderColor?: string;
  textColor?: string;
  fontSize?: number;
};

type ButtonSettings = {
  showQuickApply?: boolean;
  showClear?: boolean;
};

type VisualSettings = {
  defaults: DefaultsSettings;
  limits: LimitsSettings;
  pill: PillSettings;
  buttons: ButtonSettings;
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
    return { ...parsed, raw: value };
  } catch (error) {
    console.warn("Failed to parse persisted state", error);
    return undefined;
  }
}

function getObjects(dataView?: DataView): DataViewObjects | undefined {
  return dataView?.metadata?.objects ?? undefined;
}

function getNumericValue(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  return undefined;
}

function getBooleanValue(value: unknown): boolean | undefined {
  if (typeof value === "boolean") {
    return value;
  }
  return undefined;
}

function getColorValue(value: unknown): string | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }
  const fill = value as powerbi.Fill;
  const solid = (fill as { solid?: { color?: string } }).solid;
  const color = solid?.color;
  return typeof color === "string" ? color : undefined;
}

function normalizeWeekStartsOn(value?: number): number | undefined {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return undefined;
  }
  const rounded = Math.round(value);
  if (!Number.isFinite(rounded)) {
    return undefined;
  }
  const normalized = ((rounded % 7) + 7) % 7;
  return normalized;
}

function toFill(color?: string): powerbi.Fill | undefined {
  return color ? { solid: { color } } : undefined;
}

function parseVisualSettings(dataView?: DataView): VisualSettings {
  const objects = getObjects(dataView);
  const defaults = objects?.defaults as powerbi.DataViewObject | undefined;
  const limits = objects?.limits as powerbi.DataViewObject | undefined;
  const state = objects?.state as powerbi.DataViewObject | undefined;

  const pill = objects?.pill as powerbi.DataViewObject | undefined;
  const buttons = objects?.buttons as powerbi.DataViewObject | undefined;

  return {
    defaults: {
      presetId: (defaults?.defaultPreset as string | undefined) ?? undefined,
      weekStartsOn: getNumericValue(defaults?.weekStartsOn),
      locale: typeof defaults?.locale === "string" ? defaults.locale : undefined,
    },
    limits: {
      minDate: coerceDate(limits?.minDate),
      maxDate: coerceDate(limits?.maxDate),
    },
    pill: {
      style: (pill?.pillStyle as PillSettings["style"]) ?? undefined,
      showPresetLabels: getBooleanValue(pill?.showPresetLabels),
      backgroundColor: getColorValue(pill?.pillBackgroundColor),
      borderColor: getColorValue(pill?.pillBorderColor),
      textColor: getColorValue(pill?.pillTextColor),
      fontSize: getNumericValue(pill?.pillFontSize),
    },
    buttons: {
      showQuickApply: getBooleanValue(buttons?.showQuickApply),
      showClear: getBooleanValue(buttons?.showClear),
    },
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

type VisualUpdateOptionsWithFilters = VisualUpdateOptions & {
  filters?: models.IFilter[];
  filterState?: { filters?: models.IFilter[] };
};

function getAllFilters(options: VisualUpdateOptionsWithFilters): models.IFilter[] {
  const unique: models.IFilter[] = [];
  const seen = new Set<string>();

  function pushCollection(collection?: models.IFilter[]) {
    if (!collection) {
      return;
    }
    for (const filter of collection) {
      if (!filter) {
        continue;
      }
      const key = JSON.stringify(filter);
      if (key && seen.has(key)) {
        continue;
      }
      if (key) {
        seen.add(key);
      }
      unique.push(filter);
    }
  }

  pushCollection(options.jsonFilters as models.IFilter[] | undefined);
  pushCollection(options.filters);
  pushCollection(options.filterState?.filters);

  return unique;
}

function findExistingFilterRange(options: VisualUpdateOptions, target?: FilterTarget): DateRange | undefined {
  if (!target) {
    return undefined;
  }
  const withFilters = options as VisualUpdateOptionsWithFilters;
  const filters = getAllFilters(withFilters);
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
  if (!a && !b) {
    return true;
  }
  if (!a || !b) {
    return false;
  }
  return toISODate(a.from) === toISODate(b.from) && toISODate(a.to) === toISODate(b.to);
}

function toRangeKey(range: DateRange | undefined): string | undefined {
  if (!range) {
    return undefined;
  }
  return `${toISODate(range.from)}:${toISODate(range.to)}`;
}

export class PresetDateSlicerVisual implements powerbi.extensibility.visual.IVisual {
  private host: powerbi.extensibility.visual.IVisualHost;

  private rootElement: HTMLElement;

  private reactRoot: Root;

  private dataView?: DataView;

  private columnTarget?: FilterTarget;

  private currentRange?: DateRange;

  private currentPresetId?: string;

  private settings: VisualSettings = {
    defaults: {},
    limits: {},
    pill: {},
    buttons: {},
  };

  private lastRenderKey?: string;

  private lastAppliedFilterKey?: string;

  private lastPersistedPayload?: string;

  constructor(options?: VisualConstructorOptions) {
    if (!options) {
      throw new Error("Visual constructor options are required.");
    }

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
    this.settings = settings;
    const bounds = getDataBounds(this.dataView);
    const appliedRange = findExistingFilterRange(options, this.columnTarget);

    this.lastPersistedPayload = settings.persistedState?.raw ?? undefined;

    const persistedRange = settings.persistedState?.range;
    const persisted = (() => {
      if (!persistedRange?.from || !persistedRange?.to) {
        return undefined;
      }
      const from = coerceDate(persistedRange.from);
      const to = coerceDate(persistedRange.to);
      if (!from || !to) {
        return undefined;
      }
      return normalizeRange(from, to);
    })();

    const limitedMin = settings.limits.minDate ?? bounds.min;
    const limitedMax = settings.limits.maxDate ?? bounds.max;

    const initialRange = appliedRange ?? persisted;

    const defaultRange = initialRange
      ? ensureWithinRange(initialRange, limitedMin, limitedMax)
      : undefined;

    const defaultPresetId = appliedRange
      ? undefined
      : settings.persistedState?.presetId ?? settings.defaults.presetId ?? undefined;

    const rangeForComponent = defaultRange ?? initialRange;
    const appliedKey = toRangeKey(appliedRange);
    if (appliedRange) {
      this.lastAppliedFilterKey = appliedKey;
      if (!rangesEqual(this.currentRange, appliedRange)) {
        this.currentRange = appliedRange;
        this.currentPresetId = undefined;
      }
    } else {
      this.lastAppliedFilterKey = undefined;
    }

    const renderKey = JSON.stringify({
      width: options.viewport?.width ?? 0,
      height: options.viewport?.height ?? 0,
      range: rangeForComponent ? [rangeForComponent.from.getTime(), rangeForComponent.to.getTime()] : null,
      preset: defaultPresetId ?? null,
      bounds: [limitedMin?.getTime() ?? null, limitedMax?.getTime() ?? null],
      locale: settings.defaults.locale ?? null,
      weekStartsOn: normalizeWeekStartsOn(settings.defaults.weekStartsOn) ?? null,
      pill: {
        style: settings.pill.style ?? null,
        showPresetLabels: settings.pill.showPresetLabels ?? null,
        backgroundColor: settings.pill.backgroundColor ?? null,
        borderColor: settings.pill.borderColor ?? null,
        textColor: settings.pill.textColor ?? null,
        fontSize: settings.pill.fontSize ?? null,
      },
      buttons: {
        showQuickApply: settings.buttons.showQuickApply ?? null,
        showClear: settings.buttons.showClear ?? null,
      },
    });

    const isResizeOnly = (options.type & powerbi.VisualUpdateType.Resize) === options.type;
    if (!isResizeOnly && this.lastRenderKey === renderKey) {
      return;
    }
    this.lastRenderKey = renderKey;

    const handleChange = (range: DateRange, presetId: string) => {
      if (rangesEqual(this.currentRange, range) && this.currentPresetId === presetId) {
        return;
      }
      this.currentRange = range;
      this.currentPresetId = presetId;
      this.applyRangeFilter(range);
      this.persistState(range, presetId);
    };

    const weekStartsOn = normalizeWeekStartsOn(settings.defaults.weekStartsOn) ?? 1;
    const locale = settings.defaults.locale?.trim() ? settings.defaults.locale : undefined;
    const showPresetLabels = settings.pill.showPresetLabels ?? true;
    const showClear = settings.buttons.showClear ?? true;
    const pillFontSize =
      typeof settings.pill.fontSize === "number" && settings.pill.fontSize > 0
        ? settings.pill.fontSize
        : undefined;

    this.reactRoot.render(
      <DateRangeFilter
        presets={PRESETS}
        dataMin={limitedMin}
        dataMax={limitedMax}
        defaultPresetId={defaultPresetId}
        defaultRange={defaultRange}
        localeOverride={locale}
        weekStartsOn={weekStartsOn}
        pillStyle={settings.pill.style}
        pillColors={{
          background: settings.pill.backgroundColor,
          border: settings.pill.borderColor,
          text: settings.pill.textColor,
        }}
        pillFontSize={pillFontSize}
        showPresetLabels={showPresetLabels}
        showQuickApply={settings.buttons.showQuickApply ?? false}
        showClear={showClear}
        onChange={handleChange}
      />,
    );

    const shouldApplyDefault =
      !appliedRange && defaultRange && !rangesEqual(this.currentRange, defaultRange);
    if (!isResizeOnly && shouldApplyDefault) {
      this.currentRange = defaultRange;
      this.currentPresetId = defaultPresetId;
      this.applyRangeFilter(defaultRange);
    }
  }

  public enumerateObjectInstances(options: powerbi.EnumerateVisualObjectInstancesOptions): VisualObjectInstance[] {
    const selector = undefined as unknown as powerbi.data.Selector;
    switch (options.objectName) {
      case "defaults":
        return [
          {
            objectName: "defaults",
            properties: {
              defaultPreset: this.currentPresetId ?? this.settings.defaults.presetId ?? "last7",
              weekStartsOn: normalizeWeekStartsOn(this.settings.defaults.weekStartsOn) ?? 1,
              locale: this.settings.defaults.locale ?? "",
            },
            selector,
          },
        ];
      case "limits":
        return [
          {
            objectName: "limits",
            properties: {
              minDate: this.settings.limits.minDate ? toISODate(this.settings.limits.minDate) : "",
              maxDate: this.settings.limits.maxDate ? toISODate(this.settings.limits.maxDate) : "",
            },
            selector,
          },
        ];
      case "pill": {
        const properties: powerbi.DataViewObject = {
          pillStyle: this.settings.pill.style ?? "compact",
          showPresetLabels: this.settings.pill.showPresetLabels ?? true,
          pillFontSize: this.settings.pill.fontSize ?? 12,
        };
        const background = toFill(this.settings.pill.backgroundColor);
        if (background) {
          properties.pillBackgroundColor = background;
        }
        const border = toFill(this.settings.pill.borderColor);
        if (border) {
          properties.pillBorderColor = border;
        }
        const text = toFill(this.settings.pill.textColor);
        if (text) {
          properties.pillTextColor = text;
        }
        return [
          {
            objectName: "pill",
            properties,
            selector,
          },
        ];
      }
      case "buttons":
        return [
          {
            objectName: "buttons",
            properties: {
              showQuickApply: this.settings.buttons.showQuickApply ?? false,
              showClear: this.settings.buttons.showClear ?? true,
            },
            selector,
          },
        ];
      default:
        return [];
    }
  }

  public destroy(): void {
    this.reactRoot.unmount();
    this.rootElement.remove();
  }

  private applyRangeFilter(range: DateRange): void {
    if (!this.columnTarget) {
      return;
    }
    const key = toRangeKey(range);
    if (this.lastAppliedFilterKey && key && this.lastAppliedFilterKey === key) {
      return;
    }
    if (key) {
      this.lastAppliedFilterKey = key;
    }

    const filter = new models.AdvancedFilter(this.columnTarget, "And", [
      { operator: "GreaterThanOrEqual", value: toISODate(range.from) },
      { operator: "LessThanOrEqual", value: toISODate(range.to) },
    ]);

    this.host.applyJsonFilter(filter, "defaults", "filter", powerbi.FilterAction.merge);
  }

  private persistState(range: DateRange, presetId: string): void {
    const payload = toPersistedPayload(range, presetId);
    if (this.lastPersistedPayload === payload) {
      return;
    }
    this.lastPersistedPayload = payload;
    this.host.persistProperties({
      merge: [
        {
          objectName: "state",
          selector: undefined as unknown as powerbi.data.Selector,
          properties: {
            payload,
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
    this.settings.persistedState = {
      range: { from: toISODate(range.from), to: toISODate(range.to) },
      presetId,
      raw: payload,
    };
    this.settings.defaults.presetId = presetId;
  }
}

export default PresetDateSlicerVisual;
