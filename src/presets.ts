import { parseDateMath, DateMathResult } from './dateMath';
import { PresetContext, PresetDefinition } from './types';

export const BUILT_IN_PRESETS: PresetDefinition[] = [
  { key: 'today', label: 'Today', expression: 'TODAY' },
  { key: 'yesterday', label: 'Yesterday', expression: 'YESTERDAY' },
  { key: 'last7', label: 'Last 7 Days', expression: 'LAST 7 DAYS' },
  { key: 'last30', label: 'Last 30 Days', expression: 'LAST 30 DAYS' },
  { key: 'thisMonth', label: 'This Month', expression: 'THIS MONTH' },
  { key: 'lastMonth', label: 'Last Month', expression: 'LAST MONTH' },
  { key: 'qtd', label: 'Quarter to Date', expression: 'QTD' },
  { key: 'ytd', label: 'Year to Date', expression: 'YTD' },
  { key: 'lastYear', label: 'Last Year', expression: 'LAST YEAR' },
  { key: 'custom', label: 'Custom', expression: 'TODAY' },
];

export function mergePresetLists(
  base: PresetDefinition[],
  custom: PresetDefinition[],
): PresetDefinition[] {
  const map = new Map<string, PresetDefinition>();
  base.forEach((preset) => map.set(preset.key, preset));
  custom.forEach((preset) => map.set(preset.key, preset));
  return Array.from(map.values());
}

export function resolvePreset(
  preset: PresetDefinition,
  context: PresetContext,
): DateMathResult {
  return parseDateMath(preset.expression, context);
}
