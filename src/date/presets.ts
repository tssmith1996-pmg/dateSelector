import {
  addDays,
  addMonths,
  addWeeks,
  addYears,
  endOfDay,
  endOfMonth,
  endOfWeek,
  endOfYear,
  startOfDay,
  startOfMonth,
  startOfQuarter,
  startOfWeek,
  startOfYear,
  toISODate,
} from "./utils";

export type DatePreset = {
  id: string;
  label: string;
  from: (today: Date) => Date;
  to: (today: Date) => Date;
};

export const PRESETS: DatePreset[] = [
  {
    id: "today",
    label: "Today",
    from: (t) => startOfDay(t),
    to: (t) => endOfDay(t),
  },
  {
    id: "yesterday",
    label: "Yesterday",
    from: (t) => startOfDay(addDays(t, -1)),
    to: (t) => endOfDay(addDays(t, -1)),
  },
  {
    id: "last7",
    label: "Last 7 Days",
    from: (t) => addDays(startOfDay(t), -6),
    to: (t) => endOfDay(t),
  },
  {
    id: "last30",
    label: "Last 30 Days",
    from: (t) => addDays(startOfDay(t), -29),
    to: (t) => endOfDay(t),
  },
  {
    id: "lastWeek",
    label: "Last Week",
    from: (t) => startOfWeek(addWeeks(t, -1), 1),
    to: (t) => endOfWeek(addWeeks(t, -1), 1),
  },
  {
    id: "thisMonth",
    label: "This Month",
    from: (t) => startOfMonth(t),
    to: (t) => endOfMonth(t),
  },
  {
    id: "lastMonth",
    label: "Last Month",
    from: (t) => startOfMonth(addMonths(t, -1)),
    to: (t) => endOfMonth(addMonths(t, -1)),
  },
  {
    id: "mtd",
    label: "Month to Date",
    from: (t) => startOfMonth(t),
    to: (t) => endOfDay(t),
  },
  {
    id: "qtd",
    label: "Quarter to Date",
    from: (t) => startOfQuarter(t),
    to: (t) => endOfDay(t),
  },
  {
    id: "ytd",
    label: "Year to Date",
    from: (t) => startOfYear(t),
    to: (t) => endOfDay(t),
  },
  {
    id: "lastYear",
    label: "Last Year",
    from: (t) => startOfYear(addYears(t, -1)),
    to: (t) => endOfYear(addYears(t, -1)),
  },
  {
    id: "custom",
    label: "Custom",
    from: (t) => startOfDay(t),
    to: (t) => endOfDay(t),
  },
];

export function resolvePresetRange(presetId: string, today: Date): { from: Date; to: Date } | null {
  const preset = PRESETS.find((p) => p.id === presetId);
  if (!preset) {
    return null;
  }
  return {
    from: preset.from(today),
    to: preset.to(today),
  };
}

export function toPresetId(from: Date, to: Date, today: Date): string {
  for (const preset of PRESETS) {
    const presetFrom = preset.from(today);
    const presetTo = preset.to(today);
    if (toISODate(presetFrom) === toISODate(from) && toISODate(presetTo) === toISODate(to)) {
      return preset.id;
    }
  }
  return "custom";
}
