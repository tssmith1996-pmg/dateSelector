import {
  addDays,
  endOfMonth,
  endOfYear,
  startOfMonth,
  startOfQuarter,
  startOfToday,
  startOfYear,
  subMonths,
  subYears,
} from 'date-fns';
import { clipToBounds, endOfLocalDay, startOfLocalDay } from './dateUtils';
import { DateRange, PresetKey } from './state';

export interface ResolvePresetOptions {
  today: Date;
  minDate?: Date;
  maxDate?: Date;
  weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  currentRange?: DateRange;
}

export interface PresetDefinition {
  key: PresetKey;
}

export const PRESET_ORDER: PresetKey[] = [
  'today',
  'yesterday',
  'last7',
  'last30',
  'thisMonth',
  'lastMonth',
  'qtd',
  'ytd',
  'lastYear',
  'custom',
];

export const PRESET_DEFINITIONS: PresetDefinition[] = PRESET_ORDER.map((key) => ({
  key,
}));

export function resolvePreset(
  key: PresetKey,
  options: ResolvePresetOptions,
): DateRange {
  const today = startOfLocalDay(options.today ?? startOfToday());
  const { minDate, maxDate } = options;

  let start: Date;
  let end: Date;

  switch (key) {
    case 'today':
      start = today;
      end = endOfLocalDay(today);
      break;
    case 'yesterday': {
      const day = startOfLocalDay(addDays(today, -1));
      start = day;
      end = endOfLocalDay(day);
      break;
    }
    case 'last7':
      start = startOfLocalDay(addDays(today, -6));
      end = endOfLocalDay(today);
      break;
    case 'last30':
      start = startOfLocalDay(addDays(today, -29));
      end = endOfLocalDay(today);
      break;
    case 'thisMonth':
      start = startOfLocalDay(startOfMonth(today));
      end = endOfLocalDay(endOfMonth(today));
      break;
    case 'lastMonth': {
      const anchor = subMonths(today, 1);
      start = startOfLocalDay(startOfMonth(anchor));
      end = endOfLocalDay(endOfMonth(anchor));
      break;
    }
    case 'qtd': {
      const anchor = startOfQuarter(today);
      start = startOfLocalDay(anchor);
      end = endOfLocalDay(today);
      break;
    }
    case 'ytd': {
      const anchor = startOfYear(today);
      start = startOfLocalDay(anchor);
      end = endOfLocalDay(today);
      break;
    }
    case 'lastYear': {
      const anchor = subYears(today, 1);
      start = startOfLocalDay(startOfYear(anchor));
      end = endOfLocalDay(endOfYear(anchor));
      break;
    }
    case 'custom':
    default: {
      const current = options.currentRange;
      if (current) {
        start = startOfLocalDay(current.start);
        end = endOfLocalDay(current.end);
      } else {
        start = today;
        end = endOfLocalDay(today);
      }
      break;
    }
  }

  return clipToBounds({ start, end }, minDate, maxDate);
}
