import { DatePreset, PRESETS, ensureWithinRange, normalizeRange } from "../date";
import { DateRange } from "../types/dateRange";

function findPresetById(presets: DatePreset[], id?: string | null): DatePreset | undefined {
  if (!id) {
    return undefined;
  }
  return presets.find((preset) => preset.id === id);
}

export function toPresetIdWithFallback(presets: DatePreset[], range: DateRange, today: Date) {
  for (const preset of presets) {
    const presetRange = normalizeRange(preset.from(today), preset.to(today));
    if (presetRange.from.getTime() === range.from.getTime() && presetRange.to.getTime() === range.to.getTime()) {
      return preset.id;
    }
  }
  return "custom";
}

export function resolveDefaultRange(
  presets: DatePreset[],
  dataMin: Date | undefined,
  dataMax: Date | undefined,
  today: Date,
  defaultPresetId?: string,
  defaultRange?: DateRange,
) {
  if (defaultRange) {
    const normalized = ensureWithinRange(normalizeRange(defaultRange.from, defaultRange.to), dataMin, dataMax);
    const presetExists = defaultPresetId ? presets.some((preset) => preset.id === defaultPresetId) : false;
    const presetId = presetExists ? defaultPresetId! : toPresetIdWithFallback(presets, normalized, today);
    return { range: normalized, presetId };
  }

  const fallbackCandidates: DatePreset[] = [];
  const provided = findPresetById(presets, defaultPresetId) ?? findPresetById(PRESETS, defaultPresetId);
  if (provided) {
    fallbackCandidates.push(provided);
  }
  const defaultPreset = findPresetById(presets, "last7") ?? findPresetById(PRESETS, "last7");
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
    const range = ensureWithinRange(normalizeRange(candidate.from(today), candidate.to(today)), dataMin, dataMax);
    return { range, presetId: candidate.id };
  }

  const normalized = ensureWithinRange(normalizeRange(today, today), dataMin, dataMax);
  return { range: normalized, presetId: defaultPresetId ?? "last7" };
}
