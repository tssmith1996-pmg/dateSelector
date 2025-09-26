import { PresetDefinition, PresetContext, PresetResolutionResult } from "./types";
import { parseDateMath } from "./dateMath";

export const BUILT_IN_PRESETS: PresetDefinition[] = [
  {
    key: "today",
    label: "Today",
    expression: "TODAY",
    icon: "calendar_today",
    group: "Essentials",
  },
  {
    key: "lastWeek",
    label: "Last Week",
    expression: "LAST WEEK",
    icon: "calendar_range",
    group: "Essentials",
  },
  {
    key: "ytd",
    label: "Year to Date",
    expression: "YTD",
    icon: "auto_graph",
    group: "Essentials",
  },
  {
    key: "currentYear",
    label: "Current Year",
    expression: "CURRENT YEAR",
    icon: "event",
    group: "Essentials",
  },
];

export const resolvePreset = (
  preset: PresetDefinition,
  context: PresetContext
): PresetResolutionResult => {
  const result = parseDateMath(preset.expression, context);
  if (!result.range) {
    return { range: null, error: result.error ?? `Failed to resolve ${preset.key}` };
  }
  return result;
};

export const mergePresetLists = (
  builtIns: PresetDefinition[],
  custom: PresetDefinition[]
): PresetDefinition[] => {
  const seen = new Set<string>();
  const merged: PresetDefinition[] = [];
  [...builtIns, ...custom].forEach((preset) => {
    if (!preset.key || seen.has(preset.key)) {
      return;
    }
    seen.add(preset.key);
    merged.push(preset);
  });
  return merged;
};
