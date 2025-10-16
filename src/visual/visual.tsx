import powerbi from "powerbi-visuals-api";
import * as models from "powerbi-models";
import React from "react";
import { createRoot, Root } from "react-dom/client";
import { FormattingSettingsService } from "powerbi-visuals-utils-formattingmodel";
import { createTooltipServiceWrapper, ITooltipServiceWrapper } from "powerbi-visuals-utils-tooltiputils";
import { select } from "d3-selection";
import { DateRangeFilter } from "../components/DateRangeFilter";
import { LandingPage } from "../components/LandingPage";
import { DatePreset, PRESETS, ensureWithinRange, formatRange, fromISODate, normalizeRange, toISODate } from "../date";
import { DateRangeDialog } from "../dialogs/DateRangeDialog";
import { DateRangeDialogInitialState, DateRangeDialogResult } from "../dialogs/types";
import { DateRange } from "../types/dateRange";
import { VisualStrings } from "../types/localization";
import { getVisualStrings } from "../utils/localization";
import {
  PresetDateSlicerFormattingSettingsModel,
  PRESET_ITEMS as FORMAT_PRESET_ITEMS,
  PILL_STYLE_ITEMS as FORMAT_PILL_STYLE_ITEMS,
  WEEK_START_ITEMS as FORMAT_WEEK_START_ITEMS,
  LOCALE_ITEMS as FORMAT_LOCALE_ITEMS,
} from "./formattingSettings";
import { extentFromValues, parseTargetFromQueryName, toDateOnlyIso } from "../utils/filters";
import { mergeBounds } from "../utils/bounds";
import { getContrastingTextColor, lighten, toRgbaString } from "../utils/colors";

import DialogAction = powerbi.DialogAction;
import DialogOpenOptions = powerbi.extensibility.visual.DialogOpenOptions;

type VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
type VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
type DataView = powerbi.DataView;
type DataViewObjects = powerbi.DataViewObjects;
type DataViewCategoryColumn = powerbi.DataViewCategoryColumn;

type PersistedBounds = {
  min?: string;
  max?: string;
};

type PersistedState = {
  range?: { from: string; to: string };
  presetId?: string;
  defaultPreset?: string;
  bounds?: PersistedBounds;
  raw?: string;
};

type DefaultsSettings = {
  presetId?: string;
  defaultPreset?: string;
  weekStartsOn?: number;
  locale?: string;
};

type PillSettings = {
  style?: "compact" | "expanded";
  showPresetLabels?: boolean;
  backgroundColor?: string;
  borderColor?: string;
  textColor?: string;
  fontSize?: number;
  minWidth?: number;
};

type ButtonSettings = {
  showQuickApply?: boolean;
  showClear?: boolean;
};

type VisualSettings = {
  defaults: DefaultsSettings;
  pill: PillSettings;
  buttons: ButtonSettings;
  persistedState?: PersistedState;
};

type FilterTarget = models.IFilterColumnTarget;

type ThemeInfo = {
  accent: string;
  accentText: string;
  accentWeak: string;
  border: string;
  surface: string;
  text: string;
  textMuted: string;
  pillBackground: string;
  pillBorder: string;
  pillText: string;
};

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
    const bounds = parsed.bounds;
    const normalizedBounds =
      bounds && typeof bounds === "object"
        ? {
            min: typeof bounds.min === "string" ? bounds.min : undefined,
            max: typeof bounds.max === "string" ? bounds.max : undefined,
          }
        : undefined;
    const presetId = typeof parsed.presetId === "string" ? parsed.presetId : undefined;
    const legacyPreset =
      typeof parsed.defaultPreset === "string" ? parsed.defaultPreset : undefined;
    const normalizedPresetId = presetId ?? legacyPreset;
    return {
      ...parsed,
      presetId: normalizedPresetId,
      defaultPreset: legacyPreset ?? presetId,
      bounds: normalizedBounds,
      raw: value,
    };
  } catch (error) {
    console.warn("Failed to parse persisted state", error);
    return undefined;
  }
}

function getObjects(dataView?: DataView): DataViewObjects | undefined {
  return dataView?.metadata?.objects ?? undefined;
}

function hasDateRole(column?: powerbi.DataViewMetadataColumn): boolean {
  if (!column?.roles) {
    return false;
  }
  const roles = column.roles as Record<string, boolean | undefined>;
  return roles.date === true || roles.dateInput === true;
}

function findDateCategoryColumn(dataView?: DataView): DataViewCategoryColumn | undefined {
  const categories = dataView?.categorical?.categories;
  if (!categories) {
    return undefined;
  }
  for (const category of categories) {
    if (category?.source && hasDateRole(category.source)) {
      return category;
    }
  }
  return undefined;
}

function getNumericValue(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string") {
    const parsed = Number(value.trim());
    if (Number.isFinite(parsed)) {
      return parsed;
    }
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

function normalizeWeekStartsOn(value?: number | string): number | undefined {
  const numeric = typeof value === "string" ? getNumericValue(value) : value;
  if (typeof numeric !== "number" || Number.isNaN(numeric)) {
    return undefined;
  }
  const rounded = Math.round(numeric);
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
  const state = objects?.state as powerbi.DataViewObject | undefined;

  const pill = objects?.pill as powerbi.DataViewObject | undefined;
  const buttons = objects?.buttons as powerbi.DataViewObject | undefined;

  const presetId =
    typeof defaults?.presetId === "string" ? defaults.presetId : undefined;
  const defaultPreset =
    typeof defaults?.defaultPreset === "string" ? defaults.defaultPreset : undefined;
  const normalizedPreset = presetId ?? defaultPreset;

  return {
    defaults: {
      presetId: normalizedPreset ?? undefined,
      defaultPreset: defaultPreset ?? presetId,
      weekStartsOn: getNumericValue(defaults?.weekStartsOn),
      locale: typeof defaults?.locale === "string" ? defaults.locale : undefined,
    },
    pill: {
      style: (pill?.pillStyle as PillSettings["style"]) ?? undefined,
      showPresetLabels: getBooleanValue(pill?.showPresetLabels),
      backgroundColor: getColorValue(pill?.pillBackgroundColor),
      borderColor: getColorValue(pill?.pillBorderColor),
      textColor: getColorValue(pill?.pillTextColor),
      fontSize: getNumericValue(pill?.pillFontSize),
      minWidth: getNumericValue(pill?.pillMinWidth),
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
  if (categories && categories.length > 0) {
    const prioritized = findDateCategoryColumn(dataView);
    const ordered = prioritized
      ? [prioritized, ...categories.filter((category) => category !== prioritized)]
      : categories;
    for (const category of ordered) {
      const candidate = parseTargetFromQueryName(category?.source?.queryName);
      if (candidate) {
        return candidate;
      }
    }
  }

  const columns = dataView?.metadata?.columns;
  if (columns) {
    for (const column of columns) {
      if (!hasDateRole(column)) {
        continue;
      }
      const target = parseTargetFromQueryName(column.queryName);
      if (target) {
        return target;
      }
    }
  }

  return undefined;
}

function filterTargetsEqual(a?: FilterTarget, b?: FilterTarget): boolean {
  if (!a && !b) {
    return true;
  }
  if (!a || !b) {
    return false;
  }
  return a.table === b.table && a.column === b.column;
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

function findDateColumnMetadata(dataView?: DataView): powerbi.DataViewMetadataColumn | undefined {
  const dateCategory = findDateCategoryColumn(dataView);
  if (dateCategory?.source) {
    return dateCategory.source;
  }

  const columns = dataView?.metadata?.columns;
  if (!columns) {
    return undefined;
  }
  for (const column of columns) {
    if (hasDateRole(column)) {
      return column;
    }
  }
  return undefined;
}

function columnMetadataMatches(
  candidate?: powerbi.DataViewMetadataColumn,
  target?: powerbi.DataViewMetadataColumn,
): boolean {
  if (!candidate || !target) {
    return false;
  }
  if (candidate.index != null && target.index != null && candidate.index === target.index) {
    return true;
  }
  if (candidate.queryName && target.queryName && candidate.queryName === target.queryName) {
    return true;
  }
  return candidate.displayName === target.displayName;
}

function getDataBounds(dataView?: DataView): { min?: Date; max?: Date } {
  const dateColumn = findDateColumnMetadata(dataView);
  const dateCategory = findDateCategoryColumn(dataView);
  let min: Date | undefined;
  let max: Date | undefined;

  const collect = (value: unknown) => {
    const date = coerceDate(value);
    if (!date) {
      return;
    }
    if (!min || date < min) {
      min = date;
    }
    if (!max || date > max) {
      max = date;
    }
  };

  const categories = dataView?.categorical?.categories;
  if (categories) {
    for (const category of categories) {
      if (!category) {
        continue;
      }
      if (dateColumn && !columnMetadataMatches(category.source, dateColumn)) {
        continue;
      }
      if (!dateColumn && dateCategory && category !== dateCategory) {
        continue;
      }
      const values = category.values;
      if (!values) {
        continue;
      }
      const extent = extentFromValues(values as unknown[]);
      if (extent.min) {
        collect(extent.min);
      }
      if (extent.max) {
        collect(extent.max);
      }
    }
  }

  const table = dataView?.table;
  if (table?.columns && table.rows) {
    const index = table.columns.findIndex((column) => columnMetadataMatches(column, dateColumn));
    if (index >= 0) {
      const values = table.rows.map((row) => row[index]);
      const extent = extentFromValues(values);
      if (extent.min) {
        collect(extent.min);
      }
      if (extent.max) {
        collect(extent.max);
      }
    }
  }

  if (!min && !max) {
    const fallbackValues = (dateCategory?.values ?? categories?.[0]?.values) as unknown[] | undefined;
    if (fallbackValues) {
      const extent = extentFromValues(fallbackValues as unknown[]);
      if (extent.min) {
        collect(extent.min);
      }
      if (extent.max) {
        collect(extent.max);
      }
    }
  }

  return { min, max };
}

function toPersistedPayload(
  range: DateRange,
  presetId: string,
  bounds?: { min?: Date; max?: Date },
): string {
  const payload: {
    range: { from: string; to: string };
    presetId: string;
    defaultPreset: string;
    bounds?: PersistedBounds;
  } = {
    range: { from: toISODate(range.from), to: toISODate(range.to) },
    presetId,
    defaultPreset: presetId,
  };
  if (bounds?.min || bounds?.max) {
    payload.bounds = {
      min: bounds.min ? toISODate(bounds.min) : undefined,
      max: bounds.max ? toISODate(bounds.max) : undefined,
    };
  }
  return JSON.stringify(payload);
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

function getEffectivePresetId(defaults?: DefaultsSettings): string | undefined {
  if (!defaults) {
    return undefined;
  }
  if (typeof defaults.presetId === "string" && defaults.presetId) {
    return defaults.presetId;
  }
  if (typeof defaults.defaultPreset === "string" && defaults.defaultPreset) {
    return defaults.defaultPreset;
  }
  return undefined;
}

export class PresetDateSlicerVisual implements powerbi.extensibility.visual.IVisual {
  private host: powerbi.extensibility.visual.IVisualHost;

  private rootElement: HTMLElement;

  private reactRoot: Root;

  private selectionManager: powerbi.extensibility.ISelectionManager;

  private tooltipServiceWrapper: ITooltipServiceWrapper;

  private events?: powerbi.extensibility.IVisualEventService;

  private dataView?: DataView;

  private columnTarget?: FilterTarget;

  private currentRange?: DateRange;

  private currentPresetId?: string;

  private dataBounds: { min?: Date; max?: Date } = {};

  private settings: VisualSettings = {
    defaults: {},
    pill: {},
    buttons: {},
  };

  private formattingSettingsService: FormattingSettingsService;

  private formattingSettings: PresetDateSlicerFormattingSettingsModel =
    new PresetDateSlicerFormattingSettingsModel();

  private lastRenderKey?: string;

  private lastAppliedFilterKey?: string;

  private lastPersistedPayload?: string;

  private persistedRangeSnapshot?: { from?: string; to?: string; presetId?: string };

  private allowInteractions = true;

  private strings: VisualStrings;

  private isHighContrast = false;

  private localizationManager: powerbi.extensibility.ILocalizationManager;

  private blankSelectionId: powerbi.extensibility.ISelectionId;

  private lastTheme?: ThemeInfo;

  constructor(options?: VisualConstructorOptions) {
    if (!options) {
      throw new Error("Visual constructor options are required.");
    }

    this.host = options.host;
    this.selectionManager = this.host.createSelectionManager();
    this.selectionManager.registerOnSelectCallback(this.handleBookmarkRestore);
    this.blankSelectionId = this.host.createSelectionIdBuilder().createSelectionId();
    this.localizationManager = this.host.createLocalizationManager();
    this.tooltipServiceWrapper = createTooltipServiceWrapper(this.host.tooltipService, options.element);
    this.events = this.host.eventService;
    this.allowInteractions = this.host.hostCapabilities?.allowInteractions ?? true;
    this.strings = getVisualStrings(this.localizationManager);
    this.formattingSettingsService = new FormattingSettingsService(this.localizationManager);

    this.rootElement = document.createElement("div");
    this.rootElement.className = "preset-date-slicer";
    options.element.appendChild(this.rootElement);
    this.rootElement.addEventListener("contextmenu", this.handleContextMenu);
    this.reactRoot = createRoot(this.rootElement);
  }

  public update(options: VisualUpdateOptions): void {
    this.events?.renderingStarted(options);
    try {
      this.renderCore(options);
    } finally {
      this.events?.renderingFinished(options);
    }
  }

  public getFormattingModel(): powerbi.visuals.FormattingModel {
    return this.formattingSettingsService.buildFormattingModel(this.formattingSettings);
  }

  public destroy(): void {
    this.reactRoot.unmount();
    this.tooltipServiceWrapper.hide();
    this.rootElement.removeEventListener("contextmenu", this.handleContextMenu);
    this.rootElement.remove();
  }

  private handleContextMenu = (event: MouseEvent) => {
    event.preventDefault();
    const position = { x: event.clientX, y: event.clientY };
    this.selectionManager.showContextMenu(this.blankSelectionId, position);
  };

  private canUseHostDialog(): boolean {
    return !!this.host.hostCapabilities?.allowModalDialog;
  }

  private openDateDialog = async (
    initialState: DateRangeDialogInitialState,
  ): Promise<{ actionId: DialogAction; resultState?: DateRangeDialogResult } | undefined> => {
    if (!this.canUseHostDialog()) {
      return undefined;
    }
    const options: DialogOpenOptions = {
      title: this.strings.dialog.title,
      actionButtons: [DialogAction.Close],
      size: { width: 760, height: 520 },
    };
    try {
      const result = await this.toPromise(
        this.host.openModalDialog(DateRangeDialog.id, options, initialState),
      );
      return result as { actionId: DialogAction; resultState?: DateRangeDialogResult };
    } catch (error) {
      console.warn("Failed to open date range dialog", error);
      return undefined;
    }
  };

  private toPromise<T>(ipromise: powerbi.IPromise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      ipromise.then(
        (value) => {
          resolve(value);
          return value;
        },
        (error) => {
          reject(error);
          return error as unknown as T;
        },
      );
    });
  }

  private resetDataBounds(): void {
    this.dataBounds = {};
  }

  private seedBoundsFromPersisted(bounds?: PersistedBounds): void {
    if (!bounds) {
      return;
    }
    const parsed: { min?: Date; max?: Date } = {};
    if (bounds.min) {
      const min = coerceDate(bounds.min);
      if (min) {
        parsed.min = min;
      }
    }
    if (bounds.max) {
      const max = coerceDate(bounds.max);
      if (max) {
        parsed.max = max;
      }
    }
    this.dataBounds = mergeBounds(this.dataBounds, parsed);
  }

  private expandBoundsWithData(bounds: { min?: Date; max?: Date }): { min?: Date; max?: Date } {
    this.dataBounds = mergeBounds(this.dataBounds, bounds);
    const { min, max } = this.dataBounds;
    return {
      min: min ? new Date(min.getTime()) : undefined,
      max: max ? new Date(max.getTime()) : undefined,
    };
  }

  private getPersistableBounds(): PersistedBounds | undefined {
    const { min, max } = this.dataBounds;
    if (!min && !max) {
      return undefined;
    }
    return {
      min: min ? toISODate(min) : undefined,
      max: max ? toISODate(max) : undefined,
    };
  }

  private applyTheme(settings: VisualSettings): ThemeInfo {
    const palette = this.host.colorPalette;
    const isHighContrast = !!palette?.isHighContrast;
    this.isHighContrast = isHighContrast;

    if (isHighContrast) {
      const background = palette?.background?.value ?? "#000000";
      const foreground = palette?.foreground?.value ?? "#ffffff";
      const border = palette?.foregroundNeutralDark?.value ?? foreground;
      const accent = palette?.hyperlink?.value ?? foreground;
      const accentText = getContrastingTextColor(accent, foreground);
      const accentWeak = toRgbaString(accent, 0.3);
      const textMuted = palette?.foregroundNeutralSecondary?.value ?? foreground;
      const pillBackground = settings.pill.backgroundColor ?? background;
      const pillBorder = settings.pill.borderColor ?? border;
      const pillText = settings.pill.textColor ?? foreground;

      this.rootElement.style.setProperty("--visual-accent", accent);
      this.rootElement.style.setProperty("--visual-accent-text", accentText);
      this.rootElement.style.setProperty("--visual-accent-weak", accentWeak);
      this.rootElement.style.setProperty("--visual-border", pillBorder);
      this.rootElement.style.setProperty("--visual-text", pillText);
      this.rootElement.style.setProperty("--visual-text-muted", textMuted);
      this.rootElement.style.setProperty("--visual-surface", background);
      this.rootElement.style.setProperty("--visual-pill-background", pillBackground);
      this.rootElement.style.setProperty("--visual-pill-border", pillBorder);
      this.rootElement.style.setProperty("--visual-pill-text", pillText);

      const theme: ThemeInfo = {
        accent,
        accentText,
        accentWeak,
        border: pillBorder,
        surface: background,
        text: pillText,
        textMuted,
        pillBackground,
        pillBorder,
        pillText,
      };
      this.lastTheme = theme;
      return theme;
    }

    const hostBackground = palette?.background?.value;
    const hostBorder = palette?.foregroundNeutralLight?.value;
    const hostText = palette?.foreground?.value;
    const defaultBackground =
      palette?.getColor("presetDateSlicer_background")?.value ?? hostBackground ?? "#ffffff";
    const defaultBorder =
      palette?.getColor("presetDateSlicer_border")?.value ?? hostBorder ?? "#d1d5db";
    const defaultText = palette?.getColor("presetDateSlicer_text")?.value ?? hostText ?? "#111827";
    const accent = palette?.getColor("presetDateSlicer_accent")?.value ?? "#2563eb";

    const pillBackground = settings.pill.backgroundColor ?? defaultBackground;
    const pillBorder = settings.pill.borderColor ?? defaultBorder;
    const pillText = settings.pill.textColor ?? defaultText;
    const accentText = getContrastingTextColor(accent);
    const accentWeak = toRgbaString(accent, 0.15);
    const text = pillText;
    const textMuted = lighten(text, 0.4);
    const surface = lighten(pillBackground, 0.08);

    this.rootElement.style.setProperty("--visual-accent", accent);
    this.rootElement.style.setProperty("--visual-accent-text", accentText);
    this.rootElement.style.setProperty("--visual-accent-weak", accentWeak);
    this.rootElement.style.setProperty("--visual-border", pillBorder);
    this.rootElement.style.setProperty("--visual-text", text);
    this.rootElement.style.setProperty("--visual-text-muted", textMuted);
    this.rootElement.style.setProperty("--visual-surface", surface);
    this.rootElement.style.setProperty("--visual-pill-background", pillBackground);
    this.rootElement.style.setProperty("--visual-pill-border", pillBorder);
    this.rootElement.style.setProperty("--visual-pill-text", pillText);

    const theme: ThemeInfo = {
      accent,
      accentText,
      accentWeak,
      border: pillBorder,
      surface,
      text,
      textMuted,
      pillBackground,
      pillBorder,
      pillText,
    };
    this.lastTheme = theme;
    return theme;
  }

  private getLocalizedPresets(): DatePreset[] {
    return PRESETS.map((preset) => {
      const key = preset.id as keyof VisualStrings["presetLabels"];
      const label = this.strings.presetLabels[key] ?? preset.label;
      return { ...preset, label };
    });
  }

  private renderLandingPage(theme: ThemeInfo, options: VisualUpdateOptions): void {
    const landingKey = JSON.stringify({
      landing: true,
      width: options.viewport?.width ?? 0,
      height: options.viewport?.height ?? 0,
      accent: theme.accent,
      text: theme.text,
      highContrast: this.isHighContrast,
    });
    if (this.lastRenderKey === landingKey) {
      return;
    }
    this.lastRenderKey = landingKey;
    this.currentRange = undefined;
    this.currentPresetId = undefined;
    this.lastAppliedFilterKey = undefined;
    this.tooltipServiceWrapper.hide();
    this.reactRoot.render(
      <LandingPage
        strings={this.strings.landing}
        theme={{ background: theme.surface, text: theme.text, accent: theme.accent, border: theme.border }}
        isHighContrast={this.isHighContrast}
      />,
    );
  }

  private applyRangeFilter(range: DateRange): void {
    if (!this.columnTarget) {
      this.syncSelectionForRange(undefined);
      return;
    }
    const constrained = ensureWithinRange(range, this.dataBounds.min, this.dataBounds.max);
    this.syncSelectionForRange(constrained);
    const key = toRangeKey(constrained);
    if (this.lastAppliedFilterKey && key && this.lastAppliedFilterKey === key) {
      return;
    }
    if (key) {
      this.lastAppliedFilterKey = key;
    }

    const filter = new models.AdvancedFilter(this.columnTarget, "And", [
      { operator: "GreaterThanOrEqual", value: toDateOnlyIso(constrained.from) },
      { operator: "LessThanOrEqual", value: toDateOnlyIso(constrained.to) },
    ]);

    this.host.applyJsonFilter(filter.toJSON(), "general", "filter", powerbi.FilterAction.merge);
  }

  private persistState(range: DateRange, presetId: string): void {
    const normalizedFrom = toDateOnlyIso(range.from);
    const normalizedTo = toDateOnlyIso(range.to);
    const previous = this.persistedRangeSnapshot;
    if (
      previous?.from === normalizedFrom &&
      previous?.to === normalizedTo &&
      previous?.presetId === presetId
    ) {
      return;
    }
    this.persistedRangeSnapshot = { from: normalizedFrom, to: normalizedTo, presetId };

    const payload = toPersistedPayload(range, presetId, this.dataBounds);
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
    const bounds = this.getPersistableBounds();
    this.settings.persistedState = {
      range: { from: normalizedFrom, to: normalizedTo },
      presetId,
      defaultPreset: presetId,
      bounds,
      raw: payload,
    };
    this.settings.defaults.presetId = presetId;
    this.settings.defaults.defaultPreset = presetId;
  }

  private buildSelectionIdsForRange(range: DateRange): powerbi.extensibility.ISelectionId[] {
    const category = findDateCategoryColumn(this.dataView);
    if (!category?.values || !Array.isArray(category.values)) {
      return [];
    }
    const fromIso = toISODate(range.from);
    const toIso = toISODate(range.to);
    const selectionIds: powerbi.extensibility.ISelectionId[] = [];
    const seen = new Set<string>();
    category.values.forEach((value, index) => {
      const date = coerceDate(value);
      if (!date) {
        return;
      }
      const iso = toISODate(date);
      if (iso < fromIso || iso > toIso) {
        return;
      }
      const key = `${iso}:${index}`;
      if (seen.has(key)) {
        return;
      }
      seen.add(key);
      const selectionId = this.host.createSelectionIdBuilder().withCategory(category, index).createSelectionId();
      selectionIds.push(selectionId);
    });
    return selectionIds;
  }

  private syncSelectionForRange(range: DateRange | undefined): void {
    if (!range) {
      void this.selectionManager.clear();
      return;
    }
    const selectionIds = this.buildSelectionIdsForRange(range);
    if (selectionIds.length === 0) {
      void this.selectionManager.clear();
      return;
    }
    void this.selectionManager.select(selectionIds, false);
  }

  private syncFormattingSettings(settings: VisualSettings): void {
    const defaultsCard = this.formattingSettings.defaults;
    const effectivePresetId = getEffectivePresetId(settings.defaults);
    const presetItem = effectivePresetId
      ? FORMAT_PRESET_ITEMS.find((item) => item.value === effectivePresetId)
      : undefined;
    if (presetItem) {
      defaultsCard.defaultPreset.value = presetItem;
    }
    const normalizedWeekStartsOn = normalizeWeekStartsOn(settings.defaults.weekStartsOn);
    const weekStartItem = typeof normalizedWeekStartsOn === "number"
      ? FORMAT_WEEK_START_ITEMS.find((item) => item.value === normalizedWeekStartsOn.toString())
      : undefined;
    if (weekStartItem) {
      defaultsCard.weekStartsOn.value = weekStartItem;
    }
    const localeItem = settings.defaults.locale
      ? FORMAT_LOCALE_ITEMS.find((item) => item.value === settings.defaults.locale)
      : undefined;
    if (localeItem) {
      defaultsCard.locale.value = localeItem;
    }

    const pillCard = this.formattingSettings.pill;
    const pillStyleItem = settings.pill.style
      ? FORMAT_PILL_STYLE_ITEMS.find((item) => item.value === settings.pill.style)
      : undefined;
    if (pillStyleItem) {
      pillCard.pillStyle.value = pillStyleItem;
    }
    pillCard.showPresetLabels.value = settings.pill.showPresetLabels ?? true;
    pillCard.pillBackgroundColor.value = settings.pill.backgroundColor
      ? { value: settings.pill.backgroundColor }
      : { value: pillCard.pillBackgroundColor.value?.value ?? "" };
    pillCard.pillBorderColor.value = settings.pill.borderColor
      ? { value: settings.pill.borderColor }
      : { value: pillCard.pillBorderColor.value?.value ?? "" };
    pillCard.pillTextColor.value = settings.pill.textColor
      ? { value: settings.pill.textColor }
      : { value: pillCard.pillTextColor.value?.value ?? "" };
    if (typeof settings.pill.fontSize === "number" && Number.isFinite(settings.pill.fontSize)) {
      pillCard.pillFontSize.value = settings.pill.fontSize;
    }
    if (typeof settings.pill.minWidth === "number" && Number.isFinite(settings.pill.minWidth)) {
      pillCard.pillMinWidth.value = settings.pill.minWidth;
    }

    const buttonsCard = this.formattingSettings.buttons;
    buttonsCard.showQuickApply.value = settings.buttons.showQuickApply ?? false;
    buttonsCard.showClear.value = settings.buttons.showClear ?? true;
  }

  private renderCore(options: VisualUpdateOptions): void {
    this.dataView = options.dataViews?.[0];
    this.localizationManager = this.host.createLocalizationManager();
    this.strings = getVisualStrings(this.localizationManager);
    this.allowInteractions = this.host.hostCapabilities?.allowInteractions ?? true;

    this.formattingSettings = this.dataView
      ? this.formattingSettingsService.populateFormattingSettingsModel(
          PresetDateSlicerFormattingSettingsModel,
          this.dataView,
        )
      : new PresetDateSlicerFormattingSettingsModel();
    const nextTarget = findColumnTarget(this.dataView);
    const metadataChanged = (options.type & powerbi.VisualUpdateType.All) !== 0;
    if (metadataChanged || !filterTargetsEqual(nextTarget, this.columnTarget)) {
      this.resetDataBounds();
    }
    this.columnTarget = nextTarget;
    const settings = parseVisualSettings(this.dataView);
    const normalizedDefaultPreset = getEffectivePresetId(settings.defaults);
    if (normalizedDefaultPreset) {
      settings.defaults.presetId = normalizedDefaultPreset;
      settings.defaults.defaultPreset = normalizedDefaultPreset;
    }
    this.settings = settings;
    this.persistedRangeSnapshot = {
      from: settings.persistedState?.range?.from,
      to: settings.persistedState?.range?.to,
      presetId:
        settings.persistedState?.presetId ??
        settings.persistedState?.defaultPreset ??
        normalizedDefaultPreset,
    };
    this.seedBoundsFromPersisted(settings.persistedState?.bounds);
    this.syncFormattingSettings(settings);

    const theme = this.applyTheme(settings);
    const localizedPresets = this.getLocalizedPresets();

    const bounds = getDataBounds(this.dataView);
    const trackedBounds = this.expandBoundsWithData(bounds);

    const categories = this.dataView?.categorical?.categories;
    const hasCategoryValues = !!categories?.some(
      (category) => Array.isArray(category?.values) && category.values.length > 0,
    );
    const hasTableValues = !!this.dataView?.table?.rows?.length;
    const hasData = !!this.columnTarget && (hasCategoryValues || hasTableValues);

    this.lastPersistedPayload = settings.persistedState?.raw ?? undefined;

    if (!hasData) {
      this.syncSelectionForRange(undefined);
      this.renderLandingPage(theme, options);
      return;
    }

    const appliedRange = findExistingFilterRange(options, this.columnTarget);

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

    const limitedMin = trackedBounds.min;
    const limitedMax = trackedBounds.max;

    const initialRange = appliedRange ?? persisted;

    const defaultRange = initialRange
      ? ensureWithinRange(initialRange, limitedMin, limitedMax)
      : undefined;

    const persistedPresetId =
      settings.persistedState?.presetId ?? settings.persistedState?.defaultPreset;
    const defaultPresetId = appliedRange
      ? undefined
      : persistedPresetId ?? getEffectivePresetId(settings.defaults) ?? undefined;

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

    const localeOverrideSetting = settings.defaults.locale?.trim();
    const hostLocale = (this.host as unknown as { locale?: string }).locale;
    const localeOverride = localeOverrideSetting || hostLocale || undefined;
    const presetLabelsSignature = localizedPresets.map((preset) => preset.label).join("|");
    const stringsSignature = `${this.strings.popover.heading}|${this.strings.popover.apply}|${this.strings.tooltip.label}|${this.strings.landing.title}`;
    const themeSignature = [
      theme.pillBackground,
      theme.pillBorder,
      theme.pillText,
      theme.accent,
      theme.accentWeak,
      theme.surface,
      theme.text,
      theme.textMuted,
    ].join(":");

    const renderKey = JSON.stringify({
      width: options.viewport?.width ?? 0,
      height: options.viewport?.height ?? 0,
      range: rangeForComponent ? [rangeForComponent.from.getTime(), rangeForComponent.to.getTime()] : null,
      preset: defaultPresetId ?? null,
      bounds: [limitedMin?.getTime() ?? null, limitedMax?.getTime() ?? null],
      locale: localeOverride ?? null,
      weekStartsOn: normalizeWeekStartsOn(settings.defaults.weekStartsOn) ?? null,
      pill: {
        style: settings.pill.style ?? null,
        showPresetLabels: settings.pill.showPresetLabels ?? null,
        backgroundColor: settings.pill.backgroundColor ?? null,
        borderColor: settings.pill.borderColor ?? null,
        textColor: settings.pill.textColor ?? null,
        fontSize: settings.pill.fontSize ?? null,
        minWidth: settings.pill.minWidth ?? null,
      },
      buttons: {
        showQuickApply: settings.buttons.showQuickApply ?? null,
        showClear: settings.buttons.showClear ?? null,
      },
      allowInteractions: this.allowInteractions,
      highContrast: this.isHighContrast,
      theme: themeSignature,
      strings: stringsSignature,
      presets: presetLabelsSignature,
    });

    const isResizeOnly = (options.type & powerbi.VisualUpdateType.Resize) === options.type;
    if (!isResizeOnly && this.lastRenderKey === renderKey) {
      return;
    }
    this.lastRenderKey = renderKey;

    const handleChange = (range: DateRange, presetId: string, info?: { reason: "initial" | "user" }) => {
      if (!this.allowInteractions && info?.reason === "user") {
        return;
      }
      const effectiveRange = ensureWithinRange(range, this.dataBounds.min, this.dataBounds.max);
      const isSameSelection = rangesEqual(this.currentRange, effectiveRange) && this.currentPresetId === presetId;
      this.currentRange = effectiveRange;
      this.currentPresetId = presetId;
      if (!isSameSelection || info?.reason === "initial") {
        this.applyRangeFilter(effectiveRange);
      }
      if (!isSameSelection || info?.reason === "initial") {
        this.persistState(effectiveRange, presetId);
      }
    };

    const weekStartsOn = normalizeWeekStartsOn(settings.defaults.weekStartsOn) ?? 1;
    const showPresetLabels = settings.pill.showPresetLabels ?? true;
    const showClear = settings.buttons.showClear ?? true;
    const pillFontSize =
      typeof settings.pill.fontSize === "number" && settings.pill.fontSize > 0
        ? settings.pill.fontSize
        : undefined;
    const pillMinWidth =
      typeof settings.pill.minWidth === "number" && settings.pill.minWidth > 0
        ? settings.pill.minWidth
        : undefined;
    const dialogInvoker = this.canUseHostDialog() ? this.openDateDialog : undefined;

    this.reactRoot.render(
      <DateRangeFilter
        presets={localizedPresets}
        dataMin={limitedMin}
        dataMax={limitedMax}
        openDialog={dialogInvoker}
        defaultPresetId={defaultPresetId}
        defaultRange={defaultRange}
        localeOverride={localeOverride}
        weekStartsOn={weekStartsOn}
        pillStyle={settings.pill.style}
        pillColors={{
          background: theme.pillBackground,
          border: theme.pillBorder,
          text: theme.pillText,
        }}
        pillFontSize={pillFontSize}
        pillMinWidth={pillMinWidth}
        showPresetLabels={showPresetLabels}
        showQuickApply={settings.buttons.showQuickApply ?? false}
        showClear={showClear}
        onChange={handleChange}
        isInteractive={this.allowInteractions}
        strings={this.strings}
      />,
    );

    const tooltipLocale = localeOverride ?? (typeof navigator !== "undefined" ? navigator.language : "en-US");
    const pillElement = this.rootElement.querySelector<HTMLElement>(".date-range-filter__pill");
    if (pillElement) {
      const tooltipSelection = select(pillElement);
      tooltipSelection.on(".tooltip", null);
      tooltipSelection.datum({});
      this.tooltipServiceWrapper.addTooltip(
        tooltipSelection,
        () => {
          if (!this.currentRange) {
            return [];
          }
          return [
            {
              displayName: this.strings.tooltip.label,
              value: formatRange(this.currentRange.from, this.currentRange.to, tooltipLocale),
            },
          ];
        },
      );
    } else {
      this.tooltipServiceWrapper.hide();
    }

    const shouldApplyDefault =
      !appliedRange && defaultRange && !rangesEqual(this.currentRange, defaultRange);
    if (!isResizeOnly && shouldApplyDefault) {
      this.currentRange = defaultRange;
      this.currentPresetId = defaultPresetId;
      this.applyRangeFilter(defaultRange);
    }
  }

  private handleBookmarkRestore = (_selectionIds: powerbi.extensibility.ISelectionId[]): void => {
    if (this.currentRange) {
      this.applyRangeFilter(this.currentRange);
    } else {
      this.syncSelectionForRange(undefined);
    }
  };
}

export default PresetDateSlicerVisual;
