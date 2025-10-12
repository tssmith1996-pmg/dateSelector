import { resolvePreset } from './presets';
import { clipToBounds, deriveComparison } from './dateUtils';

export type PresetKey =
  | 'today'
  | 'yesterday'
  | 'last7'
  | 'last30'
  | 'thisMonth'
  | 'lastMonth'
  | 'qtd'
  | 'ytd'
  | 'lastYear'
  | 'custom';

export interface DateRange {
  start: Date;
  end: Date; // inclusive
}

export interface VisualState {
  main: DateRange;
  comparisonEnabled: boolean;
  comparison?: DateRange | null;
  activePreset: PresetKey;
  minDate?: Date;
  maxDate?: Date;
  weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6;
}

export interface FormattingSettings {
  defaultPreset: PresetKey;
  showComparisonToggle: boolean;
  comparisonDefaultOn: boolean;
  showQuickApply: boolean;
  showClear: boolean;
  minDate?: string;
  maxDate?: string;
  weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  locale: string;
  pillStyle: 'compact' | 'expanded';
  showPresetLabels: boolean;
}

export const DEFAULT_FORMATTING: FormattingSettings = {
  defaultPreset: 'last7',
  showComparisonToggle: true,
  comparisonDefaultOn: false,
  showQuickApply: true,
  showClear: true,
  weekStartsOn: 1,
  locale: 'en-US',
  pillStyle: 'compact',
  showPresetLabels: true,
};

export function createInitialState(
  formatting: FormattingSettings,
  today: Date = new Date(),
): VisualState {
  const resolved = resolvePreset(formatting.defaultPreset, {
    today,
    minDate: parseDateFromString(formatting.minDate),
    maxDate: parseDateFromString(formatting.maxDate),
    weekStartsOn: formatting.weekStartsOn,
  });

  const minDate = parseDateFromString(formatting.minDate);
  const maxDate = parseDateFromString(formatting.maxDate);
  const comparisonEnabled =
    formatting.showComparisonToggle && formatting.comparisonDefaultOn;

  return {
    main: resolved,
    comparisonEnabled,
    comparison: comparisonEnabled ? deriveComparison(resolved, minDate, maxDate) : null,
    activePreset: formatting.defaultPreset,
    minDate,
    maxDate,
    weekStartsOn: formatting.weekStartsOn,
  };
}

export function updateBounds(
  state: VisualState,
  formatting: FormattingSettings,
  today: Date = new Date(),
): VisualState {
  const minDate = parseDateFromString(formatting.minDate);
  const maxDate = parseDateFromString(formatting.maxDate);

  const main = clipToBounds(state.main, minDate, maxDate);
  const comparison = state.comparison
    ? clipToBounds(state.comparison, minDate, maxDate)
    : null;

  let activePreset = state.activePreset;
  let adjustedMain = main;

  if (state.activePreset !== 'custom') {
    adjustedMain = resolvePreset(state.activePreset, {
      today,
      minDate,
      maxDate,
      weekStartsOn: formatting.weekStartsOn,
    });
    activePreset = state.activePreset;
  }

  return {
    main: adjustedMain,
    comparisonEnabled: state.comparisonEnabled,
    comparison: state.comparisonEnabled
      ? comparison ?? deriveComparison(adjustedMain, minDate, maxDate)
      : null,
    activePreset,
    minDate,
    maxDate,
    weekStartsOn: formatting.weekStartsOn,
  };
}

export function applyPresetToState(
  state: VisualState,
  preset: PresetKey,
  formatting: FormattingSettings,
  today: Date = new Date(),
): VisualState {
  const minDate = parseDateFromString(formatting.minDate);
  const maxDate = parseDateFromString(formatting.maxDate);
  const main = resolvePreset(preset, {
    today,
    minDate,
    maxDate,
    weekStartsOn: formatting.weekStartsOn,
  });

  return {
    ...state,
    main,
    activePreset: preset,
    comparison: state.comparisonEnabled
      ? deriveComparison(main, minDate, maxDate)
      : null,
  };
}

export function withComparisonEnabled(
  state: VisualState,
  enabled: boolean,
): VisualState {
  const comparison = enabled
    ? state.comparison ?? deriveComparison(state.main, state.minDate, state.maxDate)
    : null;

  return {
    ...state,
    comparisonEnabled: enabled,
    comparison,
  };
}

export function updateMainRange(state: VisualState, range: DateRange): VisualState {
  const clipped = clipToBounds(range, state.minDate, state.maxDate);
  return {
    ...state,
    main: clipped,
    activePreset: 'custom',
    comparison: state.comparisonEnabled
      ? deriveComparison(clipped, state.minDate, state.maxDate)
      : state.comparison,
  };
}

export function updateComparisonRange(
  state: VisualState,
  range: DateRange,
): VisualState {
  if (!state.comparisonEnabled) {
    return state;
  }

  const clipped = clipToBounds(range, state.minDate, state.maxDate);
  return {
    ...state,
    comparison: clipped,
  };
}

export function parseDateFromString(value?: string): Date | undefined {
  if (!value) {
    return undefined;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}
