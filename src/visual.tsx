import powerbi from "powerbi-visuals-api";
import * as React from "react";
import { createRoot, Root } from "react-dom/client";
import { Calendar } from "./calendar/Calendar";
import { PresetBar } from "./calendar/PresetBar";
import { ChipsBar } from "./calendar/ChipsBar";
import { Popup } from "./calendar/Popup";
import shellStyles from "./styles/shell.module.css";
import {
  CalendarLocalization,
  Chip,
  DateFieldScope,
  DateRange,
  FormattingSettings,
  HolidayDescriptor,
  PresetDefinition,
  PresetContext,
  SelectionMode,
  VisualPersistedState,
  PersistedPayload,
} from "./types";
import {
  parseDateMath,
  formatDateRange,
  serializeRange,
  deserializeRange,
} from "./dateMath";
import { BUILT_IN_PRESETS, mergePresetLists, resolvePreset } from "./presets";
import {
  AdvancedFilter,
  AdvancedFilterConditionOperators,
  AdvancedFilterLogicalOperators,
} from "powerbi-models";

import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualObjectInstance = powerbi.extensibility.VisualObjectInstance;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisual = powerbi.extensibility.visual.IVisual;
import DataView = powerbi.DataView;
import DataViewObjects = powerbi.DataViewObjects;
import DataViewCategoryColumn = powerbi.DataViewCategoryColumn;
import IVisualHost = powerbi.extensibility.visual.IVisualHost;

const defaultLocalization: CalendarLocalization = {
  months: [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ],
  shortMonths: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  weekdays: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
  shortWeekdays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  aria: {
    calendar: "Date picker",
    nextMonth: "Go to next month",
    previousMonth: "Go to previous month",
    selectRange: "Select range",
    selected: "Selected",
    today: "Today",
    clear: "Clear",
    apply: "Apply",
    cancel: "Cancel",
  },
};

const defaultFormatting: FormattingSettings = {
  displayMode: "popup",
  selectionMode: "range",
  allowMultiple: true,
  firstDayOfWeek: 1,
  minDate: undefined,
  maxDate: undefined,
  showPresetBar: true,
  presetList: BUILT_IN_PRESETS,
  defaultSelection: "LAST 7 DAYS",
  defaultPresetKey: undefined,
  weekendStyleEnabled: true,
  weekendColor: "#2E7CF6",
  holidayColor: "#D83B01",
  holidayList: "",
  calendarFontFamily: "Segoe UI",
  calendarFontSize: 14,
  calendarCellPadding: 6,
  calendarBorderRadius: 8,
  todayOutline: true,
  themeName: undefined,
};

const formatDisplayDate = (date: Date): string => {
  return new Intl.DateTimeFormat("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  }).format(date);
};

const parseInputDate = (value: string): Date | null => {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }
  const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    const [, year, month, day] = isoMatch;
    const parsed = new Date(Number(year), Number(month) - 1, Number(day));
    if (parsed.getFullYear() === Number(year) && parsed.getMonth() === Number(month) - 1 && parsed.getDate() === Number(day)) {
      return parsed;
    }
  }
  const usMatch = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (usMatch) {
    const [, month, day, year] = usMatch;
    const parsed = new Date(Number(year), Number(month) - 1, Number(day));
    if (parsed.getFullYear() === Number(year) && parsed.getMonth() === Number(month) - 1 && parsed.getDate() === Number(day)) {
      return parsed;
    }
  }
  return null;
};

const clampToScope = (date: Date, scope?: DateFieldScope): Date => {
  const normalized = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  let result = normalized;
  if (scope?.min && result < scope.min) {
    result = new Date(scope.min.getFullYear(), scope.min.getMonth(), scope.min.getDate());
  }
  if (scope?.max && result > scope.max) {
    result = new Date(scope.max.getFullYear(), scope.max.getMonth(), scope.max.getDate());
  }
  return result;
};

const normalizeRangeOrder = (range: DateRange): DateRange => {
  return range.start <= range.end ? range : { start: range.end, end: range.start };
};

const sameDay = (a: Date, b: Date): boolean => {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
};

interface VisualShellProps {
  ranges: DateRange[];
  displayMode: "popup" | "canvas";
  selectionMode: SelectionMode;
  allowMultiple: boolean;
  formatting: FormattingSettings;
  localization: CalendarLocalization;
  scope?: DateFieldScope;
  holidays: HolidayDescriptor[];
  presetOptions: PresetDefinition[];
  presetKey?: string;
  presetErrors: Record<string, string | undefined>;
  chips: Chip[];
  onRangesChange: (ranges: DateRange[]) => void;
  onRemoveChip: (id: string) => void;
  onPresetSelect: (preset: PresetDefinition | null) => void;
  onApply: () => void;
}

const VisualShell: React.FC<VisualShellProps> = ({
  ranges,
  displayMode,
  selectionMode,
  allowMultiple,
  formatting,
  localization,
  scope,
  holidays,
  presetOptions,
  presetKey,
  presetErrors,
  chips,
  onRangesChange,
  onRemoveChip,
  onPresetSelect,
  onApply,
}) => {
  const [isPopupOpen, setPopupOpen] = React.useState(displayMode === "canvas");

  const primaryRange = ranges[0] ?? null;
  const primaryRangeKey = primaryRange
    ? `${primaryRange.start.toISOString()}-${primaryRange.end.toISOString()}`
    : "none";

  const [startInput, setStartInput] = React.useState(
    primaryRange ? formatDisplayDate(primaryRange.start) : ""
  );
  const [endInput, setEndInput] = React.useState(
    primaryRange ? formatDisplayDate(primaryRange.end) : ""
  );

  React.useEffect(() => {
    if (!primaryRange) {
      setStartInput("");
      setEndInput("");
      return;
    }
    setStartInput(formatDisplayDate(primaryRange.start));
    setEndInput(formatDisplayDate(primaryRange.end));
  }, [primaryRangeKey]);

  React.useEffect(() => {
    if (displayMode === "canvas") {
      setPopupOpen(true);
    }
  }, [displayMode]);

  const commitPrimaryRange = React.useCallback(
    (range: DateRange) => {
      const normalized = normalizeRangeOrder(range);
      const remaining = allowMultiple ? ranges.slice(1) : [];
      onRangesChange(allowMultiple ? [normalized, ...remaining] : [normalized]);
      onPresetSelect(null);
      setStartInput(formatDisplayDate(normalized.start));
      setEndInput(formatDisplayDate(normalized.end));
    },
    [allowMultiple, ranges, onRangesChange, onPresetSelect]
  );

  const handleClear = React.useCallback(() => {
    onRangesChange([]);
    onPresetSelect(null);
    setStartInput("");
    setEndInput("");
  }, [onRangesChange, onPresetSelect]);

  const handleStartCommit = React.useCallback(() => {
    const trimmed = startInput.trim();
    if (!trimmed) {
      handleClear();
      return;
    }
    const parsed = parseInputDate(trimmed);
    if (!parsed) {
      setStartInput(primaryRange ? formatDisplayDate(primaryRange.start) : "");
      return;
    }
    const clamped = clampToScope(parsed, scope);
    const end = primaryRange ? primaryRange.end : clamped;
    commitPrimaryRange({ start: clamped, end });
  }, [startInput, handleClear, primaryRange, scope, commitPrimaryRange]);

  const handleEndCommit = React.useCallback(() => {
    const trimmed = endInput.trim();
    if (!trimmed) {
      handleClear();
      return;
    }
    const parsed = parseInputDate(trimmed);
    if (!parsed) {
      setEndInput(primaryRange ? formatDisplayDate(primaryRange.end) : "");
      return;
    }
    const clamped = clampToScope(parsed, scope);
    const start = primaryRange ? primaryRange.start : clamped;
    commitPrimaryRange({ start, end: clamped });
  }, [endInput, handleClear, primaryRange, scope, commitPrimaryRange]);

  const handleQuickPreset = React.useCallback(
    (key: string) => {
      const preset = presetOptions.find((item) => item.key === key);
      if (preset) {
        onPresetSelect(preset);
        return;
      }
      if (key === "today") {
        const today = new Date();
        commitPrimaryRange({ start: today, end: today });
      }
    },
    [presetOptions, onPresetSelect, commitPrimaryRange]
  );

  const manualInputRow = (
    <div className={shellStyles.inputRow}>
      <label className={shellStyles.dateField}>
        <span className={shellStyles.dateLabel}>Start date</span>
        <input
          type="text"
          inputMode="numeric"
          placeholder="MM/DD/YYYY"
          value={startInput}
          className={shellStyles.dateInput}
          onChange={(event) => setStartInput(event.target.value)}
          onBlur={handleStartCommit}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              handleStartCommit();
            }
          }}
        />
      </label>
      <span className={shellStyles.rangeArrow}>→</span>
      <label className={shellStyles.dateField}>
        <span className={shellStyles.dateLabel}>End date</span>
        <input
          type="text"
          inputMode="numeric"
          placeholder="MM/DD/YYYY"
          value={endInput}
          className={shellStyles.dateInput}
          onChange={(event) => setEndInput(event.target.value)}
          onBlur={handleEndCommit}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              handleEndCommit();
            }
          }}
        />
      </label>
    </div>
  );

  const calendarPanel = (
    <div className={shellStyles.calendarPanel}>
      <Calendar
        ranges={ranges}
        selectionMode={selectionMode}
        allowMultiple={allowMultiple}
        firstDayOfWeek={formatting.firstDayOfWeek}
        scope={scope}
        localization={localization}
        onChange={onRangesChange}
        holidays={holidays}
        weekendStyleEnabled={formatting.weekendStyleEnabled}
        weekendColor={formatting.weekendColor}
        holidayColor={formatting.holidayColor}
        fontFamily={formatting.calendarFontFamily}
        fontSize={formatting.calendarFontSize}
        cellPadding={formatting.calendarCellPadding}
        borderRadius={formatting.calendarBorderRadius}
        todayOutline={formatting.todayOutline}
      />
    </div>
  );

  const chipsBar = <ChipsBar chips={chips} onRemove={onRemoveChip} />;

  if (displayMode === "canvas") {
    const minActive = Boolean(primaryRange && scope?.min && sameDay(primaryRange.start, scope.min));
    const maxActive = Boolean(primaryRange && scope?.max && sameDay(primaryRange.end, scope.max));

    const boundClass = (active: boolean) =>
      [shellStyles.boundItem, !active ? shellStyles.boundItemInactive : ""].filter(Boolean).join(" ");

    return (
      <div className={shellStyles.canvasShell}>
        <aside className={shellStyles.sidebar}>
          <div className={shellStyles.sidebarHeader}>
            <span className={shellStyles.sidebarTitle}>Date Range</span>
            <div className={shellStyles.sidebarSummary}>
              {primaryRange ? formatDateRange(primaryRange) : "No selection applied"}
            </div>
            <div className={shellStyles.sidebarHint}>
              {allowMultiple ? "Multiple ranges allowed" : "Single range"}
            </div>
          </div>
          <div className={shellStyles.sidebarCard}>
            <div className={shellStyles.boundLabel}>Limits</div>
            <div className={shellStyles.boundsList}>
              <div className={boundClass(minActive)}>
                <span className={shellStyles.boundLabel}>Min Date</span>
                <span>{scope?.min ? formatDisplayDate(scope.min) : "Not set"}</span>
              </div>
              <div className={boundClass(maxActive)}>
                <span className={shellStyles.boundLabel}>Max Date</span>
                <span>{scope?.max ? formatDisplayDate(scope.max) : "Not set"}</span>
              </div>
            </div>
          </div>
          {formatting.showPresetBar ? (
            <PresetBar
              presets={presetOptions}
              selectedKey={presetKey}
              onSelect={(preset) => onPresetSelect(preset)}
              onClear={handleClear}
              errors={presetErrors}
              orientation="vertical"
              showClear={false}
            />
          ) : null}
        </aside>
        <div className={shellStyles.canvasMain}>
          <div className={shellStyles.toolbar}>
            <label className={shellStyles.modeToggle}>
              <input
                type="checkbox"
                className={shellStyles.modeCheckbox}
                checked={selectionMode === "range"}
                readOnly
                aria-label="Range mode"
              />
              <span>Date Range</span>
            </label>
            <div className={shellStyles.toolbarButtons}>
              <button
                type="button"
                className={shellStyles.subtleButton}
                onClick={() => handleQuickPreset("today")}
              >
                Today
              </button>
              <button type="button" className={shellStyles.ghostButton} onClick={handleClear}>
                Clear
              </button>
              <button type="button" className={shellStyles.primaryButton} onClick={onApply}>
                Apply
              </button>
            </div>
          </div>
          {manualInputRow}
          {calendarPanel}
          {chipsBar}
        </div>
      </div>
    );
  }

  const popupContent = (
    <div className={shellStyles.popupStack}>
      {formatting.showPresetBar ? (
        <PresetBar
          presets={presetOptions}
          selectedKey={presetKey}
          onSelect={(preset) => onPresetSelect(preset)}
          onClear={handleClear}
          errors={presetErrors}
          orientation="horizontal"
          showClear
        />
      ) : null}
      {manualInputRow}
      {calendarPanel}
      {chipsBar}
      <div className={shellStyles.popupActions}>
        <button
          type="button"
          className={shellStyles.subtleButton}
          onClick={() => handleQuickPreset("today")}
        >
          Today
        </button>
        <button type="button" className={shellStyles.ghostButton} onClick={handleClear}>
          Clear
        </button>
        <button type="button" className={shellStyles.primaryButton} onClick={onApply}>
          Apply
        </button>
      </div>
    </div>
  );

  return (
    <Popup
      anchorLabel={ranges.length > 0 ? formatDateRange(ranges[0]) : "Select dates"}
      isOpen={isPopupOpen}
      onToggle={() => setPopupOpen((prev) => !prev)}
    >
      {popupContent}
    </Popup>
  );
};

const parseHolidayList = (list: string | undefined): HolidayDescriptor[] => {
  if (!list) {
    return [];
  }
  return list
    .split(/[\n,]+/)
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const [date, ...labelParts] = entry.split("|");
      return {
        date: date.trim(),
        label: labelParts.join("|").trim() || undefined,
      };
    })
    .filter((item) => /\d{4}-\d{2}-\d{2}/.test(item.date));
};

const ensureRangeOrder = (range: DateRange): DateRange => {
  return range.start <= range.end ? range : { start: range.end, end: range.start };
};

export class DatePickerVisual implements IVisual {
  private host: IVisualHost;

  private container: HTMLElement;

  private root: Root;

  private formatting: FormattingSettings = { ...defaultFormatting };

  private localization: CalendarLocalization = defaultLocalization;

  private state: VisualPersistedState = {
    ranges: [],
    displayMode: defaultFormatting.displayMode,
    selectionMode: defaultFormatting.selectionMode,
    allowMultiple: defaultFormatting.allowMultiple,
    firstDayOfWeek: defaultFormatting.firstDayOfWeek,
    version: 1,
  };

  private presetOptions: PresetDefinition[] = BUILT_IN_PRESETS;

  private presetErrors: Record<string, string | undefined> = {};

  private currentScope?: DateFieldScope;

  private currentHolidays: HolidayDescriptor[] = [];

  private categoryColumn?: powerbi.DataViewCategoryColumn;

  constructor(options: VisualConstructorOptions) {
    this.host = options.host;
    this.container = options.element;
    this.root = createRoot(this.container);
  }

  public update(options: VisualUpdateOptions): void {
    const dataView = options.dataViews?.[0];
    this.formatting = this.readFormatting(dataView);
    this.presetOptions = mergePresetLists(BUILT_IN_PRESETS, this.formatting.presetList);
    this.presetErrors = {};

    this.state.displayMode = this.formatting.displayMode;
    this.state.selectionMode = this.formatting.selectionMode;
    this.state.allowMultiple = this.formatting.allowMultiple;
    this.state.firstDayOfWeek = this.formatting.firstDayOfWeek;

    const scope = this.readScope(dataView);
    const manualMin = this.formatting.minDate ? new Date(this.formatting.minDate) : undefined;
    const manualMax = this.formatting.maxDate ? new Date(this.formatting.maxDate) : undefined;
    const effectiveScope: DateFieldScope | undefined = scope
      ? { ...scope }
      : manualMin || manualMax
      ? { min: manualMin, max: manualMax }
      : undefined;
    if (effectiveScope) {
      if (manualMin && !isNaN(manualMin.getTime())) {
        effectiveScope.min = effectiveScope.min && effectiveScope.min > manualMin ? effectiveScope.min : manualMin;
      }
      if (manualMax && !isNaN(manualMax.getTime())) {
        effectiveScope.max = effectiveScope.max && effectiveScope.max < manualMax ? effectiveScope.max : manualMax;
      }
    }
    this.currentScope = effectiveScope;

    this.restoreState(dataView);

    if (this.state.ranges.length === 0 && this.formatting.defaultSelection) {
      const context: PresetContext = {
        today: new Date(),
        min: scope?.min,
        max: scope?.max,
        firstDayOfWeek: this.formatting.firstDayOfWeek,
      };
      const result = parseDateMath(this.formatting.defaultSelection, context);
      if (result.range) {
        this.state.ranges = [ensureRangeOrder(result.range)];
        this.state.presetKey = undefined;
        this.persistState();
      }
    }

    if (this.formatting.defaultPresetKey) {
      const preset = this.presetOptions.find((item) => item.key === this.formatting.defaultPresetKey);
      if (preset) {
        const context: PresetContext = {
          today: new Date(),
          min: scope?.min,
          max: scope?.max,
          firstDayOfWeek: this.formatting.firstDayOfWeek,
        };
        const resolved = resolvePreset(preset, context);
        if (resolved.range) {
          this.state.ranges = [ensureRangeOrder(resolved.range)];
          this.state.presetKey = preset.key;
          this.persistState();
        } else if (resolved.error) {
          this.presetErrors[preset.key] = resolved.error;
        }
      }
    }

    this.currentHolidays = parseHolidayList(this.formatting.holidayList);

    this.renderVisual();
  }

  private renderVisual(): void {
    const chips: Chip[] = this.state.ranges.map((range, index) => ({
      id: `${range.start.toISOString()}-${range.end.toISOString()}-${index}`,
      range,
      label: formatDateRange(range),
    }));

    this.root.render(
      <VisualShell
        ranges={this.state.ranges.map((range) => ({
          start: new Date(range.start),
          end: new Date(range.end),
        }))}
        displayMode={this.formatting.displayMode}
        selectionMode={this.formatting.selectionMode}
        allowMultiple={this.formatting.allowMultiple}
        formatting={this.formatting}
        localization={this.localization}
        scope={this.currentScope}
        holidays={this.currentHolidays}
        presetOptions={this.presetOptions}
        presetKey={this.state.presetKey}
        presetErrors={this.presetErrors}
        chips={chips}
        onRangesChange={(ranges) => this.handleRangesChange(ranges)}
        onRemoveChip={(id) => this.handleRemoveChip(id)}
        onPresetSelect={(preset) => this.handlePresetSelect(preset)}
        onApply={() => this.handleApplySelection()}
      />
    );
  }

  private handleRangesChange = (ranges: DateRange[]) => {
    this.state.ranges = ranges.map((range) => ensureRangeOrder(range));
    this.state.presetKey = undefined;
    this.persistState();
    this.renderVisual();
  };

  private handleRemoveChip = (id: string) => {
    this.state.ranges = this.state.ranges.filter((range, index) => {
      const key = `${range.start.toISOString()}-${range.end.toISOString()}-${index}`;
      return key !== id;
    });
    this.persistState();
    this.renderVisual();
  };

  private handlePresetSelect = (preset: PresetDefinition | null) => {
    if (!preset) {
      this.state.presetKey = undefined;
      this.persistState();
      this.renderVisual();
      return;
    }
    const context: PresetContext = {
      today: new Date(),
      min: this.currentScope?.min,
      max: this.currentScope?.max,
      firstDayOfWeek: this.formatting.firstDayOfWeek,
    };
    const result = resolvePreset(preset, context);
    if (result.range) {
      this.state.ranges = [ensureRangeOrder(result.range)];
      this.state.presetKey = preset.key;
      this.persistState();
      this.renderVisual();
    } else if (result.error) {
      this.presetErrors[preset.key] = result.error;
      this.renderVisual();
    }
  };

  private handleApplySelection = () => {
    if (!this.categoryColumn?.source?.queryName) {
      return;
    }

    if (this.state.ranges.length === 0) {
      this.host.applyJsonFilter(null, "general", "filter", powerbi.FilterAction.remove);
      return;
    }

    const queryName = this.categoryColumn.source.queryName;
    let table = "";
    let column = "";
    if (queryName.includes("[")) {
      table = queryName.substring(0, queryName.indexOf("["));
      column = queryName.substring(queryName.indexOf("[") + 1, queryName.indexOf("]"));
    } else {
      [table, column] = queryName.split(".");
    }
    if (!table || !column) {
      return;
    }

    const conditions = this.state.ranges.map((range) => ({
      operator: AdvancedFilterConditionOperators.Between,
      value: [
        range.start.toISOString().substring(0, 10),
        range.end.toISOString().substring(0, 10),
      ],
    }));

    const filter = new AdvancedFilter(
      { table, column },
      AdvancedFilterLogicalOperators.Or,
      conditions
    );

    this.host.applyJsonFilter(filter, "general", "filter", powerbi.FilterAction.merge);
  };

  private readFormatting(dataView?: DataView): FormattingSettings {
    const objects = dataView?.metadata?.objects ?? {};
    const general = objects.general as DataViewObjects | undefined;
    const presets = objects.presets as DataViewObjects | undefined;
    const styles = objects.calendarStyles as DataViewObjects | undefined;
    const holidays = objects.holidaySettings as DataViewObjects | undefined;

    const formatting: FormattingSettings = {
      ...defaultFormatting,
      displayMode: (general?.displayMode as "popup" | "canvas") ?? defaultFormatting.displayMode,
      selectionMode: (general?.selectionMode as SelectionMode) ?? defaultFormatting.selectionMode,
      allowMultiple: general?.allowMultiple === undefined ? defaultFormatting.allowMultiple : Boolean(general?.allowMultiple),
      firstDayOfWeek:
        typeof general?.firstDayOfWeek === "number"
          ? general?.firstDayOfWeek
          : defaultFormatting.firstDayOfWeek,
      minDate: (general?.minDate as string) ?? defaultFormatting.minDate,
      maxDate: (general?.maxDate as string) ?? defaultFormatting.maxDate,
      showPresetBar: presets?.showPresetBar === undefined ? defaultFormatting.showPresetBar : Boolean(presets?.showPresetBar),
      presetList: this.parsePresetList(presets?.presetJson as string | undefined),
      defaultSelection: (presets?.defaultSelection as string) ?? defaultFormatting.defaultSelection,
      defaultPresetKey: (presets?.defaultPresetKey as string) ?? undefined,
      weekendStyleEnabled:
        styles?.weekendStyleEnabled === undefined ? defaultFormatting.weekendStyleEnabled : Boolean(styles?.weekendStyleEnabled),
      weekendColor: (styles?.weekendColor as any)?.solid?.color ?? defaultFormatting.weekendColor,
      holidayColor: (styles?.holidayColor as any)?.solid?.color ?? defaultFormatting.holidayColor,
      holidayList: (holidays?.holidayList as string) ?? defaultFormatting.holidayList,
      calendarFontFamily: (styles?.fontFamily as string) ?? defaultFormatting.calendarFontFamily,
      calendarFontSize: typeof styles?.fontSize === "number" ? (styles?.fontSize as number) : defaultFormatting.calendarFontSize,
      calendarCellPadding:
        typeof styles?.cellPadding === "number" ? (styles?.cellPadding as number) : defaultFormatting.calendarCellPadding,
      calendarBorderRadius:
        typeof styles?.borderRadius === "number"
          ? (styles?.borderRadius as number)
          : defaultFormatting.calendarBorderRadius,
      todayOutline: styles?.todayOutline === undefined ? defaultFormatting.todayOutline : Boolean(styles?.todayOutline),
      themeName: (styles?.themeName as string) ?? defaultFormatting.themeName,
    };

    return formatting;
  }

  private parsePresetList(raw: string | undefined): PresetDefinition[] {
    if (!raw) {
      return [];
    }
    try {
      const value = JSON.parse(raw) as PresetDefinition[];
      return value.filter((item) => item.key && item.expression);
    } catch (error) {
      return [];
    }
  }

  private readScope(dataView?: DataView): DateFieldScope | undefined {
    const category = dataView?.categorical?.categories?.[0];
    if (!category) {
      this.categoryColumn = undefined;
      return undefined;
    }
    this.categoryColumn = category;
    const values = category.values as Date[];
    if (!values || values.length === 0) {
      return undefined;
    }
    const dates = values
      .map((value) => (value ? new Date(value as any) : undefined))
      .filter((value): value is Date => value instanceof Date && !isNaN(value.getTime()));
    if (dates.length === 0) {
      return undefined;
    }
    const min = new Date(Math.min(...dates.map((value) => value.getTime())));
    const max = new Date(Math.max(...dates.map((value) => value.getTime())));
    return { min, max };
  }

  private restoreState(dataView?: DataView) {
    const persisted = (dataView?.metadata?.objects?.state as any)?.payload as string | undefined;
    if (persisted) {
      try {
        const parsed = JSON.parse(persisted) as PersistedPayload;
        if (parsed.version === this.state.version) {
          this.state = {
            ...parsed,
            ranges: parsed.ranges.map(deserializeRange),
          };
        }
      } catch (error) {
        // ignore
      }
    }
  }

  private persistState() {
    const payload: PersistedPayload = {
      ...this.state,
      ranges: this.state.ranges.map(serializeRange),
    };
    this.host.persistProperties({
      merge: [
        {
          objectName: "state",
          selector: null,
          properties: {
            payload: JSON.stringify(payload),
          },
        },
      ],
    });
  }

  public enumerateObjectInstances(options: powerbi.EnumerateVisualObjectInstancesOptions) {
    const instances: VisualObjectInstance[] = [];
    if (options.objectName === "state") {
      instances.push({
        objectName: "state",
        selector: null,
        properties: {
          payload: JSON.stringify({
            ...this.state,
            ranges: this.state.ranges.map(serializeRange),
          } as PersistedPayload),
        },
      });
    }
    return instances;
  }
}
