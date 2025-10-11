export type SelectionMode = "single" | "range" | "startOnly" | "endOnly";

export interface DateRange {
  start: Date;
  end: Date;
}

export interface SerializableDateRange {
  start: string;
  end: string;
}

export interface PresetDefinition {
  key: string;
  label: string;
  expression: string;
  icon?: string;
  group?: string;
  description?: string;
}

export interface PresetResolutionResult {
  range: DateRange | null;
  error?: string;
}

export interface HolidayDescriptor {
  date: string;
  label?: string;
}

export interface ThemeDefinition {
  name: string;
  description: string;
  tokens: Record<string, string | number>;
}

export interface FormattingSettings {
  displayMode: "popup" | "canvas";
  selectionMode: SelectionMode;
  allowMultiple: boolean;
  firstDayOfWeek: number;
  dualCalendarEnabled: boolean;
  minDate?: string;
  maxDate?: string;
  showPresetBar: boolean;
  presetList: PresetDefinition[];
  defaultSelection?: string;
  defaultPresetKey?: string;
  weekendStyleEnabled: boolean;
  weekendColor: string;
  holidayColor: string;
  holidayList?: string;
  calendarFontFamily: string;
  calendarFontSize: number;
  calendarCellPadding: number;
  calendarBorderRadius: number;
  todayOutline: boolean;
  themeName?: string;
}

export interface VisualPersistedState {
  ranges: DateRange[];
  presetKey?: string;
  displayMode: "popup" | "canvas";
  selectionMode: SelectionMode;
  allowMultiple: boolean;
  firstDayOfWeek: number;
  version: number;
}

export interface PersistedPayload extends Omit<VisualPersistedState, "ranges"> {
  ranges: SerializableDateRange[];
}

export interface CalendarLocalization {
  months: string[];
  shortMonths: string[];
  weekdays: string[];
  shortWeekdays: string[];
  aria: {
    calendar: string;
    nextMonth: string;
    previousMonth: string;
    selectRange: string;
    selected: string;
    today: string;
    clear: string;
    apply: string;
    cancel: string;
  };
}

export interface VisualUpdateOptionsLike {
  viewport: {
    height: number;
    width: number;
  };
}

export interface Chip {
  id: string;
  range: DateRange;
  label: string;
}

export interface DateFieldScope {
  min?: Date;
  max?: Date;
}

export interface PresetContext {
  today: Date;
  min?: Date;
  max?: Date;
  firstDayOfWeek: number;
}
