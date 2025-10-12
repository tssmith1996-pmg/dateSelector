import { addDays, differenceInCalendarDays, isAfter, isBefore } from 'date-fns';
import { DateRange, PresetKey } from './state';

export function startOfLocalDay(date: Date): Date {
  const next = new Date(date.getTime());
  next.setHours(0, 0, 0, 0);
  return next;
}

export function endOfLocalDay(date: Date): Date {
  const next = new Date(date.getTime());
  next.setHours(23, 59, 59, 999);
  return next;
}

export function clipToBounds(
  range: DateRange,
  min?: Date,
  max?: Date,
): DateRange {
  let start = startOfLocalDay(range.start);
  let end = endOfLocalDay(range.end);

  if (min) {
    const minStart = startOfLocalDay(min);
    if (isBefore(start, minStart)) {
      start = minStart;
    }
    if (isBefore(end, minStart)) {
      end = minStart;
    }
  }

  if (max) {
    const maxEnd = endOfLocalDay(max);
    if (isAfter(end, maxEnd)) {
      end = maxEnd;
    }
    if (isAfter(start, maxEnd)) {
      start = maxEnd;
    }
  }

  if (isAfter(start, end)) {
    start = startOfLocalDay(end);
  }

  return { start, end };
}

export function describe(range: DateRange, locale: string): string {
  const formatter = new Intl.DateTimeFormat(locale || 'en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  try {
    return formatter.formatRange(range.start, range.end);
  } catch (err) {
    const startText = formatter.format(range.start);
    const endText = formatter.format(range.end);
    return startText === endText ? startText : `${startText} – ${endText}`;
  }
}

const PRESET_LABELS: Record<PresetKey, string> = {
  today: 'Today',
  yesterday: 'Yesterday',
  last7: 'Last 7 days',
  last30: 'Last 30 days',
  thisMonth: 'This month',
  lastMonth: 'Last month',
  qtd: 'Quarter to date',
  ytd: 'Year to date',
  lastYear: 'Last year',
  custom: 'Custom',
};

export function labelForPreset(key: PresetKey): string {
  return PRESET_LABELS[key];
}

export function deriveComparison(
  range: DateRange,
  min?: Date,
  max?: Date,
): DateRange {
  const length = Math.max(differenceInCalendarDays(range.end, range.start) + 1, 1);
  const comparisonEnd = endOfLocalDay(addDays(range.start, -1));
  const comparisonStart = startOfLocalDay(addDays(comparisonEnd, -(length - 1)));

  return clipToBounds({ start: comparisonStart, end: comparisonEnd }, min, max);
}
